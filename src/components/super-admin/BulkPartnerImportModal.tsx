"use client";

import { useState } from "react";
import { bulkImportPartners } from "@/app/actions/portal-actions";

export function BulkPartnerImportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [autoApprove, setAutoApprove] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sampleCsvContent = `Full Name,Mobile Phone,Email,Business Name,City Name,Experience Years,Business Type
Vikas Malhotra,9811001122,vikas.ac@repnexa.com,Malhotra Aircon Services,New Delhi,6,Proprietorship
Sunil Verma,9877002233,sunil.fridge@repnexa.com,Verma Cooling & Repair,Noida,4,Individual / Freelancer
Rajesh Chawla,9822334455,chawla.repair@repnexa.com,Chawla Electronics Hub,Mumbai,10,Partnership / LLP
Manoj Tiwari,9833445566,manoj.tiwari@repnexa.com,Patna Cooling Care,Patna,5,Proprietorship
Karan Sharma,9844556677,karan.sharma@repnexa.com,Sharma Appliance Care,Jaipur,3,Individual / Freelancer`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "repnexa_partners_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsv = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length <= 1) {
      setParsedRows([]);
      return;
    }

    const rows: any[] = [];
    const startIndex = lines[0].toLowerCase().includes("name") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (cols.length >= 3) {
        rows.push({
          fullName: cols[0] || "",
          phone: cols[1] || "",
          email: cols[2] || "",
          businessName: cols[3] || cols[0] || "Service Agency",
          cityName: cols[4] || "New Delhi",
          experience: Number(cols[5]) || 2,
          businessType: cols[6] || "Individual / Freelancer",
          isValid: cols[0] && cols[1] && cols[2],
        });
      }
    }
    setParsedRows(rows);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCsvText(val);
    parseCsv(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      parseCsv(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setCsvText(sampleCsvContent);
    parseCsv(sampleCsvContent);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setIsSubmitting(true);
    setResult(null);

    const payload = parsedRows.map((r) => ({
      ...r,
      autoApprove,
    }));

    const res = await bulkImportPartners(payload);
    setIsSubmitting(false);
    setResult(res);

    if (res.success) {
      setParsedRows([]);
      setCsvText("");
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setResult(null);
        }}
        type="button"
        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
      >
        <span>📥</span>
        <span>Bulk Import Partners (CSV)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 text-white flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🚀</span>
                  <h3 className="text-base font-bold">Mass Partner Onboarding & CSV Import</h3>
                </div>
                <p className="text-xs text-purple-200 mt-0.5">
                  Import dozens or hundreds of verified service technician profiles in 1 click
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Result Notice */}
              {result && (
                <div
                  className={`p-4 rounded-xl border text-xs ${
                    result.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold">
                    <span>{result.success ? "🎉" : "⚠️"}</span>
                    <span>{result.message || (result.success ? "Partners Imported!" : result.error)}</span>
                  </div>
                  {result.errors && result.errors.length > 0 && (
                    <ul className="mt-2 text-2xs space-y-1 list-disc list-inside text-rose-700">
                      {result.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Template & Helpers Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-600">
                  <span>Columns required: </span>
                  <code className="text-2xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    FullName, Phone, Email, BusinessName, CityName, Experience, BusinessType
                  </code>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSample}
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    📥 Download Sample CSV
                  </button>
                  <button
                    onClick={handleLoadSample}
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-all cursor-pointer"
                  >
                    ✨ Paste Sample 5 Partners
                  </button>
                </div>
              </div>

              {/* Input Mode Selector */}
              <div className="flex border-b border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setMode("paste")}
                  type="button"
                  className={`pb-2.5 px-4 cursor-pointer transition-colors ${
                    mode === "paste"
                      ? "border-b-2 border-purple-600 text-purple-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📝 Direct Copy-Paste (Excel / CSV)
                </button>
                <button
                  onClick={() => setMode("upload")}
                  type="button"
                  className={`pb-2.5 px-4 cursor-pointer transition-colors ${
                    mode === "upload"
                      ? "border-b-2 border-purple-600 text-purple-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📁 Upload .CSV File
                </button>
              </div>

              {mode === "paste" ? (
                <div>
                  <textarea
                    value={csvText}
                    onChange={handleTextChange}
                    rows={6}
                    placeholder="Paste comma-separated rows or Excel data here:&#10;Full Name,Mobile Number,Email,Business Name,City,Experience Years,Business Type"
                    className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:border-purple-600 focus:outline-none"
                  />
                  <p className="text-3xs text-slate-400 mt-1">
                    Tip: You can copy cells directly from Google Sheets or Excel and paste them here.
                  </p>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2 hover:border-purple-500 transition-colors">
                  <span className="text-3xl block">📄</span>
                  <label className="inline-block px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-all">
                    Choose .CSV File
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-2xs text-slate-500">Supports standard UTF-8 CSV files</p>
                </div>
              )}

              {/* Live Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Import Preview ({parsedRows.length} Partners Detected)
                    </h4>
                    <span className="text-2xs text-emerald-700 font-semibold">
                      ✓ All rows will get default password: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">partner123</code>
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-3xs sticky top-0">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Full Name</th>
                          <th className="px-3 py-2">Phone</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Business Name</th>
                          <th className="px-3 py-2">City Hub</th>
                          <th className="px-3 py-2">Exp</th>
                          <th className="px-3 py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-mono text-slate-400">{i + 1}</td>
                            <td className="px-3 py-2 font-semibold text-slate-900">{r.fullName}</td>
                            <td className="px-3 py-2 font-mono text-slate-600">{r.phone}</td>
                            <td className="px-3 py-2 text-slate-500 text-2xs truncate max-w-[120px]">{r.email}</td>
                            <td className="px-3 py-2 text-slate-700">{r.businessName}</td>
                            <td className="px-3 py-2 text-purple-700 font-medium">{r.cityName}</td>
                            <td className="px-3 py-2 text-slate-600">{r.experience}y</td>
                            <td className="px-3 py-2 text-right">
                              {r.isValid ? (
                                <span className="text-emerald-700 font-bold text-2xs">✓ Ready</span>
                              ) : (
                                <span className="text-rose-600 font-bold text-2xs">✕ Incomplete</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>
                    Auto-Approve KYC & Credit ₹1,000 Float (Partners can accept customer leads immediately)
                  </span>
                </label>
                <p className="text-2xs text-slate-500 pl-6">
                  If unchecked, accounts are created in &#39;pending&#39; review status for manual document verification.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleImport}
                disabled={parsedRows.length === 0 || isSubmitting}
                type="button"
                className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Importing {parsedRows.length} Partners...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Import {parsedRows.length} Partners Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
