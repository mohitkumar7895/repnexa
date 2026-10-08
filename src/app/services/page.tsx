import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

const getCategoryFallbackImage = (title: string = "") => {
  const t = title.toLowerCase();
  if (t.includes("washing") || t.includes("laundry")) return "/categories/washing-machine.jpg";
  if (t.includes("security") || t.includes("cctv") || t.includes("camera")) return "/categories/cctv.jpg";
  if (t.includes("air condition") || /\bac\b/.test(t) || t.includes("(ac)")) return "/categories/ac.jpg";
  if (t.includes("refrigerat") || t.includes("fridge")) return "/categories/fridge.jpg";
  if (t.includes("television") || /\btv\b/.test(t)) return "/categories/tv.jpg";
  if (t.includes("purifier") || t.includes("ro") || t.includes("water")) return "/categories/ro-purifier.jpg";
  if (t.includes("computer") || t.includes("laptop") || t.includes("pc")) return "/categories/laptop-pc.jpg";
  if (t.includes("kitchen") || t.includes("chimney") || t.includes("microwave")) return "/categories/kitchen.jpg";
  return "/categories/ac.jpg";
};

import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default async function ServicesPage() {
  const [categories]: any = await db.query("SELECT * FROM categories WHERE status = 'Active' ORDER BY id ASC");
  const [services]: any = await db.query(`
    SELECT s.*, c.title as category_title
    FROM services s
    JOIN categories c ON s.category_id = c.id
    ORDER BY s.category_id ASC, s.id ASC
  `);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navbar with logo */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          <Link href="/" className="min-w-0">
            <div className="relative w-28 sm:w-40 h-9 sm:h-11">
              <Image src="/logo.png" alt="Repnexa" fill className="object-contain object-left" priority sizes="160px" />
            </div>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-bold">
            <Link href="/" className="hidden sm:inline text-slate-600 dark:text-slate-300">Home</Link>
            <ThemeToggle />
            <Link href="/book" className="px-3 py-2 rounded-lg bg-orange-600 text-white">Book</Link>
          </div>
        </div>
      </header>

      {/* Main Catalog View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Complete Service Catalogue
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Doorstep Appliance Repair & Maintenance
          </h1>
          <p className="text-sm text-slate-500">
            Cleared technicians only.
          </p>
        </div>

        {/* Categories Section */}
        {categories.map((cat: any) => {
          const catServices = services.filter((s: any) => s.category_id === cat.id);
          const imgSrc = cat.image_url || getCategoryFallbackImage(cat.title);

          return (
            <div key={cat.id} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-xs border border-slate-200 flex-shrink-0 bg-slate-100">
                    <Image
                      src={imgSrc}
                      alt={cat.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{cat.title}</h2>
                    <span className="text-xs text-slate-400 font-medium">Cleared technicians only</span>
                  </div>
                </div>
                <Link 
                  href={`/book?category=${encodeURIComponent(cat.title)}`} 
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl border border-purple-200 self-start sm:self-auto transition-all"
                >
                  Book from this category →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {catServices.map((svc: any) => (
                  <div key={svc.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-amber-500">★ {svc.rating || "4.8"}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{svc.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{svc.short_description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-2xs font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Doorstep Service
                      </div>
                      <Link 
                        href={`/book?category=${encodeURIComponent(cat.title)}`} 
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-xs"
                      >
                        Book Now →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
