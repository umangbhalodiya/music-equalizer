export interface EmbeddedCoverArt {
  url: string
  mimeType: string
}

function syncsafeToInt(b0: number, b1: number, b2: number, b3: number) {
  return ((b0 & 0x7f) << 21) | ((b1 & 0x7f) << 14) | ((b2 & 0x7f) << 7) | (b3 & 0x7f)
}

function beToInt(bytes: Uint8Array) {
  return bytes.reduce((acc, byte) => (acc << 8) | byte, 0)
}

function latin1Decode(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
}

function findDescriptionEnd(body: Uint8Array, start: number, encoding: number) {
  if (encoding === 1 || encoding === 2) {
    for (let i = start; i < body.length - 1; i += 2) {
      if (body[i] === 0 && body[i + 1] === 0) return i + 2
    }
    return body.length
  }
  const end = body.indexOf(0, start)
  return end === -1 ? body.length : end + 1
}

function parseApicFrame(body: Uint8Array): EmbeddedCoverArt | null {
  let offset = 1 // skip text encoding byte
  const mimeEnd = body.indexOf(0, offset)
  if (mimeEnd === -1) return null
  const mimeType = latin1Decode(body.slice(offset, mimeEnd)) || 'image/jpeg'
  offset = mimeEnd + 1
  offset += 1 // picture type byte
  offset = findDescriptionEnd(body, offset, body[0])

  const imageData = body.slice(offset)
  if (imageData.length === 0) return null
  const blob = new Blob([imageData], { type: mimeType })
  return { url: URL.createObjectURL(blob), mimeType }
}

function parsePicFrame(body: Uint8Array): EmbeddedCoverArt | null {
  let offset = 1 // skip text encoding byte
  const format = latin1Decode(body.slice(offset, offset + 3)).toUpperCase()
  offset += 3
  offset += 1 // picture type byte
  offset = findDescriptionEnd(body, offset, body[0])

  const imageData = body.slice(offset)
  if (imageData.length === 0) return null
  const mimeType = format === 'PNG' ? 'image/png' : 'image/jpeg'
  const blob = new Blob([imageData], { type: mimeType })
  return { url: URL.createObjectURL(blob), mimeType }
}

/**
 * Reads embedded cover art (ID3v2 APIC/PIC frame) directly from an audio
 * file's bytes. Returns null when the file has no ID3v2 tag or no picture
 * frame (e.g. WAV, or MP3s tagged without art).
 */
export async function extractEmbeddedCoverArt(file: File): Promise<EmbeddedCoverArt | null> {
  const headerBytes = new Uint8Array(await file.slice(0, 10).arrayBuffer())
  if (headerBytes[0] !== 0x49 || headerBytes[1] !== 0x44 || headerBytes[2] !== 0x33) {
    return null // no "ID3" magic
  }

  const majorVersion = headerBytes[3]
  const tagSize = syncsafeToInt(headerBytes[6], headerBytes[7], headerBytes[8], headerBytes[9])
  const tagBytes = new Uint8Array(await file.slice(10, 10 + tagSize).arrayBuffer())

  if (majorVersion === 2) {
    let pos = 0
    while (pos + 6 <= tagBytes.length) {
      const id = latin1Decode(tagBytes.slice(pos, pos + 3))
      if (id === '\0\0\0') break
      const frameSize = beToInt(tagBytes.slice(pos + 3, pos + 6))
      const frameBody = tagBytes.slice(pos + 6, pos + 6 + frameSize)
      if (id === 'PIC') {
        const art = parsePicFrame(frameBody)
        if (art) return art
      }
      pos += 6 + frameSize
    }
    return null
  }

  let pos = 0
  while (pos + 10 <= tagBytes.length) {
    const id = latin1Decode(tagBytes.slice(pos, pos + 4))
    if (id === '\0\0\0\0') break
    const sizeBytes = tagBytes.slice(pos + 4, pos + 8)
    const frameSize =
      majorVersion >= 4
        ? syncsafeToInt(sizeBytes[0], sizeBytes[1], sizeBytes[2], sizeBytes[3])
        : beToInt(sizeBytes)
    const frameBody = tagBytes.slice(pos + 10, pos + 10 + frameSize)
    if (id === 'APIC') {
      const art = parseApicFrame(frameBody)
      if (art) return art
    }
    pos += 10 + frameSize
  }
  return null
}
