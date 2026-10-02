import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const params = await searchParams;
  const submittedTicket = params?.ticket;

  const [settingsRows]: any = await db.query("SELECT setting_key, setting_value FROM system_settings");
  const settings: any = {};
  for (const s of settingsRows) {
    settings[s.setting_key] = s.setting_value;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Header with clean Logo */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative w-40 h-10 flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Repnexa" 
                fill 
                className="object-contain object-left" 
                priority
              />
            </div>
          </Link>
          <div className="flex items-center space-x-3 text-xs font-bold">
            <Link href="/" className="text-slate-600 hover:text-slate-900">Home</Link>
            <Link href="/customer/dashboard" className="text-slate-600 hover:text-slate-900 hidden sm:inline">Track Booking</Link>
            <Link href="/book" className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs">
              Book Service
            </Link>
          </div>
        </div>
      </header>

      {/* Main Support Center */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            24/7 Operations Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How Can We Assist You Today?
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Need help with a technician visit, service scheduling, or billing clarification? Our dedicated escalation desk is active round the clock.
          </p>
        </div>

        {/* Success Alert Banner if Ticket Submitted */}
        {submittedTicket && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start space-x-3 shadow-xs">
            <span className="text-xl">✅</span>
            <div className="text-xs space-y-1">
              <div className="font-bold text-sm text-emerald-950">
                Support Ticket #{submittedTicket} Successfully Registered!
              </div>
              <p className="text-emerald-800">
                Your inquiry has been submitted directly to Super Admin Control Center. Our support operations team will inspect your request and contact you at your provided mobile number.
              </p>
            </div>
          </div>
        )}

        {/* Contact Helpline Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center space-y-2">
            <div className="text-3xl">📞</div>
            <h3 className="font-bold text-slate-900 text-sm">Helpline Number</h3>
            <p className="text-xs text-slate-500 font-mono font-bold text-purple-700">
              {settings['support_phone'] || '+91 78950 94129'}
            </p>
            <span className="text-2xs text-slate-400 block">Mon - Sun (8:00 AM - 9:00 PM)</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center space-y-2">
            <div className="text-3xl">✉️</div>
            <h3 className="font-bold text-slate-900 text-sm">Support Email</h3>
            <p className="text-xs text-slate-500 font-mono font-bold text-purple-700">
              {settings['support_email'] || 'support@repnexa.com'}
            </p>
            <span className="text-2xs text-slate-400 block">Response within 2 hours</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center space-y-2">
            <div className="text-3xl">🛡️</div>
            <h3 className="font-bold text-slate-900 text-sm">Customer Helpdesk</h3>
            <p className="text-xs text-slate-700 font-bold">
              Doorstep Service Assurance
            </p>
            <span className="text-2xs text-slate-400 block">Dedicated support team on standby</span>
          </div>
        </div>

        {/* Submit Grievance / Inquiry Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
            Submit a Support Inquiry or Service Dispute
          </h2>

          <form action={async (formData: FormData) => {
            "use server";
            const name = formData.get("name") as string;
            const phone = formData.get("phone") as string;
            const subject = formData.get("subject") as string;
            const message = formData.get("message") as string;

            if (name && phone && subject && message) {
              const ticketCode = `TKT-PUB-${Date.now().toString().slice(-6)}`;
              await db.query(
                `INSERT INTO support_tickets (ticket_code, customer_name, customer_phone, subject, description, priority, status)
                 VALUES (?, ?, ?, ?, ?, 'MEDIUM', 'OPEN')`,
                [ticketCode, name.trim(), phone.trim(), subject.trim(), message.trim()]
              );
              revalidatePath("/super-admin/support");
              redirect(`/support?ticket=${ticketCode}`);
            }
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Your Full Name *</label>
                <input type="text" name="name" required placeholder="Enter full name" className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Contact Mobile Number *</label>
                <input type="tel" name="phone" required placeholder="Enter 10-digit mobile number" className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Subject / Issue Summary *</label>
              <input type="text" name="subject" required placeholder="e.g. Delayed technician arrival for AC Service" className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none" />
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Detailed Explanation *</label>
              <textarea name="message" rows={3} required placeholder="Describe your concern or query..." className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none"></textarea>
            </div>

            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer">
              Send Support Message →
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
