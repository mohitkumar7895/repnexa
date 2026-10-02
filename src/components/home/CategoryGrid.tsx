import Link from "next/link";
import Image from "next/image";

export interface CategoryItem {
  id: number;
  title: string;
  image_url?: string | null;
  labour_charges?: number;
  status?: string;
}

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

export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Doorstep Repair Services
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              What Appliance Needs Repair Today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Select any category to book a certified, background-verified technician at standard transparent pricing.
            </p>
          </div>
          <Link 
            href="/services" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-4 py-2.5 rounded-xl border border-purple-200 transition-all"
          >
            <span>Explore All 30+ Services</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const imgSrc = cat.image_url || getCategoryFallbackImage(cat.title);

            return (
              <Link 
                key={cat.id} 
                href={`/book?category=${encodeURIComponent(cat.title)}`}
                className="group relative bg-white rounded-2xl border border-slate-200 hover:border-purple-400 p-3 sm:p-4 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Image Container with HD photo */}
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 mb-3 shadow-inner">
                  <Image 
                    src={imgSrc} 
                    alt={cat.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                    className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    priority={cat.id <= 4}
                  />
                </div>

                {/* Info & Action */}
                <div className="space-y-1.5">
                  <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                    {cat.title}
                  </h3>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-2xs font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Technician Available
                    </span>
                    <span className="text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                      Book →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
