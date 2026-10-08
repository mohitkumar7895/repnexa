import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

export const isRazorpayConfigured = Boolean(
  keyId &&
  keySecret &&
  !keyId.includes("YourKeyIdHere") &&
  !keySecret.includes("YourKeySecretHere")
);

export function getRazorpayClient(): Razorpay | null {
  if (!isRazorpayConfigured) return null;
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function createRazorpayOrder({
  amountInRupees,
  receipt,
  notes = {},
}: {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const amountInPaise = Math.round(amountInRupees * 100);

  const client = getRazorpayClient();
  if (!client) {
    throw new Error("Razorpay is not set up. Add the live keys before taking a payment.");
  }

  const order = await client.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes,
  });

  return { ...order, isMock: false };
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!isRazorpayConfigured || !signature) {
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}
