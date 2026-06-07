import crypto from "node:crypto";

import { environment } from "./environment.server";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const INITIALIZATION_VECTOR_LENGTH_BYTES = 12;
const AUTHENTICATION_TAG_LENGTH_BYTES = 16;

function getKey(): Buffer {
  const base64Key = environment("IP_ADDRESS_ENCRYPTION_SECRET_KEY");
  if (!base64Key) {
    throw new Error("Missing IP_ADDRESS_ENCRYPTION_SECRET_KEY");
  }

  const key = Buffer.from(base64Key, "base64");
  if (key.length !== 32) {
    throw new Error(
      "IP_ADDRESS_ENCRYPTION_SECRET_KEY must be 32 bytes (base64)",
    );
  }

  return key;
}

export function getEncryptedIp({ request }: { request: Request }): string {
  const ip = extractIp(request);

  const encryptedBuffer = encrypt(ip);

  return encryptedBuffer.toString("base64");
}

export function decryptEncryptedIp({
  encryptedBase64,
}: {
  encryptedBase64: string;
}): string {
  const encryptedBuffer = Buffer.from(encryptedBase64, "base64");
  return decrypt(encryptedBuffer);
}

function encrypt(ip: string): Buffer {
  const key = getKey();
  const iv = crypto.randomBytes(INITIALIZATION_VECTOR_LENGTH_BYTES);

  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const cipherText = Buffer.concat([cipher.update(ip, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, cipherText]);
}

function decrypt(encrypted: Buffer): string {
  const key = getKey();

  if (
    encrypted.length <
    INITIALIZATION_VECTOR_LENGTH_BYTES + AUTHENTICATION_TAG_LENGTH_BYTES + 1
  ) {
    throw new Error("Invalid encrypted IP payload");
  }

  const iv = encrypted.subarray(0, INITIALIZATION_VECTOR_LENGTH_BYTES);
  const tag = encrypted.subarray(
    INITIALIZATION_VECTOR_LENGTH_BYTES,
    INITIALIZATION_VECTOR_LENGTH_BYTES + AUTHENTICATION_TAG_LENGTH_BYTES,
  );
  const cipherText = encrypted.subarray(
    INITIALIZATION_VECTOR_LENGTH_BYTES + AUTHENTICATION_TAG_LENGTH_BYTES,
  );

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const plain = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  return plain.toString("utf8");
}

function extractIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf && isValidIp(cf)) {
    return normalizeIp(cf);
  }

  const xReal = request.headers.get("x-real-ip");
  if (xReal && isValidIp(xReal)) {
    return normalizeIp(xReal);
  }

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const firstValid = xff
      .split(",")
      .map(v => v.trim())
      .find(element => isValidIp(element));

    if (firstValid) {
      return normalizeIp(firstValid);
    }
  }

  return "127.0.0.1";
}

function normalizeIp(ip: string) {
  return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}

function isValidIp(ip: string) {
  if (!ip) {
    return false;
  }

  const v4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  const v6 = /^[\d:A-Fa-f]{2,}$/;

  return v4.test(ip) || v6.test(ip) || ip.startsWith("::ffff:");
}
