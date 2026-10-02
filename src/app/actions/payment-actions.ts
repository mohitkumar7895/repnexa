"use server";

import { db } from "@/lib/db";
import { createRazorpayOrder, verifyRazorpaySignature, isRazorpayConfigured } from "@/lib/razorpay";
import { revalidatePath } from "next/cache";

export async function createWalletOrderAction(partnerId: number, amount: number) {
  if (amount < 100) {
    return { success: false, error: "Minimum recharge amount is ₹100" };
  }

  try {
    const [pRows]: any = await db.query("SELECT id, business_name, partner_code FROM partners WHERE id = ?", [partnerId]);
    if (pRows.length === 0) {
      return { success: false, error: "Partner account not found" };
    }

    const partner = pRows[0];
    const receipt = `RCPT-${partner.partner_code}-${Date.now().toString().slice(-6)}`;

    const order = await createRazorpayOrder({
      amountInRupees: amount,
      receipt,
      notes: {
        partnerId: String(partnerId),
        partnerCode: partner.partner_code,
        purpose: "Partner Float Recharge",
      },
    });

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_YourKeyIdHere";

    return {
      success: true,
      orderId: order.id,
      amountInPaise: order.amount,
      currency: order.currency,
      keyId,
      isConfigured: isRazorpayConfigured,
      partnerName: partner.business_name,
    };
  } catch (error: any) {
    console.error("Order creation error:", error);
    return { success: false, error: error.message || "Failed to create payment order" };
  }
}

export async function verifyAndApplyWalletPayment({
  partnerId,
  amount,
  orderId,
  paymentId,
  signature,
}: {
  partnerId: number;
  amount: number;
  orderId: string;
  paymentId: string;
  signature?: string;
}) {
  try {
    // 1. Signature Verification
    if (signature) {
      const isValid = verifyRazorpaySignature({
        orderId,
        paymentId,
        signature,
      });

      if (!isValid) {
        return { success: false, error: "Payment verification failed. Invalid transaction signature." };
      }
    }

    // 2. Prevent duplicate credit by checking paymentId in transactions
    const [existingTxn]: any = await db.query(
      "SELECT id FROM wallet_transactions WHERE reference_id = ? LIMIT 1",
      [paymentId]
    );

    if (existingTxn.length > 0) {
      return { success: true, message: "Payment was already credited to your float balance." };
    }

    // 3. Update Partner Balance
    const [pRows]: any = await db.query("SELECT id, wallet_balance FROM partners WHERE id = ?", [partnerId]);
    if (pRows.length === 0) {
      return { success: false, error: "Partner account not found" };
    }

    const before = Number(pRows[0].wallet_balance || 0);
    const after = before + Number(amount);

    await db.query("UPDATE partners SET wallet_balance = ? WHERE id = ?", [after, partnerId]);

    // 4. Ledger Entry
    const txnCode = `TXN-RZP-${Date.now().toString().slice(-6)}`;
    await db.query(
      `INSERT INTO wallet_transactions (transaction_code, partner_id, type, amount, balance_before, balance_after, description, reference_id, status)
       VALUES (?, ?, 'CREDIT', ?, ?, ?, ?, ?, 'success')`,
      [
        txnCode,
        partnerId,
        amount,
        before,
        after,
        `Razorpay Online Recharge (ID: ${paymentId})`,
        paymentId,
      ]
    );

    revalidatePath("/partner/wallet");
    revalidatePath("/partner/dashboard");
    revalidatePath("/super-admin/wallet");

    return {
      success: true,
      newBalance: after,
      message: `Payment successful! ₹${amount.toLocaleString("en-IN")} credited. New balance: ₹${after.toLocaleString("en-IN")}`,
    };
  } catch (error: any) {
    console.error("Payment settlement error:", error);
    return { success: false, error: error.message || "Failed to process payment settlement" };
  }
}
