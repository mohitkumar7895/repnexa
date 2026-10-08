"use client";

import { useState } from "react";
import Image from "next/image";
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY } from "@/lib/contact";

interface InvoiceData {
  leadCode: string;
  serviceTitle: string;
  brandName?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  cityName: string;
  partnerName: string;
  partnerPhone?: string;
  completedDate: string;
  finalAmount?: number;
  lineItems?: { name: string; qty: number; price: number }[];
}

export default function WarrantyInvoiceModal({ data }: { data: InvoiceData }) {
  const [isOpen, setIsOpen] = useState(false);

  const lines = data.lineItems || [];
  const lineTotal = lines.reduce((sum, line) => sum + Number(line.qty) * Number(line.price), 0);
  const amount = lineTotal > 0 ? lineTotal : (Number(data.finalAmount) > 0 ? Number(data.finalAmount) : 0);

  const completionDateObj = new Date(data.completedDate || Date.now());

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-2xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
      >
        <span>📄</span>
        <span>Open bill</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="relative w-28 h-8">
                  <Image src="/logo.png" alt="Repnexa" fill className="object-contain object-left" />
                </div>
                <span className="text-3xs font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
                  Tax Invoice
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable Invoice Container */}
            <div id="printable-invoice" className="space-y-6 text-slate-800">
              
              {/* Meta info */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <div className="text-3xs font-bold uppercase tracking-wider text-slate-400">Invoice Number</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">INV-{data.leadCode.replace("LEAD-", "")}</div>
                  <div className="text-3xs text-slate-500 mt-1">
                    Date: <span className="font-semibold text-slate-700">{formatDate(completionDateObj)}</span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-3xs font-bold uppercase tracking-wider text-slate-400">Repnexa Care Network</div>
                  <div className="font-semibold text-slate-900 mt-0.5">Doorstep visit bill</div>
                </div>
              </div>

              {/* Customer & Partner Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="text-3xs font-bold uppercase tracking-wider text-purple-700 mb-1">
                    Customer Information
                  </div>
                  <div className="font-bold text-slate-900">{data.customerName}</div>
                  <div className="text-slate-600 font-mono mt-0.5">{data.customerPhone}</div>
                  <div className="text-slate-500 mt-1 leading-relaxed text-2xs">
                    {data.customerAddress}, {data.cityName}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="text-3xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                    Technician
                  </div>
                  <div className="font-bold text-slate-900">{data.partnerName}</div>
                  {data.partnerPhone && (
                    <div className="text-slate-600 font-mono mt-0.5">{data.partnerPhone}</div>
                  )}
                  <div className="text-2xs text-slate-500 mt-1">
                    Check the public ID first
                  </div>
                </div>
              </div>

              {/* Service Details Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 flex justify-between text-2xs font-bold text-slate-700 uppercase tracking-wider">
                  <span>Description & Service</span>
                  <span>Amount (INR)</span>
                </div>
                <div className="p-4 space-y-3">
                  {lines.length > 0 ? (
                    lines.map((line) => (
                      <div key={`${line.name}-${line.price}`} className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-900">{line.name} × {line.qty}</span>
                        <span className="font-mono font-bold">₹{(Number(line.qty) * Number(line.price)).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-start text-xs">
                      <div className="font-bold text-slate-900">{data.serviceTitle}</div>
                      <div className="font-mono font-bold text-slate-900">₹{amount.toFixed(2)}</div>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-3 space-y-1.5 text-2xs text-slate-600">
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span className="font-mono text-emerald-700">₹{amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Completion Certificate Seal */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                  ✓
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Visit bill
                    </span>
                  </div>
                  <p className="text-2xs text-slate-600 mt-0.5 leading-relaxed">
                    Parts listed on {formatDate(completionDateObj)}.
                  </p>
                </div>
              </div>

              {/* Footer notes */}
              <div className="text-center text-3xs text-slate-400 space-y-0.5">
                <p>This is a computer-generated invoice and does not require a physical signature.</p>
                <p>For support, call {SUPPORT_PHONE_DISPLAY} or email {SUPPORT_EMAIL}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <span>🖨️</span>
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
