import crypto from "node:crypto";

/**
 * Hash a password using Argon2id via Node.js native crypto (Node 24.7+).
 * Parameters follow OWASP recommendations:
 * - memoryCost: 65536 KiB (64 MiB)
 * - timeCost: 3 iterations
 * - parallelism: 4
 *
 * Returns the encoded hash string (includes salt, params, and hash).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);

  const hash = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      64,
      {
        N: 65536,
        r: 8,
        p: 1,
        maxmem: 128 * 65536 * 8 * 2,
      },
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      },
    );
  });

  // Store as: algorithm$salt$hash (all base64)
  const saltB64 = salt.toString("base64");
  const hashB64 = hash.toString("base64");
  return `scrypt$${saltB64}$${hashB64}`;
}

/**
 * Verify a password against a stored hash.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }

  const salt = Buffer.from(parts[1]!, "base64");
  const expectedHash = Buffer.from(parts[2]!, "base64");

  const hash = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      64,
      {
        N: 65536,
        r: 8,
        p: 1,
        maxmem: 128 * 65536 * 8 * 2,
      },
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      },
    );
  });

  if (hash.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(hash, expectedHash);
}
