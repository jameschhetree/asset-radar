"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ar-black">
      <div className="text-center">
        <h1
          className="text-3xl text-cream tracking-wide"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Asset Radar
        </h1>
        <p className="text-text-secondary mt-2 text-sm tracking-widest uppercase">
          Redirecting...
        </p>
      </div>
    </div>
  );
}
