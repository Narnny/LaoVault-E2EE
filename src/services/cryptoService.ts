/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enterprise Web Crypto API Service for End-to-End Encryption (AES-256-GCM)
 * Provides client-side zero-knowledge encryption, PBKDF2 key derivation,
 * and SHA-256 checksum verification.
 */

// Convert ArrayBuffer to Hex string
export function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to Uint8Array
export function hexToBuffer(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Convert ArrayBuffer to Base64 string
export function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string to ArrayBuffer
export function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Compute SHA-256 Hash of an ArrayBuffer
export async function calculateSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bufferToHex(hashBuffer);
}

// Compute SHA-256 Hash of a UTF-8 string
export async function calculateStringSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(text);
  return calculateSha256(buffer.buffer as ArrayBuffer);
}

/**
 * Derive an AES-GCM 256-bit CryptoKey from a user passphrase and salt
 * using PBKDF2 with 100,000 iterations and SHA-256.
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt arbitrary file buffer with AES-256-GCM.
 * Generates fresh 16-byte salt and 12-byte IV for every encryption.
 */
export async function encryptBuffer(
  plaintextBuffer: ArrayBuffer,
  passphrase: string
): Promise<{
  ciphertextBase64: string;
  ivHex: string;
  saltHex: string;
  sha256Checksum: string;
  cipherSize: number;
  plainSize: number;
}> {
  // 1. Calculate SHA-256 of original plaintext for future tamper validation
  const sha256Checksum = await calculateSha256(plaintextBuffer);

  // 2. Generate random salt (16 bytes) and IV (12 bytes for AES-GCM)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 3. Derive 256-bit key from passphrase
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  // 4. Encrypt using AES-GCM
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as ArrayBuffer
    },
    key,
    plaintextBuffer
  );

  return {
    ciphertextBase64: bufferToBase64(ciphertextBuffer),
    ivHex: bufferToHex(iv.buffer),
    saltHex: bufferToHex(salt.buffer),
    sha256Checksum,
    cipherSize: ciphertextBuffer.byteLength,
    plainSize: plaintextBuffer.byteLength
  };
}

/**
 * Decrypt AES-256-GCM ciphertext using passphrase, IV, and salt.
 * Verifies integrity against expected SHA-256 checksum.
 */
export async function decryptBuffer(
  ciphertextBase64: string,
  passphrase: string,
  ivHex: string,
  saltHex: string,
  expectedChecksum?: string
): Promise<{
  plaintextBuffer: ArrayBuffer;
  isIntegrityVerified: boolean;
  computedChecksum: string;
}> {
  try {
    const ciphertextBuffer = base64ToBuffer(ciphertextBase64);
    const salt = hexToBuffer(saltHex);
    const iv = hexToBuffer(ivHex);

    // Derive key
    const key = await deriveKeyFromPassphrase(passphrase, salt);

    // Decrypt
    const plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as ArrayBuffer
      },
      key,
      ciphertextBuffer
    );

    // Verify SHA-256
    const computedChecksum = await calculateSha256(plaintextBuffer);
    const isIntegrityVerified = expectedChecksum
      ? computedChecksum.toLowerCase() === expectedChecksum.toLowerCase()
      : true;

    return {
      plaintextBuffer,
      isIntegrityVerified,
      computedChecksum
    };
  } catch (err) {
    throw new Error('ການຖອດລະຫັດຜິດພາດ: ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ ຫຼື ຂໍ້ມູນຖືກແກ້ໄຂດັດແປງ');
  }
}

// Generate random secure passphrase
export function generateSecurePassphrase(length = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(x => charset[x % charset.length])
    .join('');
}
