"use client";

import Image from "next/image";
import CancelBookingButton from "@/components/customer/CancelBookingButton";
import WarrantyInvoiceModal from "@/components/customer/WarrantyInvoiceModal";
import CopyBadge from "@/components/customer/CopyBadge";
import { submitCustomerReview } from "@/app/actions/portal-actions";
import { BookingRecord, STATUS_CONFIG, getApplianceIcon } from "./customer-types";

interface CustomerBookingCardProps {
  booking: BookingRecord;
  isNewlyBooked?: boolean;
  otpResent: boolean;
  onResendOtp: (jobId: number) => Promise<void>;
}

export function CustomerBookingCard({
  booking: req,
  isNewlyBooked = false,
  otpResent,
  onResendOtp,
}: CustomerBookingCardProps) {
  const currentStatus = STATUS_CONFIG[req.status] || {
    label: req.status,
    badge: "bg-slate-100 text-slate-800 border-slate-200",
    dot: "bg-slate-400",
    step: 1,
    desc: "Request is being processed",
  };

  const canCancel = ["NEW", "MATCHING", "ASSIGNED"].includes(req.status);
  const icon = getApplianceIcon(req.service_title);

  return (
    <div
      className={`bg-white rounded-3xl border transition-all duration-300 shadow-xs hover:shadow-lg overflow-hidden ${
        isNewlyBooked
          ? "border-emerald-400 ring-4 ring-emerald-400/15"
          : "border-slate-200 hover:border-purple-300/80"
      }`}
    >
      {/* Newly Booked Banner */}
      {isNewlyBooked && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <span className="text-base">🎉</span>
            <span>Booking Confirmed! Certified technician is being matched in {req.city_name}.</span>
          </div>
          <span className="text-3xs uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
            Just Booked
          </span>
        </div>
      )}

      {/* Card Top Header */}
      <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Appliance Icon Badge */}
          <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl flex-shrink-0">
            {icon}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <CopyBadge text={req.lead_code} label={req.lead_code} />
              {req.brand_name && (
                <span className="text-2xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {req.brand_name}
                </span>
              )}
            </div>
            <div className="text-2xs text-slate-400 mt-1">
              Booked on{" "}
              {new Date(req.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentStatus.badge}`}
          >
            <span className={`w-2 h-2 rounded-full ${currentStatus.dot}`} />
            <span>{currentStatus.label}</span>
          </div>

          {/* Cancel Booking Action */}
          {canCancel && <CancelBookingButton leadId={req.id} />}
        </div>
      </div>

      {/* 4-Step Animated Progress Stepper */}
      {req.status !== "CANCELLED" && (
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-2 text-center relative">
            {[
              { step: 1, title: "Order Booked", icon: "📦", desc: "Received" },
              {
                step: 2,
                title: "Dispatched",
                icon: "🚗",
                desc: req.partner_name ? "Technician Assigned" : "Matching",
              },
              { step: 3, title: "In Progress", icon: "⚡", desc: "At Doorstep" },
              { step: 4, title: "Completed", icon: "✅", desc: "Tested & Verified" },
            ].map((s) => {
              const isDone = currentStatus.step >= s.step;
              const isCurrent = currentStatus.step === s.step;

              return (
                <div key={s.step} className="space-y-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isDone
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : isCurrent
                        ? "bg-purple-600 animate-pulse"
                        : "bg-slate-200"
                    }`}
                  />
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-xs">{s.icon}</span>
                    <span
                      className={`text-2xs font-bold hidden sm:inline ${
                        isDone ? "text-slate-900" : isCurrent ? "text-purple-700" : "text-slate-400"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  <div className="text-3xs text-slate-400 hidden md:block">{s.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Card Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem details, address, inspection photos */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <span>{req.service_title || "Appliance Repair"}</span>
            </h3>
            <div className="mt-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block text-3xs uppercase tracking-wider text-slate-400 mb-0.5">
                Problem Reported:
              </span>
              &ldquo;{req.problem_description}&rdquo;
            </div>
          </div>

          {/* Schedule & Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start space-x-2">
              <span className="text-sm">🗓️</span>
              <div>
                <div className="font-bold text-slate-800">Preferred Slot</div>
                <div className="text-slate-600 font-medium">
                  {req.preferred_date
                    ? new Date(req.preferred_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "Earliest Available"}{" "}
                  • {req.preferred_time || "Flexible"}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start space-x-2">
              <span className="text-sm">📍</span>
              <div>
                <div className="font-bold text-slate-800">Service Address</div>
                <div className="text-slate-600 line-clamp-1">
                  {req.customer_address}, {req.city_name}
                </div>
              </div>
            </div>
          </div>

          {/* QC Photo Proofs (Before & After) */}
          {(req.before_photo_url || req.after_photo_url) && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <span>📸</span>
                  <span>Doorstep QC Inspection Photos</span>
                </span>
                <span className="text-3xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Doorstep Proof
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {req.before_photo_url && (
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <a href={req.before_photo_url} target="_blank" rel="noreferrer" className="block relative h-28 w-full">
                      <Image
                        src={req.before_photo_url}
                        alt="Before Inspection"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </a>
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-3xs font-bold px-2 py-0.5 rounded-md">
                      🔍 Before Repair
                    </div>
                  </div>
                )}

                {req.after_photo_url && (
                  <div className="relative group rounded-2xl overflow-hidden border border-emerald-400 bg-emerald-50">
                    <a href={req.after_photo_url} target="_blank" rel="noreferrer" className="block relative h-28 w-full">
                      <Image
                        src={req.after_photo_url}
                        alt="After Repair"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </a>
                    <div className="absolute bottom-2 left-2 bg-emerald-700/90 backdrop-blur-xs text-white text-3xs font-bold px-2 py-0.5 rounded-md">
                      ✨ Fixed & Tested
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Partner, OTP Security, Invoices, Review */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
          <div>
            {req.partner_name ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                      {req.partner_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {req.partner_name}
                        </h4>
                        <span className="text-3xs bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          ✓ Verified
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-3xs text-slate-500 mt-0.5">
                        <span>⭐ 4.8 Rating</span>
                        <span>•</span>
                        <span>Repnexa Certified Specialist</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Call Button */}
                  {req.partner_phone && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-2xs text-slate-500 font-mono">
                        Phone: {req.partner_phone}
                      </span>
                      <a
                        href={`tel:${req.partner_phone}`}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-2xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <span>📞</span>
                        <span>Call Partner</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Doorstep Security OTP Card */}
                {req.completion_otp && req.status !== "COMPLETED" && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-slate-900 text-white shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xs font-black uppercase tracking-widest text-purple-300 flex items-center space-x-1">
                        <span>🔐</span>
                        <span>Doorstep Completion OTP</span>
                      </span>
                      <span className="text-3xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
                        Private Key
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/10">
                      <div>
                        <div className="text-3xs text-purple-200">Share after service is tested:</div>
                        <div className="text-xl font-mono font-black tracking-widest text-amber-300 mt-0.5">
                          {req.completion_otp}
                        </div>
                      </div>
                      <CopyBadge
                        text={req.completion_otp}
                        label="Copy"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                      />
                    </div>

                    <div className="flex items-center justify-between text-3xs text-purple-200">
                      <span>⚠️ Do not share before testing appliance</span>
                      {req.job_id && (
                        <button
                          type="button"
                          onClick={() => onResendOtp(req.job_id!)}
                          className="underline hover:text-white cursor-pointer font-bold"
                        >
                          {otpResent ? "✓ Email Sent!" : "Resend to Email"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Completed & Verified Invoices */}
                {req.status === "COMPLETED" && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xs font-black uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
                          <span>✓</span>
                          <span>Service Verified & Completed</span>
                        </span>
                        <span className="text-3xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                          Verified
                        </span>
                      </div>
                      <p className="text-2xs text-emerald-800 leading-relaxed">
                        Service has been successfully completed and tested by our certified technician.
                      </p>
                      
                      <div className="pt-2 border-t border-emerald-200/60">
                        <WarrantyInvoiceModal
                          data={{
                            leadCode: req.lead_code,
                            serviceTitle: req.service_title,
                            brandName: req.brand_name,
                            customerName: req.customer_name,
                            customerPhone: req.customer_phone,
                            customerAddress: req.customer_address,
                            cityName: req.city_name,
                            partnerName: req.partner_name,
                            partnerPhone: req.partner_phone,
                            completedDate: req.updated_at || req.created_at,
                            finalAmount: req.final_amount || req.selling_price || 499,
                          }}
                        />
                      </div>
                    </div>

                    {/* Verified Customer Feedback Form */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                      <span className="text-3xs font-black uppercase tracking-wider text-slate-400 block">
                        Rate Your Technician
                      </span>
                      <form
                        action={async (formData: FormData) => {
                          await submitCustomerReview(formData);
                        }}
                        className="space-y-2"
                      >
                        <input type="hidden" name="partnerId" value={req.assigned_partner_id} />
                        <input type="hidden" name="customerName" value={req.customer_name} />
                        <div className="flex items-center space-x-2">
                          <label className="text-2xs font-semibold text-slate-600">Experience:</label>
                          <select
                            name="rating"
                            defaultValue="5"
                            className="text-2xs p-1.5 border border-slate-300 rounded-lg bg-white font-bold text-amber-600 focus:outline-none focus:border-purple-600"
                          >
                            <option value="5">★★★★★ 5.0 (Flawless Service)</option>
                            <option value="4">★★★★☆ 4.0 (Good & Professional)</option>
                            <option value="3">★★★☆☆ 3.0 (Average)</option>
                            <option value="2">★★☆☆☆ 2.0 (Needs Improvement)</option>
                            <option value="1">★☆☆☆☆ 1.0 (Unsatisfied)</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          name="comment"
                          required
                          placeholder="Write a brief review for the technician..."
                          className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600"
                        />
                        <button
                          type="submit"
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-2xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Submit Verified Review ★
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                {req.status === "CANCELLED" ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    <span className="text-base block mb-1">✕</span>
                    <strong>Booking Cancelled</strong>
                    <p className="text-2xs text-rose-600 mt-1">
                      This request has been cancelled. No further visits will be scheduled.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-900 space-y-2">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs mx-auto animate-pulse">
                      📡
                    </div>
                    <div className="text-xs font-bold">Matching Certified Technician...</div>
                    <p className="text-2xs text-purple-700/80 max-w-xs mx-auto">
                      Our dispatch engine is notifying verified service experts in {req.city_name}. You will receive partner details shortly.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Trust Seal Footer */}
          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-3xs text-slate-400">
            <span className="flex items-center space-x-1">
              <span>🛡️</span>
              <span>Repnexa Genuine Spares Guarantee</span>
            </span>
            <span>Assistance: 1800-REPNEXA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
