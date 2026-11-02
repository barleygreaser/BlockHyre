"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  ArrowRight, 
  Scissors, 
  Droplets, 
  Camera, 
  Paintbrush, 
  Leaf, 
  ChevronsUp, 
  Zap, 
  PartyPopper, 
  Wrench, 
  Droplet 
} from "lucide-react";

/* ── Types ── */
interface Tab {
  id: string;
  label: string;
}

interface BentoNavigationCanvasProps {
  tabs?: Tab[];
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  children?: React.ReactNode;
}

/* ── Tab Content Data ── */
interface TabContent {
  headline: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  accent: string;
  cta: string;
}

const BRAND_ACCENT = "#5B6EAE"; // Electric Indigo
const BRAND_ACCENT_LIGHT = "rgba(91, 110, 174, 0.1)";

// Supabase Storage Initialization
const SUPABASE_STORAGE_URL = "https://uttbptpkekijlfzvauzu.supabase.co/storage/v1/object/public/category-images";

const tabContentMap: Record<string, TabContent> = {
  saws: {
    headline: "Saws & Cutting",
    description:
      "Tackle any dimension lumber or trim with precision. Find miter saws, circular saws, and table saws ready for your next woodworking project.",
    image: `${SUPABASE_STORAGE_URL}/saws.png`,
    icon: <Scissors className="h-6 w-6" />,
    accent: BRAND_ACCENT,
    cta: "Browse Saws",
  },
  washers: {
    headline: "Power Washers",
    description:
      "Restore driveways, siding, and decks to their former glory. Rent heavy-duty gas or electric power washers to blast away years of grime.",
    image: `${SUPABASE_STORAGE_URL}/washers.png`, 
    icon: <Droplets className="h-6 w-6" />,
    accent: BRAND_ACCENT,
    cta: "Clean It Up",
  },
  drones: {
    headline: "Aerial Drones",
    description:
      "Capture cinematic 4K footage for real estate, events, or surveying. Rent high-end DJI drones without the steep upfront ownership cost.",
    image: `${SUPABASE_STORAGE_URL}/drones.png`, 
    icon: <Camera className="h-6 w-6" />,
    accent: BRAND_ACCENT,
    cta: "Take Flight",
  },
  painting: {
    headline: "Professional Painting",
    description:
      "Achieve a flawless finish with airless paint sprayers, heavy-duty drop cloths, and scaffolding. Transform a room in a fraction of the time.",
    image: `${SUPABASE_STORAGE_URL}/painting.png`, 
    icon: <Paintbrush className="h-6 w-6" />,
    accent: BRAND_ACCENT,
    cta: "Start Painting",
  },
  lawn: {
    headline: "Lawn & Garden",
    description:
      "Aerate, till, or completely re-landscape. Access commercial-grade tillers, aerators, and heavy trimmers for the weekend warrior.",
    image: `${SUPABASE_STORAGE_URL}/lawn.png`, 
    icon: <Leaf className="h-6 w-6" />,
    accent: BRAND_ACCENT,
    cta: "Dig In",
  },
  ladders: {
    headline: "Ladders & Scaffolding",
    description:
      "Reach the highest gutters or change vaulted ceiling fixtures securely. Rent extension ladders and multi-position scaffolding safely.",
    image: `${SUPABASE_STORAGE_URL}/ladders.png`, 
    icon: <ChevronsUp className="h-6 w-6" />,
    accent: BRAND_ACCENT,
    cta: "Reach Higher",
  },
  generators: {
    headline: "Power Generators",
    description:
      "Keep the lights on during an outage or power your outdoor event cleanly. Find inverter generators that are quiet and incredibly reliable.",
    image: `${SUPABASE_STORAGE_URL}/generators.png`, 
    icon: <Zap className="h-6 w-6" />,
    accent: BRAND_ACCENT,
    cta: "Get Power",
  },
  party: {
    headline: "Party Supplies",
    description:
      "Host the block party of the year. Rent high-capacity coolers, folding tables, commercial speakers, and event tents directly from your neighbors.",
    image: `${SUPABASE_STORAGE_URL}/party.png`, 
    icon: <PartyPopper className="h-6 w-6" />,
    accent: BRAND_ACCENT,
    cta: "Start Hosting",
  },
  tools: {
    headline: "Specialty Hand Tools",
    description:
      "Don't buy a tool you'll only use once. Rent torque wrenches, pipe benders, and precision hand tools to complete your auto or home repairs.",
    image: `${SUPABASE_STORAGE_URL}/tools.png`, 
    icon: <Wrench className="h-6 w-6" />,
    accent: BRAND_ACCENT,
    cta: "Find Tools",
  },
  plumbing: {
    headline: "Plumbing Equipment",
    description:
      "Clear stubborn obstructions or thread pipes like a pro. Rent motorized drain augers and heavy-duty pipe wrenches at a fraction of the cost.",
    image: `${SUPABASE_STORAGE_URL}/plumbing.png`, 
    icon: <Droplet className="h-6 w-6" />,
    accent: BRAND_ACCENT,
    cta: "Fix Leaks",
  },
};

const DEFAULT_TABS: Tab[] = [
  { id: "saws", label: "Saws" },
  { id: "washers", label: "Washers" },
  { id: "drones", label: "Drones" },
  { id: "painting", label: "Painting" },
  { id: "lawn", label: "Lawn & Garden" },
  { id: "ladders", label: "Ladders" },
  { id: "generators", label: "Generators" },
  { id: "party", label: "Party" },
  { id: "tools", label: "Hand Tools" },
  { id: "plumbing", label: "Plumbing" },
];

/* ── Animations ── */
const contentVariants = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(4px)" },
};

const imageVariants = {
  initial: { opacity: 0, scale: 1.04 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

/* ── Component ── */
export function BentoNavigationCanvas({
  tabs = DEFAULT_TABS,
  activeTabId: controlledTabId,
  onTabChange,
  children,
}: BentoNavigationCanvasProps) {
  const [internalTabId, setInternalTabId] = useState(tabs[0]?.id ?? "");
  const activeTabId = controlledTabId ?? internalTabId;

  const handleTabChange = (id: string) => {
    if (onTabChange) {
      onTabChange(id);
    } else {
      setInternalTabId(id);
    }
  };

  const content = tabContentMap[activeTabId];

  if (!content) return null;

  return (
    <section
      className="py-12 md:py-20 px-4 md:px-8 max-w-screen-xl mx-auto"
      id="bento-canvas"
      aria-label="Feature navigation"
    >
      <div className="relative mt-8 md:mt-10 lg:mt-12 group/track">
        {/* ── Segmented Pill Navigation Track ── */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-full px-3 sm:px-4 flex justify-center pointer-events-none">
          <div
            role="tablist"
            aria-label="Feature tabs"
            // IMPROVEMENT: Removed gap for intertwined look. Added overflow-x-auto for mobile swiping.
            className="flex items-center justify-start sm:justify-center gap-0 p-1.5 rounded-full border border-black/[0.05] relative shadow-sm max-w-[95vw] sm:max-w-4xl pointer-events-auto overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(10px)",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)"
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  // IMPROVEMENT: Removed onMouseEnter and onFocus here.
                  onClick={() => handleTabChange(tab.id)}
                  onKeyDown={(e) => {
                    const currentIdx = tabs.findIndex((t) => t.id === tab.id);
                    if (e.key === "ArrowRight") {
                      e.preventDefault();
                      const nextIdx = (currentIdx + 1) % tabs.length;
                      handleTabChange(tabs[nextIdx].id);
                      document.getElementById(`tab-${tabs[nextIdx].id}`)?.focus()
                    } else if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      const prevIdx = (currentIdx - 1 + tabs.length) % tabs.length;
                      handleTabChange(tabs[prevIdx].id);
                      document.getElementById(`tab-${tabs[prevIdx].id}`)?.focus()
                    }
                  }}
                  // IMPROVEMENT: Adjusted padding slightly to accommodate the no-gap look
                  className={`relative px-4 md:px-6 py-2 rounded-full text-[11px] sm:text-xs md:text-sm font-sans font-semibold transition-colors duration-300 z-10 cursor-pointer whitespace-nowrap outline-none flex-shrink-0 ${
                    isActive
                      ? "text-[#FDFDF9]"
                      : "text-midnight-navy/50 hover:text-midnight-navy/90"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="bentoPill"
                      className="absolute inset-0 rounded-full -z-10"
                      style={{
                        backgroundColor: BRAND_ACCENT,
                        boxShadow: "0 2px 8px rgba(91, 110, 174, 0.35)"
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="relative overflow-hidden shadow-sm"
          style={{
            backgroundColor: "#FAF9F6", // Replaced #F2F1EB with warm signal-white off-tone
            borderRadius: "2.5rem",
          }}
        >
          {/* Subtle grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] z-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-20 p-6 sm:p-8 md:p-12 lg:p-16 pt-24 sm:pt-20 md:pt-24 lg:pt-28">
            {/* ── Bento Content Grid ── */}
          {children ? (
            <div
              role="tabpanel"
              id={`tabpanel-${activeTabId}`}
              aria-labelledby={`tab-${activeTabId}`}
            >
              {children}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTabId}
                role="tabpanel"
                id={`tabpanel-${activeTabId}`}
                aria-labelledby={`tab-${activeTabId}`}
                className="w-full"
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* ── Simplified Two-Column Layout ── */}
                <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch w-full">

                  {/* ── Primary Content Card ── */}
                  <div className="flex-1 bg-white rounded-[1.75rem] p-8 md:p-10 lg:p-14 flex flex-col justify-between min-h-[360px] md:min-h-[460px] relative overflow-hidden group shadow-sm">
                    {/* Decorative corner glow */}
                    <div
                      className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-15 pointer-events-none transition-opacity duration-700 group-hover:opacity-30"
                      style={{ backgroundColor: BRAND_ACCENT }}
                    />

                    <motion.div
                      variants={contentVariants}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-6 relative"
                    >
                      {/* Icon badge */}
                      <div
                        className="inline-flex items-center justify-center h-14 w-14 rounded-2xl"
                        style={{ backgroundColor: BRAND_ACCENT_LIGHT }}
                      >
                        <div style={{ color: BRAND_ACCENT }}>{content.icon}</div>
                      </div>

                      <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-serif font-bold text-midnight-navy leading-[1.15] tracking-tight">
                        {content.headline}
                      </h2>

                      <p className="text-base md:text-lg text-[#333333]/80 font-sans leading-relaxed max-w-xl">
                        {content.description}
                      </p>
                    </motion.div>

                    {/* CTA button */}
                    <motion.div
                      variants={contentVariants}
                      transition={{
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.15,
                      }}
                      className="mt-10"
                    >
                      <button
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm md:text-base font-semibold text-[#FDFDF9] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(91,110,174,0.35)] hover:-translate-y-0.5 hover:gap-3.5 group/btn cursor-pointer"
                        style={{ backgroundColor: BRAND_ACCENT }}
                        aria-label={content.cta}
                        tabIndex={0}
                      >
                        {content.cta}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </button>
                    </motion.div>
                  </div>

                  {/* ── Media Card (Enlarged Portrait 9:16) ── */}
                  <div className="shrink-0 w-[240px] sm:w-[280px] lg:w-[320px] aspect-[9/16] bg-white rounded-[1.75rem] overflow-hidden relative shadow-sm mx-auto">
                    <motion.div
                      variants={imageVariants}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={content.image}
                        alt={content.headline}
                        fill
                        sizes="(max-width: 1024px) 100vw, 320px"
                        className="object-cover"
                        priority
                      />
                      {/* Subtle gradient overlay to match soft aesthetic */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}