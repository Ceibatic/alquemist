import { RandomReader, generateRandomString as osloGenerateRandomString } from "@oslojs/crypto/random";

const random: RandomReader = {
  read(bytes: Uint8Array) {
    crypto.getRandomValues(bytes);
  },
};

export function generateRandomString(length: number, chars: string): string {
  return osloGenerateRandomString(random, chars, length);
}

export function alphabet(pattern: string): string {
  if (pattern === "0-9") return "0123456789";
  if (pattern === "a-z") return "abcdefghijklmnopqrstuvwxyz";
  if (pattern === "A-Z") return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return pattern;
}
