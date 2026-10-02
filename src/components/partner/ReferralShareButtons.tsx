"use client";

import { useState } from "react";

interface ReferralShareButtonsProps {
  referralCode: string;
  partnerName: string;
}

export function ReferralShareButtons({ referralCode, partnerName }: ReferralShareButtonsProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://repnexa.com";
  const inviteUrl = `${baseUrl}/become-partner?ref=${referralCode}`;

  const shareText = `Namaste! Join Repnexa as an Appliance Service Partner with low commission & daily high-paying leads in your city. Register with my invite code: ${referralCode}\n${inviteUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Repnexa Service Partner Network",
          text: `Join Repnexa with invite code ${referralCode} to get ₹100 welcome bonus & daily service leads.`,
          url: inviteUrl,
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-4">
      {/* Code Display & Copy Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-white/10 rounded-xl border border-white/20">
        <div className="flex-1">
          <span className="text-3xs uppercase tracking-wider text-orange-200 block font-semibold">
            Your Unique Invite Code
          </span>
          <span className="text-lg font-mono font-black tracking-wider text-white">
            {referralCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            type="button"
            className="px-3.5 py-2 rounded-lg bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-xs cursor-pointer"
          >
            {copiedCode ? "✓ Code Copied!" : "📋 Copy Code"}
          </button>
          <button
            onClick={handleCopyLink}
            type="button"
            className="px-3.5 py-2 rounded-lg bg-orange-500/40 text-white font-bold text-xs hover:bg-orange-500/60 border border-white/20 transition-all cursor-pointer"
          >
            {copiedLink ? "✓ Link Copied!" : "🔗 Copy Link"}
          </button>
        </div>
      </div>

      {/* Share Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <span className="text-base">💬</span>
          <span>Share on WhatsApp (+₹100 / Tech)</span>
        </a>

        <button
          onClick={handleNativeShare}
          type="button"
          className="px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
        >
          📱 Share via App
        </button>
      </div>
    </div>
  );
}
