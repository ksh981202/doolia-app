/**
 * 원본 해상도(픽셀 크기)를 100% 유지하면서 인쇄용 고화질 WebP로 변환합니다.
 * 기본값은 손실 압축 quality 0.94입니다. PNG 알파은 순백 배경으로 평탄화합니다.
 */
export const PRINT_WEBP_QUALITY = 0.94

export type ConvertToOptimizedWebPOptions = {
  quality?: number
}

function conversionError(file: File, reason: string) {
  return new Error(`WebP 변환 실패 (${file.name}): ${reason}`)
}

function resolveQuality(qualityOrOptions?: number | ConvertToOptimizedWebPOptions) {
  if (typeof qualityOrOptions === 'number') return qualityOrOptions
  return qualityOrOptions?.quality ?? PRINT_WEBP_QUALITY
}

export async function convertToOptimizedWebP(
  file: File,
  qualityOrOptions: number | ConvertToOptimizedWebPOptions = PRINT_WEBP_QUALITY,
): Promise<File> {
  const quality = resolveQuality(qualityOrOptions)

  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    throw conversionError(file, '브라우저 Canvas API를 사용할 수 없습니다.')
  }
  if (!isRasterImage(file)) {
    throw conversionError(file, 'JPG, PNG, WEBP만 변환할 수 있습니다.')
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    const fail = (reason: string) => {
      URL.revokeObjectURL(objectUrl)
      reject(conversionError(file, reason))
    }

    const succeed = (result: File) => {
      URL.revokeObjectURL(objectUrl)
      resolve(result)
    }

    img.onload = () => {
      const width = img.naturalWidth || img.width
      const height = img.naturalHeight || img.height
      if (!width || !height) {
        fail('이미지 크기를 읽지 못했습니다.')
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      if (canvas.width !== width || canvas.height !== height) {
        fail('브라우저 캔버스 한도를 초과했습니다.')
        return
      }

      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) {
        fail('Canvas 2D 컨텍스트를 만들지 못했습니다.')
        return
      }

      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size === 0) {
            fail('WebP Blob이 비어 있습니다.')
            return
          }
          const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
          succeed(
            new File([blob], newFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            }),
          )
        },
        'image/webp',
        quality,
      )
    }

    img.onerror = () => fail('이미지를 읽지 못했습니다. 파일이 손상되었거나 지원하지 않는 형식입니다.')
    img.src = objectUrl
  })
}

function isRasterImage(file: File) {
  return file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name)
}
