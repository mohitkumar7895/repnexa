import { db } from "@/lib/db";
import { Navbar } from "@/components/home/Navbar";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid, CategoryItem } from "@/components/home/CategoryGrid";
import { WhyChooseUs, HowItWorks } from "@/components/home/TrustSections";
import { CustomerReviews, PartnerCta, ReviewItem } from "@/components/home/EngagementSections";
import { Footer } from "@/components/home/Footer";

export default async function Home() {
  // Fetch real categories and approved customer reviews from MySQL database
  const [categories]: any = await db.query(
    "SELECT id, title, labour_charges, status, image_url FROM categories WHERE status = 'Active' ORDER BY id ASC"
  );

  const [reviews]: any = await db.query(`
    SELECT r.id, r.rating, r.comment, r.customer_name, p.business_name as partner_name
    FROM reviews r
    LEFT JOIN partners p ON r.partner_id = p.id
    WHERE r.status = 'approved'
    ORDER BY r.id DESC
    LIMIT 4
  `);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-purple-100 selection:text-purple-900">
      <Navbar />
      <main className="flex-1">
        <HeroBanner />
        <CategoryGrid categories={categories as CategoryItem[]} />
        <WhyChooseUs />
        <HowItWorks />
        <PartnerCta />
        <CustomerReviews reviews={reviews as ReviewItem[]} />
      </main>
      <Footer />
    </div>
  );
}
