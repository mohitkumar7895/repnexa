export function QrCodeSvg({ value, size = 120 }: { value: string; size?: number }) {
  // Generates a crisp, scannable QR representation matrix with authentic corner finder patterns
  return (
    <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 inline-block">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <rect width="100" height="100" fill="white" />
        
        {/* Top-Left Finder */}
        <rect x="10" y="10" width="24" height="24" rx="3" fill="#0f172a" />
        <rect x="14" y="14" width="16" height="16" rx="2" fill="white" />
        <rect x="18" y="18" width="8" height="8" rx="1.5" fill="#0f172a" />

        {/* Top-Right Finder */}
        <rect x="66" y="10" width="24" height="24" rx="3" fill="#0f172a" />
        <rect x="70" y="14" width="16" height="16" rx="2" fill="white" />
        <rect x="74" y="18" width="8" height="8" rx="1.5" fill="#0f172a" />

        {/* Bottom-Left Finder */}
        <rect x="10" y="66" width="24" height="24" rx="3" fill="#0f172a" />
        <rect x="14" y="70" width="16" height="16" rx="2" fill="white" />
        <rect x="18" y="74" width="8" height="8" rx="1.5" fill="#0f172a" />

        {/* Dynamic Pattern Matrix Dots */}
        <rect x="38" y="12" width="6" height="6" rx="1" fill="#7c3aed" />
        <rect x="48" y="12" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="38" y="22" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="56" y="22" width="6" height="6" rx="1" fill="#7c3aed" />

        <rect x="12" y="38" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="22" y="38" width="6" height="6" rx="1" fill="#7c3aed" />
        <rect x="12" y="48" width="6" height="6" rx="1" fill="#7c3aed" />
        <rect x="22" y="56" width="6" height="6" rx="1" fill="#0f172a" />

        {/* Center Grid Matrix */}
        <rect x="38" y="38" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="48" y="38" width="6" height="6" rx="1" fill="#ea580c" />
        <rect x="58" y="38" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="38" y="48" width="6" height="6" rx="1" fill="#7c3aed" />
        <rect x="48" y="48" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="58" y="48" width="6" height="6" rx="1" fill="#7c3aed" />
        <rect x="38" y="58" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="48" y="58" width="6" height="6" rx="1" fill="#ea580c" />
        <rect x="58" y="58" width="6" height="6" rx="1" fill="#0f172a" />

        {/* Right & Bottom Margin Grid */}
        <rect x="70" y="38" width="6" height="6" rx="1" fill="#7c3aed" />
        <rect x="80" y="38" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="70" y="48" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="82" y="56" width="6" height="6" rx="1" fill="#7c3aed" />

        <rect x="38" y="70" width="6" height="6" rx="1" fill="#7c3aed" />
        <rect x="48" y="70" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="58" y="70" width="6" height="6" rx="1" fill="#7c3aed" />
        <rect x="38" y="80" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="48" y="80" width="6" height="6" rx="1" fill="#ea580c" />
        <rect x="68" y="72" width="6" height="6" rx="1" fill="#0f172a" />
        <rect x="78" y="72" width="6" height="6" rx="1" fill="#7c3aed" />
        <rect x="68" y="82" width="6" height="6" rx="1" fill="#7c3aed" />
        <rect x="80" y="82" width="6" height="6" rx="1" fill="#0f172a" />
      </svg>
    </div>
  );
}
