import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repnexa - Doorstep Appliance & Electronics Repair",
  description: "India's trusted doorstep appliance and electronics repair platform.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800">{children}</body>
    </html>
  );
}
