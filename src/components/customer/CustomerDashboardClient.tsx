"use client";

import { useState } from "react";
import Link from "next/link";
import { sendJobOtpToEmail } from "@/app/actions/portal-actions";
import { BookingRecord } from "./customer-types";
import { CustomerBookingCard } from "./CustomerBookingCard";
import { StatCard } from "@/components/ui/StatCard";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/contact";

export type { BookingRecord };

export default function CustomerDashboardClient({
  requests,
  initialQuery = "",
  leadCodeParam = "",
}: {
  requests: BookingRecord[];
  initialQuery?: string;
  leadCodeParam?: string;
}) {
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "CANCELLED">("ALL");
  const [localSearch, setLocalSearch] = useState("");
  const [otpResent, setOtpResent] = useState<number | null>(null);

  const handleResendOtp = async (jobId: number) => {
    await sendJobOtpToEmail(jobId);
    setOtpResent(jobId);
    setTimeout(() => setOtpResent(null), 3000);
  };

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    // Tab filter
    if (activeTab === "ACTIVE") {
      if (["COMPLETED", "CANCELLED"].includes(req.status)) return false;
    } else if (activeTab === "COMPLETED") {
      if (req.status !== "COMPLETED") return false;
    } else if (activeTab === "CANCELLED") {
      if (req.status !== "CANCELLED") return false;
    }

    // Local quick search filter
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase().trim();
      const matchCode = req.lead_code.toLowerCase().includes(q);
      const matchPhone = req.customer_phone.includes(q);
      const matchService = req.service_title?.toLowerCase().includes(q);
      const matchBrand = req.brand_name?.toLowerCase().includes(q);
      const matchTech = req.partner_name?.toLowerCase().includes(q);
      return matchCode || matchPhone || matchService || matchBrand || matchTech;
    }
    return true;
  });

  const activeCount = requests.filter((r) => !["COMPLETED", "CANCELLED"].includes(r.status)).length;
  const completedCount = requests.filter((r) => r.status === "COMPLETED").length;
  const cancelledCount = requests.filter((r) => r.status === "CANCELLED").length;
  const ratings = requests
    .map((req) => Number(req.partner_rating))
    .filter((value) => Number.isFinite(value) && value > 0);
  const satisfaction = ratings.length
    ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Bookings" value={requests.length} subtext="Tracked orders" badge="All" badgeColor="purple" />
        <StatCard
          label="Active"
          value={activeCount}
          subtext="Technicians in action"
          badge={activeCount > 0 ? "Live" : "Clear"}
          badgeColor="orange"
          valueColor="text-amber-700 dark:text-amber-300"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          subtext="Verified and tested"
          badge="Done"
          badgeColor="emerald"
          valueColor="text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          label="Satisfaction"
          value={satisfaction ? `${satisfaction}/5` : "—"}
          subtext={satisfaction ? "Average partner rating" : "No rated visits yet"}
          badge="Reviews"
          badgeColor="slate"
          valueColor="text-indigo-700 dark:text-indigo-300"
        />
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-2.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: "All", count: requests.length },
            { id: "ACTIVE", label: "Active", count: activeCount },
            { id: "COMPLETED", label: "Completed", count: completedCount },
            { id: "CANCELLED", label: "Cancelled", count: cancelledCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-3xs px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Local Quick Filter */}
        <div className="w-full sm:w-64 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">
            ⚡
          </span>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter bookings..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:border-purple-600 transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Booking Cards List */}
      <div className="space-y-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mx-auto mb-4">
              🔍
            </div>
            <h2 className="text-base font-bold text-slate-800">No Service Bookings Found</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-6">
              {localSearch
                ? `No bookings match your filter "${localSearch}". Try clearing the filter.`
                : initialQuery
                ? `No bookings found for "${initialQuery}". Check your phone number or lead code.`
                : "Enter your mobile number or booking code above to see only your visits."}
            </p>
            <Link
              href="/book"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 via-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition-opacity"
            >
              <span>+</span>
              <span>Book Expert Doorstep Repair</span>
            </Link>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <CustomerBookingCard
              key={req.id}
              booking={req}
              isNewlyBooked={leadCodeParam === req.lead_code}
              otpResent={otpResent === req.job_id}
              onResendOtp={handleResendOtp}
            />
          ))
        )}
      </div>

      {/* Doorstep Trust & Support Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-3xs uppercase tracking-widest font-black text-purple-300 px-2.5 py-0.5 rounded-full bg-purple-500/20">
              Repnexa Customer Promise
            </span>
            <h3 className="text-lg sm:text-xl font-black mt-2">Need Immediate Support or Reschedule?</h3>
            <p className="text-xs text-slate-300 max-w-lg">
              Call helpdesk. Keep your booking code.
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              className="px-5 py-2.5 rounded-2xl bg-white text-slate-950 font-black text-xs shadow-md hover:bg-slate-100 transition-colors"
            >
              📞 {SUPPORT_PHONE_DISPLAY}
            </a>
            <Link
              href="/book"
              className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md transition-colors"
            >
              + Book Another Repair
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
