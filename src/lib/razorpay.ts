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
    // Return mock order if credentials not yet configured by user
    return {
      id: `order_mock_${Date.now()}`,
      entity: "order",
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: "INR",
      receipt,
      status: "created",
      attempts: 0,
      notes,
      created_at: Math.floor(Date.now() / 1000),
      isMock: true,
    };
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
  if (!isRazorpayConfigured) {
    // If running in development/mock mode without keys
    return true;
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
