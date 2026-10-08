"use client";

import React, { useState } from "react";
import { createWalletOrderAction, verifyAndApplyWalletPayment } from "@/app/actions/payment-actions";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayTopupButtonProps {
  partnerId: number;
  partnerName?: string;
  onSuccess?: () => void;
}

export function RazorpayTopupButton({ partnerId, partnerName = "Service Partner", onSuccess }: RazorpayTopupButtonProps) {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const quickPills = [500, 1000, 2000, 5000];

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleTopup = async () => {
    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (!finalAmount || finalAmount < 100) {
      setFeedback({ type: "error", text: "Minimum recharge amount is ₹100." });
      return;
    }

    setFeedback(null);
    setIsLoading(true);

    try {
      const orderRes = await createWalletOrderAction(partnerId, finalAmount);
      if (!orderRes.success || !orderRes.orderId) {
        throw new Error(orderRes.error || "Could not generate payment order.");
      }

      const scriptLoaded = await loadRazorpayScript();

      if (orderRes.isConfigured && scriptLoaded && window.Razorpay) {
        const options = {
          key: orderRes.keyId,
          amount: orderRes.amountInPaise,
          currency: orderRes.currency || "INR",
          name: "Repnexa Partner Services",
          description: `Float Recharge for ${partnerName}`,
          image: "/icon.png",
          order_id: orderRes.orderId,
          prefill: {
            name: partnerName,
          },
          theme: {
            color: "#7c3aed", // Repnexa purple
          },
          handler: async function (response: any) {
            setIsLoading(true);
            const verifyRes = await verifyAndApplyWalletPayment({
              partnerId,
              amount: finalAmount,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            setIsLoading(false);
            if (verifyRes.success) {
              setFeedback({ type: "success", text: verifyRes.message || "Payment credited successfully!" });
              if (onSuccess) onSuccess();
            } else {
              setFeedback({ type: "error", text: verifyRes.error || "Payment verification failed." });
            }
          },
          modal: {
            ondismiss: function () {
              setIsLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setIsLoading(false);
        setFeedback({ type: "error", text: "Payment window could not open. Online payment is not set up." });
      }
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({ type: "error", text: err.message || "Payment initiation failed." });
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Select Pills */}
      <div>
        <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Select Recharge Amount
        </label>
        <div className="grid grid-cols-4 gap-2">
          {quickPills.map((p) => {
            const isSelected = !customAmount && amount === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setAmount(p);
                  setCustomAmount("");
                }}
                className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-slate-50"
                }`}
              >
                ₹{p.toLocaleString("en-IN")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Amount */}
      <div>
        <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
          Or Enter Custom Amount (₹)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
            ₹
          </span>
          <input
            type="number"
            min="100"
            step="100"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="e.g. 3500"
            className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
          />
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-start space-x-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <span>{feedback.type === "success" ? "✓" : "⚠️"}</span>
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Checkout CTA */}
      <button
        type="button"
        disabled={isLoading}
        onClick={handleTopup}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            <span>Processing Gateway...</span>
          </>
        ) : (
          <>
            <span>💳 Pay ₹{(customAmount ? Number(customAmount) : amount).toLocaleString("en-IN")} via Razorpay / UPI</span>
            <span>➔</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-between text-2xs text-slate-400 pt-1">
        <span>Instant UPI / Cards / NetBanking</span>
        <span className="font-mono text-purple-600 font-bold">100% Secure Checkout</span>
      </div>
    </div>
  );
}
