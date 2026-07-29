"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { FiMonitor, FiSmartphone, FiBookOpen, FiCpu, FiGrid, FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
);

const KATEGORI_KARYA = [
  {
    id: "Technology",
    title: "Aplikasi Web & Sistem",
    description: "Website, Sistem Informasi, Dashboard, Landing Page.",
    icon: <FiMonitor size={24} />,
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-500",
    lottie: "/animations/Developer.lottie",
  },
  {
    id: "Programming",
    title: "Aplikasi Mobile",
    description: "Aplikasi Android, iOS, atau PWA (Progressive Web App).",
    icon: <FiSmartphone size={24} />,
    color: "from-green-500/20 to-green-600/5",
    iconColor: "text-green-500",
    lottie: "/animations/mobile.lottie",
  },
  {
    id: "Research",
    title: "Karya Tulis & Jurnal",
    description: "Karya Tulis Ilmiah (KTI), Jurnal, Makalah, Penelitian.",
    icon: <FiBookOpen size={24} />,
    color: "from-orange-500/20 to-orange-600/5",
    iconColor: "text-orange-500",
    lottie: "/animations/Learning.lottie",
  },
  {
    id: "IoT",
    title: "Proyek IoT",
    description: "Internet of Things, Arduino, Raspberry Pi, Robotika.",
    icon: <FiCpu size={24} />,
    color: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-500",
    lottie: "/animations/robot.lottie",
  },
  {
    id: "Multimedia",
    title: "Desain & Lainnya",
    description: "UI/UX, Desain Grafis, Video, atau Inovasi umum lainnya.",
    icon: <FiGrid size={24} />,
    color: "from-pink-500/20 to-pink-600/5",
    iconColor: "text-pink-500",
    lottie: "/animations/kalkun.lottie",
    lottieStyle: { scale: 1.1 }, 
  },
];

export default function UploadLandingPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(2);

  // Store DotLottie instances per card id
  const lottieRefs = useRef<Record<string, any>>({});

  const handleDotLottieRef = useCallback((id: string) => (dotLottie: any) => {
    lottieRefs.current[id] = dotLottie;
  }, []);

  // Automatically play active card, stop others
  useEffect(() => {
    const activeId = KATEGORI_KARYA[activeIndex].id;
    
    // Iterate over refs and play/stop based on active state
    Object.keys(lottieRefs.current).forEach((id) => {
      const dl = lottieRefs.current[id];
      if (!dl) return;
      
      if (id === activeId) {
        dl.play();
      } else {
        dl.stop();
      }
    });
  }, [activeIndex]);

  const handleCardClick = (index: number, id: string) => {
    if (index === activeIndex) {
      router.push(`/dashboard/upload/form?type=${encodeURIComponent(id)}`);
    } else {
      setActiveIndex(index);
    }
  };

  const nextCard = () => {
    if (activeIndex < KATEGORI_KARYA.length - 1) setActiveIndex(activeIndex + 1);
  };

  const prevCard = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col justify-start pt-0 pb-12 md:pb-4 -mt-8 md:-mt-16 relative z-10 overflow-x-clip overflow-y-visible px-4 md:px-0">
      <div className="text-center mb-2">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-extrabold text-[var(--color-primary)] mb-2"
        >
          Pilih Tipe Karya
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-on-surface-variant max-w-xl mx-auto"
        >
          Apa jenis inovasi yang ingin kamu bagikan hari ini? Geser dan pilih salah satu kategori di bawah.
        </motion.p>
      </div>

      <div className="relative h-[390px] md:h-[420px] w-full flex items-center justify-center -mt-2 md:mt-2">

        {/* Navigation Arrows */}
        <button
          onClick={prevCard}
          disabled={activeIndex === 0}
          className="absolute left-2 md:left-8 z-50 p-3 md:p-4 rounded-full bg-surface shadow-xl border border-outline-variant/30 text-on-surface hover:text-[var(--color-primary)] disabled:opacity-0 transition-all hover:scale-110"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={nextCard}
          disabled={activeIndex === KATEGORI_KARYA.length - 1}
          className="absolute right-2 md:right-8 z-50 p-3 md:p-4 rounded-full bg-surface shadow-xl border border-outline-variant/30 text-on-surface hover:text-[var(--color-primary)] disabled:opacity-0 transition-all hover:scale-110"
        >
          <FiChevronRight size={24} />
        </button>

        {KATEGORI_KARYA.map((item, index) => {
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);
          const isActive = offset === 0;
          const isVisible = absOffset <= 1; // only render nearby cards

          const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
          const xOffsetBase = isMobile ? 100 : 200;

          // Instead of CSS scale (which blurs canvas), use opacity + slight vertical offset
          const cardOpacity = isActive ? 1 : absOffset === 1 ? 0.75 : 0;
          const cardY = isActive ? 0 : 20;

          return (
            <motion.div
              key={item.id}
              onClick={() => handleCardClick(index, item.id)}
              initial={false}
              animate={{
                x: `${offset * xOffsetBase}px`,
                opacity: cardOpacity,
                y: cardY,
                zIndex: 20 - absOffset,
              }}
              whileHover={isActive ? { scale: 1.03, y: -4 } : { scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={`absolute w-[280px] sm:w-[320px] md:w-[340px] h-[380px] bg-surface rounded-3xl cursor-pointer select-none flex flex-col overflow-hidden
                ${isActive
                  ? 'border-2 border-[var(--color-primary)] shadow-2xl'
                  : 'border border-outline-variant/40 shadow-md'
                }
              `}
              style={{ pointerEvents: absOffset > 1 ? 'none' : 'auto' }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-3xl pointer-events-none`} />

              {/* Lottie area — fixed height, no scale transform */}
              <div className="relative w-full h-[180px] flex-shrink-0 overflow-hidden">
                {item.lottie && isVisible && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-[190px] h-[190px]"
                      style={item.lottieStyle ? {
                        transform: `translateX(${(item.lottieStyle as any).translateX || '0'}) scale(${(item.lottieStyle as any).scale || 1})`,
                        mixBlendMode: 'multiply' as const,
                      } : undefined}
                    >
                      <DotLottieReact
                        key={item.id}
                        src={item.lottie}
                        loop
                        autoplay={isActive}
                        dotLottieRefCallback={handleDotLottieRef(item.id)}
                      />
                    </div>
                  </div>
                )}
                {!item.lottie && (
                  <div className={`absolute inset-0 flex items-center justify-center`}>
                    <div className={`w-14 h-14 rounded-2xl bg-surface-variant/70 flex items-center justify-center ${item.iconColor} border border-outline-variant/20`}>
                      {React.cloneElement(item.icon as React.ReactElement<any>, { size: 26 })}
                    </div>
                  </div>
                )}
              </div>


              {/* Text content */}
              <div className="relative z-10 flex flex-col flex-grow px-6 pb-5 pt-5">
                <div className="flex-grow">
                  <h3 className={`text-2xl font-extrabold mb-2 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-on-surface'}`}>
                    {item.title}
                  </h3>
                  <p className="text-base text-on-surface-variant leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-outline-variant/20">
                  <button
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300
                      ${isActive ? 'bg-[var(--color-primary)] text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:brightness-110 active:scale-95' : 'opacity-0'}
                    `}
                  >
                    Mulai Upload <FiArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Hover shimmer for non-active */}
              {!isActive && (
                <div className="absolute inset-0 z-20 rounded-3xl bg-surface/20 hover:bg-transparent transition-colors duration-200" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
