"use client";

import React, { useState, useEffect } from "react";

export default function DynamicGreeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Halo");
  const [icon, setIcon] = useState("👋");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Selamat Pagi");
      setIcon("☀️");
    } else if (hour >= 12 && hour < 15) {
      setGreeting("Selamat Siang");
      setIcon("🌤️");
    } else if (hour >= 15 && hour < 18) {
      setGreeting("Selamat Sore");
      setIcon("🌇");
    } else {
      setGreeting("Selamat Malam");
      setIcon("🌙");
    }
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5 transition-all">
      {greeting}, <span className="font-semibold text-on-surface">{name}</span> {icon}
    </span>
  );
}
