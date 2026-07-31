import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { howItWorks } from "../../data/home";

gsap.registerPlugin(ScrollTrigger);

export default function HomeHowItWorks() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray(".step-card").forEach((card) => {
        gsap.fromTo(card,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            }
          }
        );
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section id="how-it-works" ref={sectionRef} className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold">How it works</h2>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          Three steps to get your shop online and running.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {howItWorks.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            className="step-card bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {i + 1}
              </span>
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Icon className="text-blue-600 dark:text-blue-400 text-lg" />
              </div>
            </div>
            <h3 className="font-bold text-base mb-2">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
