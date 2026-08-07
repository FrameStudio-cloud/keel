import { Helmet } from "react-helmet-async";
import { faqs } from "../data/home";
import HomeNav from "../components/home/HomeNav";
import HomeHero from "../components/home/HomeHero";
import HomeFeatures from "../components/home/HomeFeatures";
import HomeHowItWorks from "../components/home/HomeHowItWorks";
import HomeWebsite from "../components/home/HomeWebsite";
import HomeTestimonials from "../components/home/HomeTestimonials";
import HomeFaq from "../components/home/HomeFaq";
import HomeCta from "../components/home/HomeCta";
import HomePwa from "../components/home/HomePwa";
import HomePricing from "../components/home/HomePricing";
import HomeFooter from "../components/home/HomeFooter";

export default function Homepage() {
  return (
    <>
      <Helmet>
        <title>Keel — Business Dashboard for African SMEs</title>
        <meta name="description" content="Track inventory, manage sales, view reports, and grow your business — all from one clean dashboard. Built for Kenyan shop owners." />
        <meta property="og:title" content="Keel — Business Dashboard for African SMEs" />
        <meta property="og:description" content="Track inventory, manage sales, view reports, and grow your business — all from one clean dashboard." />
        <meta property="og:url" content="https://keel.framestudio.co.ke/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(({ q, a }) => ({
              "@type": "Question",
              "name": q,
              "acceptedAnswer": { "@type": "Answer", "text": a }
            }))
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e] text-slate-900 dark:text-white">
        <HomeNav />
        <main>
          <HomeHero />
          <HomeFeatures />
          <HomeHowItWorks />
          <HomeWebsite />
          <HomeTestimonials />
          <HomeFaq />
          <HomeCta />
          <HomePwa />
          <HomePricing />
        </main>
        <HomeFooter />
      </div>
    </>
  );
}
