import { useRef, useState } from "react";
import { testimonials } from "../../data/home";

function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

export default function HomeTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const carouselRef = useRef(null);

  const scrollTestimonial = (index) => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = el.querySelectorAll(".testimonial-card");
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      setCurrentTestimonial(index);
    }
  };

  const handleTestimonialScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = el.querySelectorAll(".testimonial-card");
    let closest = 0;
    let minDist = Infinity;
    const center = el.scrollLeft + el.offsetWidth / 2;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setCurrentTestimonial(closest);
  };

  return (
    <section id="testimonials" className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          People just like you are already using Keel
        </h2>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          Real shop owners, real results.
        </p>
      </div>

      <div className="relative">
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onScroll={handleTestimonialScroll}
          >
            {testimonials.map(({ name, shop, text }) => (
              <div
                key={name}
                className="testimonial-card snap-start shrink-0 w-[85vw] sm:w-[360px] bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-5"
              >
                <svg
                  className="w-6 h-6 text-blue-200 dark:text-blue-800 mb-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {text}
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {initials(name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {shop}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-1 mt-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTestimonial(i)}
              className={`flex items-center justify-center h-10 px-1 rounded-full transition-all ${
                currentTestimonial === i
                  ? "w-6 bg-blue-600"
                  : "w-2 bg-transparent"
              }`}
              aria-label={`Testimonial ${i + 1} of ${testimonials.length}`}
            >
              <span className={`block h-2 rounded-full transition-all ${
                currentTestimonial === i
                  ? "w-full bg-blue-600"
                  : "w-2 bg-slate-300 dark:bg-slate-600"
              }`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
