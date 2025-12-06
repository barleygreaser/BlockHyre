"use client";

import { useState } from "react";
import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { ValueProps } from "./components/value-props";
import { FeaturedInventory } from "./components/featured-inventory";
import { SafetyModal } from "./components/safety-modal";
import { Footer } from "./components/footer";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ValueProps />
      <FeaturedInventory onRentClick={openModal} />
      <Footer />

      <SafetyModal isOpen={isModalOpen} onClose={closeModal} />
    </main>
  );
}
