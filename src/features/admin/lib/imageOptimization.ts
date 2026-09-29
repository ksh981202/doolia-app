/**
 * 원본 해상도(픽셀 크기)를 100% 유지하면서 인쇄용 초고화질 WebP 포맷으로 변환합니다.
 * 브라우저 canvas 한도를 넘는 이미지는 원본 파일을 그대로 반환합니다.
 */
export const PRINT_WEBP_QUALITY = 0.94

export async function convertToLosslessWebP(file: File, quality = PRINT_WEBP_QUALITY): Promise<File> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') return file
  if (!isRasterImage(file)) return file

  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    const finish = (result: File) => {
      URL.revokeObjectURL(objectUrl)
      resolve(result)
    }

    img.onload = () => {
      const width = img.naturalWidth || img.width
      const height = img.naturalHeight || img.height
      if (!width || !height) {
        finish(file)
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) {
        finish(file)
        return
      }

      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size === 0) {
            finish(file)
            return
          }
          const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
          finish(
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

    img.onerror = () => finish(file)
    img.src = objectUrl
  })
}

function isRasterImage(file: File) {
  return file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name)
}
