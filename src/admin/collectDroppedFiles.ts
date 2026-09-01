type FileSystemEntryLike = {
  isFile: boolean
  isDirectory: boolean
  file?: (ok: (file: File) => void, err?: (error: DOMException) => void) => void
  createReader?: () => FileSystemDirectoryReaderLike
}

type FileSystemDirectoryReaderLike = {
  readEntries: (
    ok: (entries: FileSystemEntryLike[]) => void,
    err?: (error: DOMException) => void,
  ) => void
}

type DataTransferItemWithEntry = DataTransferItem & {
  webkitGetAsEntry?: () => FileSystemEntryLike | null
}

function fileIdentity(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

async function readAllDirectoryEntries(reader: FileSystemDirectoryReaderLike) {
  const collected: FileSystemEntryLike[] = []
  for (;;) {
    const batch = await new Promise<FileSystemEntryLike[]>((resolve, reject) => {
      reader.readEntries(resolve, reject)
    })
    if (!batch.length) break
    collected.push(...batch)
  }
  return collected
}

async function getFilesFromEntry(entry: FileSystemEntryLike): Promise<File[]> {
  if (entry.isFile && entry.file) {
    const file = await new Promise<File>((resolve, reject) => {
      entry.file!(resolve, reject)
    })
    return [file]
  }
  if (entry.isDirectory && entry.createReader) {
    const children = await readAllDirectoryEntries(entry.createReader())
    const nested = await Promise.all(children.map(getFilesFromEntry))
    return nested.flat()
  }
  return []
}

export async function filesFromDataTransfer(data: DataTransfer): Promise<File[]> {
  const rawFiles = Array.from(data.files ?? [])
  const entries: FileSystemEntryLike[] = []
  const itemFiles: File[] = []

  const items = data.items
  if (items) {
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index] as DataTransferItemWithEntry
      const entry = item.webkitGetAsEntry?.()
      if (entry) {
        entries.push(entry)
        continue
      }
      const file = item.getAsFile()
      if (file) itemFiles.push(file)
    }
  }

  const fromEntries = entries.length
    ? (await Promise.all(entries.map(getFilesFromEntry))).flat()
    : []

  const unique = new Map<string, File>()
  for (const file of [...fromEntries, ...itemFiles, ...rawFiles]) {
    unique.set(fileIdentity(file), file)
  }
  return [...unique.values()]
}
