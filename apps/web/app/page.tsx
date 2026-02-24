"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { IndustrialArtifacts } from "./components/industrial-artifacts";
import { Manifesto } from "./components/manifesto";
import { Protocol } from "./components/protocol";
import { FeaturedInventory } from "./components/featured-inventory";
import { SafetyModal } from "./components/safety-modal";
import { Footer } from "./components/footer";

import { useMarketplace } from "./hooks/use-marketplace";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { listings, fetchFeaturedListings } = useMarketplace();

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <main className="min-h-screen bg-signal-white">
      <Navbar />
      <Hero />
      <IndustrialArtifacts />
      <FeaturedInventory onRentClick={openModal} listings={listings} />
      <Manifesto />
      <Protocol />
      <Footer />

      <SafetyModal isOpen={isModalOpen} onClose={closeModal} />
    </main>
  );
}
