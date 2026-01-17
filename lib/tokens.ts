import { nanoid } from "nanoid";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Generates a short, URL-safe public ID for invoices.
 */
export function generatePublicId(): string {
    return nanoid(12);
}

/**
 * Generates a random edit token.
 */
export function generateEditToken(): string {
    return nanoid(32);
}

/**
 * Hashes a token using SHA-256.
 */
export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

/**
 * Safely compares two hashes using timing-safe equality.
 */
export function compareTokens(providedToken: string, storedHash: string): boolean {
    const providedHash = hashToken(providedToken);

    const providedBuffer = Buffer.from(providedHash, "hex");
    const storedBuffer = Buffer.from(storedHash, "hex");

    if (providedBuffer.length !== storedBuffer.length) {
        return false;
    }

    return timingSafeEqual(providedBuffer, storedBuffer);
}
