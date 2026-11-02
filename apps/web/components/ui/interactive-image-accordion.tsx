"use client";

import React, { useState, KeyboardEvent, memo, useRef } from "react";
import Link from "next/link";
// Note: If Supabase domain is added to next.config.js, import Image from "next/image"
// and replace the <img> tag for built-in WebP optimization.

// --- Types ---
interface AccordionItemData {
  id: number;
  title: string;
  heading: string;
  subheading: string;
  description: string;
  imageUrl: string;
}

interface AccordionItemProps {
  item: AccordionItemData;
  isActive: boolean;
  onActivate: () => void;
}

// --- Data ---
const accordionItems: AccordionItemData[] = [
  {
    id: 1,
    title: "Power Washers",
    heading: "Deep Clean.",
    subheading: "Power Washers",
    description: "Tackle the toughest grime with commercial-grade power washers. Perfect for restoring driveways, decks, and siding to their original condition.",
    imageUrl: "https://uttbptpkekijlfzvauzu.supabase.co/storage/v1/object/public/category-images/powerwasher.png",
  },
  {
    id: 2,
    title: "Car Care",
    heading: "Showroom Finish.",
    subheading: "Auto Detailing",
    description: "Professional quality polishers, extractors, and detailing equipment. Achieve showroom results from your own driveway without the heavy investment.",
    imageUrl: "https://uttbptpkekijlfzvauzu.supabase.co/storage/v1/object/public/category-images/carcare.png",
  },
  {
    id: 3,
    title: "Party Supplies",
    heading: "Event Ready.",
    subheading: "Block Parties",
    description: "From commercial tents and PA systems to bounce houses and specialized lighting. Everything you need to host a memorable block party or backyard event.",
    imageUrl: "https://uttbptpkekijlfzvauzu.supabase.co/storage/v1/object/public/category-images/party.png",
  },
  {
    id: 4,
    title: "Outdoor Gear",
    heading: "Venture Out.",
    subheading: "Expedition Assets",
    description: "High-end camping setups, roof boxes, and expedition gear. Explore the outdoors without the storage burden of rarely used equipment.",
    imageUrl: "https://uttbptpkekijlfzvauzu.supabase.co/storage/v1/object/public/category-images/camping.png",
  },
  {
    id: 5,
    title: "Prepping & Freeze Drying",
    heading: "Long-term Resilience.",
    subheading: "Preservation Tools",
    description: "Access commercial freeze dryers, heavy-duty vacuum sealers, and processing equipment. Build your home storage efficiently with neighborly shared protocols.",
    imageUrl: "https://uttbptpkekijlfzvauzu.supabase.co/storage/v1/object/public/category-images/freezedryer.png",
  },
];

// --- Accordion Item Component (Memoized for Performance) ---
const AccordionItem = memo(({ item, isActive, onActivate }: AccordionItemProps) => {
  // Use a ref to store the timeout ID so we can clear it if the mouse leaves early
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // Wait 150ms before activating. Adjust this value to feel natural.
    timeoutRef.current = setTimeout(() => {
      onActivate();
    }, 150);
  };

  const handleMouseLeave = () => {
    // If the mouse leaves before the 250ms is up, cancel the activation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isActive}
      onMouseEnter={handleMouseEnter} // Updated
      onMouseLeave={handleMouseLeave} // Added
      onClick={onActivate}
      onKeyDown={handleKeyDown}
      className={`
        relative rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-electric-indigo focus:ring-offset-2
        ${isActive ? "h-[250px] md:h-[560px] w-full md:w-[315px]" : "h-[60px] md:h-[560px] w-full md:w-[60px]"}
      `}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        loading={isActive ? "eager" : "lazy"}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "https://placehold.co/400x450/2d3748/ffffff?text=Image+Error";
        }}
      />

      {/* Dark overlay for contrast */}
      <div className={`absolute inset-0 transition-colors duration-500 ${isActive ? 'bg-charcoal/40' : 'bg-charcoal/70'}`} />

      {/* Caption Text */}
      {/* Mobile: left-aligned, vertically centered. Desktop: anchored at bottom, inactive slides up 220px and rotates. */}
      <span
        className={`
          absolute transform-gpu text-signal-white text-lg font-serif font-semibold whitespace-nowrap
          transition-all duration-500 ease-in-out origin-center
          left-6 top-1/2
          md:top-auto md:bottom-8 md:left-1/2
          ${isActive
            ? "-translate-y-1/2 rotate-0 md:-translate-x-1/2 md:translate-y-0 md:rotate-0 opacity-100"
            : "-translate-y-1/2 rotate-0 md:-translate-x-1/2 md:-translate-y-[220px] md:-rotate-90 opacity-80"
          }
        `}
      >
        {item.title}
      </span>
    </div>
  );
});

AccordionItem.displayName = "AccordionItem";

// --- Main App Component ---
export function LandingAccordionItem() {
  const [activeIndex, setActiveIndex] = useState<number>(4);

  return (
    <div className="bg-concrete/30 border-y border-concrete-dark/20 font-sans relative overflow-hidden">
      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <section className="container mx-auto px-4 py-12 md:py-24 relative z-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">

          {/* Left Side: Text Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left flex flex-col justify-center min-h-[250px] lg:min-h-[300px]">
            <div
              key={activeIndex}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards"
              role="region"
              aria-live="polite"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-midnight-navy leading-tight tracking-tighter">
                {accordionItems[activeIndex].heading} <br />
                <span className="text-electric-indigo">{accordionItems[activeIndex].subheading}</span>
              </h1>
              <p className="mt-4 lg:mt-6 text-base lg:text-lg text-midnight-navy/70 max-w-xl mx-auto lg:mx-0 min-h-[84px]">
                {accordionItems[activeIndex].description}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href={`/listings?category=${encodeURIComponent(accordionItems[activeIndex].title)}`}
                  className="w-full sm:w-auto text-center inline-block bg-midnight-navy text-signal-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-electric-indigo hover:-translate-y-1 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-electric-indigo focus:ring-offset-2"
                  aria-label={`View listings for ${accordionItems[activeIndex].title}`}
                >
                  View {accordionItems[activeIndex].title}
                </Link>
                <Link
                  href="/listings"
                  className="w-full sm:w-auto text-center inline-block bg-transparent text-midnight-navy border border-midnight-navy/20 font-semibold px-8 py-3 rounded-xl hover:bg-midnight-navy/5 hover:border-midnight-navy/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-midnight-navy focus:ring-offset-2"
                >
                  View All Categories
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side: Image Accordion */}
          <div className="w-full lg:w-1/2">
            {/* Switched to flex-col for mobile, flex-row for desktop */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 p-2 md:p-4 w-full h-[550px] md:h-[560px]">
              {accordionItems.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isActive={index === activeIndex}
                  onActivate={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}