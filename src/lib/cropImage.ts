// src/lib/cropImage.ts
// Convierte el área de recorte seleccionada (de react-easy-crop) en un Blob final.

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = url
  })
}

export async function getCroppedImageBlob(
  imageSrc: string,
  cropArea: CropArea,
  outputSize = 400 // tamaño final en px (cuadrado) — suficiente para un logo nítido
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo crear el contexto del canvas')

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    outputSize,
    outputSize
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('No se pudo generar la imagen recortada'))
      },
      'image/webp',
      0.92
    )
  })
}
