import { Receiver } from "@upstash/qstash";

let receiverInstance: Receiver | null = null;

/**
 * Returns the singleton Upstash QStash Receiver initialized with signing keys.
 */
export function getQStashReceiver(): Receiver | null {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY?.trim();
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY?.trim();

  if (!currentSigningKey || !nextSigningKey) {
    return null;
  }

  if (!receiverInstance) {
    try {
      receiverInstance = new Receiver({
        currentSigningKey,
        nextSigningKey,
      });
    } catch (err) {
      console.error("[QStash Verifier] Receiver initialization failed:", err);
      return null;
    }
  }

  return receiverInstance;
}

/**
 * Verifies the incoming Upstash-Signature on raw webhook body.
 */
export async function verifyQStashSignature(
  signature: string,
  rawBody: string
): Promise<boolean> {
  const receiver = getQStashReceiver();
  if (!receiver) {
    console.warn("[QStash Verifier] Cannot verify signature: signing keys not configured.");
    return false;
  }

  try {
    await receiver.verify({
      signature,
      body: rawBody,
    });
    return true;
  } catch (err) {
    console.warn("[QStash Verifier] Signature verification failed:", err);
    return false;
  }
}
