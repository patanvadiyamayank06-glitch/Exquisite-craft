import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    tag: "Handcrafted Just For You",
    title: "Your Phone,\nYour Identity",
    subtitle: "Custom phone cases designed to match your personality — every piece unique.",
    bg: "#f5ede3",
    cta: "Shop Now",
    ctaTo: "/#products",
  },
  {
    tag: "New Arrivals",
    title: "Anime &\nManga Cases",
    subtitle: "Show off your fandom with premium handcrafted cases.",
    bg: "#ede0d4",
    cta: "Browse Cases",
    ctaTo: "/#products",
  },
  {
    tag: "100% Customizable",
    title: "Design Your\nOwn Case",
    subtitle: "Upload any image — we'll craft it into a stunning case just for you.",
    bg: "#e8d5c4",
    cta: "Start Designing",
    ctaTo: "/custom-design",
  },
];

const Banner = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [current]);

  const goTo = (idx) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 300);
  };

  const slide = slides[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ backgroundColor: slide.bg, minHeight: 420, transition: "background-color 0.6s ease" }}>
  {/* Decorative phone case images */}
  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
    {[
      { src: "/tanjiro-case.jpg",          t: "4%",  l: "52%", r: -14, w: 72  },
      { src: "/marble-case.webp",          t: "8%",  l: "63%", r: 10,  w: 68  },
      { src: "/flower-case.webp",          t: "3%",  l: "74%", r: -6,  w: 70  },
      { src: "/boho-case.webp",            t: "50%", l: "57%", r: 18,  w: 65  },
      { src: "/camera-case.jpeg",          t: "54%", l: "70%", r: -16, w: 68  },
      { src: "/youre-special-case.jpeg",   t: "44%", l: "83%", r: 8,   w: 72  },
      { src: "/iphone-case2.jpeg",         t: "12%", l: "87%", r: -10, w: 66  },
    ].map((s, i) => (
      <div key={i} className="absolute"
        style={{ top: s.t, left: s.l, width: s.w, transform: `rotate(${s.r}deg)` }}>
        <img src={s.src} alt=""
          className="w-full object-contain drop-shadow-lg"
          style={{ borderRadius: 0, aspectRatio: "9/16", mixBlendMode: "multiply" }} />
      </div>
    ))}
  </div>

      {/* Arrows */}
      {["‹","›"].map((arrow, i) => (
        <button key={arrow} onClick={() => goTo((current + (i === 0 ? -1 : 1) + slides.length) % slides.length)}
          className="absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/70 hover:bg-white shadow-soft flex items-center justify-center text-lg text-brown transition-all"
          style={{ [i === 0 ? "left" : "right"]: 16 }} aria-label={i === 0 ? "Previous" : "Next"}>
          {arrow}
        </button>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 py-16 md:py-24 max-w-lg"
        style={{ opacity: animating ? 0 : 1, transition: "opacity 0.3s ease" }}>
        <p className="text-xs uppercase tracking-[0.3em] mb-3 font-semibold" style={{ color: "#8B5E3C" }}>
          {slide.tag}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight whitespace-pre-line font-display"
          style={{ color: "#3b1f0e" }}>
          {slide.title}
        </h1>
        <p className="mt-4 text-sm md:text-base leading-relaxed max-w-sm" style={{ color: "#5a3a20" }}>
          {slide.subtitle}
        </p>
        <Link to={slide.ctaTo}
          className="btn-primary mt-8 w-fit rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wider">
          {slide.cta}
        </Link>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 left-8 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === current ? 28 : 12, backgroundColor: i === current ? "#8B5E3C" : "#8B5E3C44" }}
            aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </section>
  );
};

export default Banner;
