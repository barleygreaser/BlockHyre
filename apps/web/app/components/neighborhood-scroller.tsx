"use client";

import React from "react";
import { Building2, Trees, MapPin, Factory, Home, Building, Warehouse, Store } from "lucide-react";

const NEIGHBORHOODS = [
  { name: "Downtown Core", icon: Building2 },
  { name: "Westside Residential", icon: Trees },
  { name: "Financial District", icon: Building },
  { name: "Industrial East", icon: Factory },
  { name: "North Hills", icon: Home },
  { name: "Historic South End", icon: Warehouse },
  { name: "University Square", icon: MapPin },
  { name: "Arts & Culture", icon: Store },
];

export function NeighborhoodScroller() {
  // Use two sets of data for a perfect loop (0% to -50%)
  const scrollItems = [...NEIGHBORHOODS, ...NEIGHBORHOODS];

  return (
    <section className="relative w-full bg-gray-50 border-b border-gray-200 py-6 overflow-hidden flex items-center group">

      {/* Left/Right Fade Masks for a premium look */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {scrollItems.map((ns, idx) => {
          const Icon = ns.icon;
          return (
            <div
              key={idx}
              // Hide duplicates from screen readers
              aria-hidden={idx >= NEIGHBORHOODS.length}
              className="flex items-center gap-4 px-10 md:px-14 text-gray-400 hover:text-gray-900 transition-colors duration-300 cursor-default group/item"
            >
              <Icon className="w-5 h-5 text-gray-300 group-hover/item:text-gray-900 transition-colors duration-300" />
              <span className="font-mono text-sm uppercase tracking-widest font-semibold whitespace-nowrap">
                {ns.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scoped CSS for the animation */}
    </section>
  );
}
