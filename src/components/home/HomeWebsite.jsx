import PictureImg from "../PictureImg";
import fashionCatalogueWebp from "../../assets/catalogue/zurifashion-catalogue-shot.webp";
import fashionCataloguePng from "../../assets/catalogue/zurifashion-catalogue-shot.png";
import wixCatalogueWebp from "../../assets/catalogue/wix-collection-shot.webp";
import wixCataloguePng from "../../assets/catalogue/wix-collection-shot.png";
import electricalsCatalogueWebp from "../../assets/catalogue/mini-electricals-shots.webp";
import electricalsCataloguePng from "../../assets/catalogue/mini-electricals-shots.png";

const websiteShots = [
  {
    image: fashionCatalogueWebp,
    fallback: fashionCataloguePng,
    label: "Fashion Boutique",
    desc: "Showcase your clothing line with a clean, browsable product grid.",
  },
  {
    image: wixCatalogueWebp,
    fallback: wixCataloguePng,
    label: "General Store",
    desc: "Display all your categories — groceries, household, and more.",
  },
  {
    image: electricalsCatalogueWebp,
    fallback: electricalsCataloguePng,
    label: "Electronics Store",
    desc: "List phones, accessories, and gadgets with variant options.",
  },
];

const chips = [
  "Live product catalogue",
  "WhatsApp chat widget",
  "Custom banners",
  "Business info page",
  "Service catalogue",
];

function ShotCard({ shot }) {
  return (
    <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
      <PictureImg
        src={shot.image}
        fallback={shot.fallback}
        alt={shot.label}
        className="w-full"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="font-bold text-sm mb-0.5">{shot.label}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {shot.desc}
        </p>
      </div>
    </div>
  );
}

export default function HomeWebsite() {
  return (
    <section id="website-integration" className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          Your shop, now online — managed from one place
        </h2>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Keel powers your entire website. Publish products, run banners, set
          business hours, add a WhatsApp chat widget — all from your
          dashboard. No coding, no separate tools.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {chips.map((chip) => (
            <span key={chip} className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile: CSS-animated marquee */}
      <div className="sm:hidden overflow-hidden pb-2 select-none">
        <div className="home-marquee flex w-max">
          {[...websiteShots, ...websiteShots].map((shot, i) => (
            <div key={`${shot.label}-${i}`} className="w-[80vw] flex-shrink-0 pr-4">
              <ShotCard shot={shot} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: static 3-col grid */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        {websiteShots.map((shot) => (
          <ShotCard key={shot.label} shot={shot} />
        ))}
      </div>
    </section>
  );
}
