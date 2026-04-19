// Steganography core algorithm implementation

export enum StegoMode {
  FIXED = 'FIXED',
  PATTERN_1 = 'PATTERN_1',
  PATTERN_2 = 'PATTERN_2',
}

// File header sizes (in bytes) to skip for common formats
const FILE_HEADER_SIZES: { [key: string]: number } = {
  // Images
  'image/jpeg': 20,      // JPEG header + initial markers
  'image/jpg': 20,
  'image/png': 33,       // PNG signature + IHDR chunk
  'image/gif': 13,       // GIF header
  'image/bmp': 54,       // BMP header
  'image/webp': 30,      // WebP header

  // Documents
  'application/pdf': 9,  // PDF header
  'application/zip': 30, // ZIP header

  // Audio
  'audio/wav': 44,       // WAV header
  'audio/mp3': 10,       // MP3 ID3 tag start
  'audio/mpeg': 10,

  // Video
  'video/mp4': 32,       // MP4 ftyp box
  'video/avi': 12,       // AVI RIFF header

  // Default for unknown types
  'default': 64,         // Safe default: skip first 64 bytes
};

/**
 * Detect file type from magic bytes and return recommended header skip size
 * @param data - The file data
 * @param mimeType - Optional MIME type hint
 * @returns Number of bytes to skip
 */
export function getHeaderSize(data: Uint8Array, mimeType?: string): number {
  // If MIME type is provided and known, use it
  if (mimeType && FILE_HEADER_SIZES[mimeType]) {
    return FILE_HEADER_SIZES[mimeType];
  }

  // Detect from magic bytes
  if (data.length < 4) return 0;

  // JPEG: FF D8 FF
  if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF) {
    return FILE_HEADER_SIZES['image/jpeg'];
  }

  // PNG: 89 50 4E 47
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) {
    return FILE_HEADER_SIZES['image/png'];
  }

  // GIF: 47 49 46
  if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) {
    return FILE_HEADER_SIZES['image/gif'];
  }

  // BMP: 42 4D
  if (data[0] === 0x42 && data[1] === 0x4D) {
    return FILE_HEADER_SIZES['image/bmp'];
  }

  // PDF: 25 50 44 46
  if (data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46) {
    return FILE_HEADER_SIZES['application/pdf'];
  }

  // ZIP: 50 4B 03 04
  if (data[0] === 0x50 && data[1] === 0x4B && data[2] === 0x03 && data[3] === 0x04) {
    return FILE_HEADER_SIZES['application/zip'];
  }

  // WAV: 52 49 46 46
  if (data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46) {
    return FILE_HEADER_SIZES['audio/wav'];
  }

  // Default: skip 64 bytes for safety
  return FILE_HEADER_SIZES['default'];
}

export interface StegoParams {
  startBit: number;        // S: starting bit position
  periodicity: number;     // L: bit interval
  mode: StegoMode;         // C: operation mode
  mimeType?: string;       // Optional MIME type for header detection
}

export interface ExtractionParams extends StegoParams {
  messageLength: number;   // Length of hidden message in bytes
}

// Bit manipulation utilities

/**
 * Read a specific bit from a Uint8Array
 * @param data - The byte array to read from
 * @param bitIndex - The bit position (0-based)
 * @returns 0 or 1
 */
export function getBit(data: Uint8Array, bitIndex: number): number {
  const byteIndex = Math.floor(bitIndex / 8);
  const bitOffset = bitIndex % 8;
  return (data[byteIndex] >> (7 - bitOffset)) & 1;
}

/**
 * Write a specific bit to a Uint8Array
 * @param data - The byte array to write to
 * @param bitIndex - The bit position (0-based)
 * @param value - The bit value (0 or 1)
 */
export function setBit(data: Uint8Array, bitIndex: number, value: number): void {
  const byteIndex = Math.floor(bitIndex / 8);
  const bitOffset = bitIndex % 8;

  if (value === 0) {
    // Clear the bit
    data[byteIndex] &= ~(1 << (7 - bitOffset));
  } else {
    // Set the bit
    data[byteIndex] |= (1 << (7 - bitOffset));
  }
}

/**
 * Get total number of bits in data
 * @param data - The byte array
 * @returns Total number of bits
 */
export function getLength(data: Uint8Array): number {
  return data.length * 8;
}

// Mode pattern generator

/**
 * Generate the next L value based on mode and current index
 * @param mode - The steganography mode
 * @param index - The current bit index in the message
 * @param initialL - The initial periodicity value
 * @returns The L value to use for this bit
 */
export function getNextL(mode: StegoMode, index: number, initialL: number): number {
  switch (mode) {
    case StegoMode.FIXED:
      return initialL;

    case StegoMode.PATTERN_1:
      const pattern1 = [8, 16, 28];
      return pattern1[index % pattern1.length];

    case StegoMode.PATTERN_2:
      const pattern2 = [8, 12, 16];
      return pattern2[index % pattern2.length];

    default:
      return initialL;
  }
}

// Steganography operations

/**
 * Embed a message into a carrier file using steganography
 * @param carrier - The carrier file as ArrayBuffer
 * @param message - The message to hide as ArrayBuffer
 * @param params - Steganography parameters
 * @returns Modified carrier as ArrayBuffer
 * @throws Error if carrier capacity is insufficient
 */
export function embed(
  carrier: ArrayBuffer,
  message: ArrayBuffer,
  params: StegoParams
): ArrayBuffer {
  const carrierData = new Uint8Array(carrier);
  const messageData = new Uint8Array(message);

  // Create a copy of carrier data to modify
  const modifiedCarrier = new Uint8Array(carrierData);

  // Detect header size and adjust starting position if needed
  const headerSize = getHeaderSize(carrierData, params.mimeType);
  const minStartBit = headerSize * 8; // Convert bytes to bits

  // Ensure we don't start in the header
  const actualStartBit = Math.max(params.startBit, minStartBit);

  if (actualStartBit !== params.startBit) {
    console.warn(
      `Starting bit adjusted from ${params.startBit} to ${actualStartBit} to skip file header (${headerSize} bytes)`
    );
  }

  const carrierBits = getLength(carrierData);
  const messageBits = getLength(messageData);

  // Check capacity with adjusted start bit
  const adjustedParams = { ...params, startBit: actualStartBit };
  const capacity = calculateCapacity(carrierBits, adjustedParams);
  if (messageBits > capacity) {
    throw new Error(
      `Insufficient capacity: carrier can hold ${capacity} bits, but message has ${messageBits} bits. ` +
      `(Header skip: ${headerSize} bytes, adjusted start: ${actualStartBit} bits)`
    );
  }

  let carrierBitIndex = actualStartBit;

  // Embed each bit of the message
  for (let messageBitIndex = 0; messageBitIndex < messageBits; messageBitIndex++) {
    const messageBit = getBit(messageData, messageBitIndex);

    // Set the bit in the carrier
    setBit(modifiedCarrier, carrierBitIndex, messageBit);

    // Calculate next L value based on mode
    const L = getNextL(params.mode, messageBitIndex, params.periodicity);

    // Move to next position
    carrierBitIndex += L;

    // Safety check
    if (carrierBitIndex >= carrierBits && messageBitIndex < messageBits - 1) {
      throw new Error('Ran out of carrier space during embedding');
    }
  }

  return modifiedCarrier.buffer;
}

/**
 * Calculate how many message bits can fit in the carrier
 * @param carrierBits - Total bits in carrier file
 * @param params - Steganography parameters
 * @returns Maximum number of message bits that can be embedded
 */
export function calculateCapacity(carrierBits: number, params: StegoParams): number {
  let capacity = 0;
  let currentPosition = params.startBit;
  let bitIndex = 0;

  // Simulate the embedding process to count available positions
  while (currentPosition < carrierBits) {
    capacity++;
    const L = getNextL(params.mode, bitIndex, params.periodicity);
    currentPosition += L;
    bitIndex++;
  }

  return capacity;
}

/**
 * Extract a hidden message from a modified file
 * @param modifiedFile - The modified carrier file as ArrayBuffer
 * @param params - Extraction parameters including message length
 * @returns Extracted message as ArrayBuffer
 */
export function extract(
  modifiedFile: ArrayBuffer,
  params: ExtractionParams
): ArrayBuffer {
  const modifiedData = new Uint8Array(modifiedFile);

  // Detect header size and adjust starting position if needed
  const headerSize = getHeaderSize(modifiedData, params.mimeType);
  const minStartBit = headerSize * 8; // Convert bytes to bits

  // Ensure we don't start in the header
  const actualStartBit = Math.max(params.startBit, minStartBit);

  if (actualStartBit !== params.startBit) {
    console.warn(
      `Starting bit adjusted from ${params.startBit} to ${actualStartBit} to skip file header (${headerSize} bytes)`
    );
  }

  const messageBits = params.messageLength * 8;

  // Create array to hold extracted message
  const messageBytes = new Uint8Array(params.messageLength);

  let carrierBitIndex = actualStartBit;

  // Extract each bit of the message
  for (let messageBitIndex = 0; messageBitIndex < messageBits; messageBitIndex++) {
    // Read the bit from the carrier
    const bit = getBit(modifiedData, carrierBitIndex);

    // Set the bit in the message
    setBit(messageBytes, messageBitIndex, bit);

    // Calculate next L value based on mode
    const L = getNextL(params.mode, messageBitIndex, params.periodicity);

    // Move to next position
    carrierBitIndex += L;
  }

  return messageBytes.buffer;
}
