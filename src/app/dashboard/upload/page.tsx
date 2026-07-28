"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiMonitor, FiSmartphone, FiBookOpen, FiCpu, FiGrid, FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function UploadLandingPage() {
  const KATEGORI_KARYA = [
    {
      id: "Technology", // Mapped to existing DB Category
      title: "Aplikasi Web & Sistem",
      description: "Website, Sistem Informasi, Dashboard, Landing Page.",
      icon: <FiMonitor size={24} />,
      color: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-500"
    },
    {
      id: "Programming",
      title: "Aplikasi Mobile",
      description: "Aplikasi Android, iOS, atau PWA (Progressive Web App).",
      icon: <FiSmartphone size={24} />,
      color: "from-green-500/20 to-green-600/5",
      iconColor: "text-green-500"
    },
    {
      id: "Research",
      title: "Karya Tulis & Jurnal",
      description: "Karya Tulis Ilmiah (KTI), Jurnal, Makalah, Penelitian.",
      icon: <FiBookOpen size={24} />,
      color: "from-orange-500/20 to-orange-600/5",
      iconColor: "text-orange-500"
    },
    {
      id: "IoT",
      title: "Proyek IoT",
      description: "Internet of Things, Arduino, Raspberry Pi, Robotika.",
      icon: <FiCpu size={24} />,
      color: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-500"
    },
      {
      id: "Multimedia",
      title: "Desain & Lainnya",
      description: "UI/UX, Desain Grafis, Video, atau Inovasi umum lainnya.",
      icon: <FiGrid size={24} />,
      color: "from-pink-500/20 to-pink-600/5",
      iconColor: "text-pink-500"
    }
  ];

  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(2); // Start at the middle item

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
      <div className="text-center mb-8">
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

      <div className="relative h-[340px] md:h-[380px] w-full flex items-center justify-center perspective-1000 mt-2 md:mt-6">
        
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

          // Responsiveness adjustments
          // On mobile, x offset is smaller to fit screen
          const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
          const xOffsetBase = isMobile ? 100 : 200;

          return (
            <motion.div
              key={item.id}
              onClick={() => handleCardClick(index, item.id)}
              initial={false}
              animate={{
                x: `${offset * xOffsetBase}px`,
                scale: 1 - absOffset * 0.15,
                zIndex: 20 - absOffset,
                opacity: 1,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={`absolute w-[280px] sm:w-[320px] md:w-[340px] h-[320px] bg-surface rounded-3xl p-6 cursor-pointer select-none flex flex-col justify-between
                ${isActive ? 'border-2 border-[var(--color-primary)] shadow-2xl scale-100' : 'border border-outline-variant/40 shadow-md'}
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-14 h-14 rounded-2xl bg-surface-variant/70 flex items-center justify-center ${item.iconColor} mb-2 ${isActive ? 'scale-110 shadow-md' : ''} transition-all duration-300 border border-outline-variant/20`}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 26 })}
                </div>
                
                <div className="flex-grow">
                  <h3 className={`text-xl font-extrabold mb-1.5 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-on-surface'}`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
                
                <div className="mt-auto pt-3 border-t border-outline-variant/20">
                  <button 
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                      ${isActive ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'bg-surface-variant/50 text-on-surface-variant opacity-0'}
                    `}
                  >
                    Mulai Upload <FiArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Click overlay for non-active cards */}
              {!isActive && (
                <div className="absolute inset-0 z-20 rounded-3xl bg-surface/10 hover:bg-surface/0 transition-colors" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
