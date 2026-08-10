"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Self-contained WebGL renderer — no three.js tree to conflict with React 19.
// Loaded client-only so the shader module never touches `window` during SSR.
const ShaderGradientCanvas = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradientCanvas),
  { ssr: false }
);

const ShaderGradient = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradient),
  { ssr: false }
);

/**
 * Mint water-plane shader (shadergradient.co) — the landing page background.
 * One palette (#94ffd1 / #6bf5ff / #ffffff) reads as a soft pastel wash in
 * light mode and a glowing aurora in dark mode; only the overlay opacity shifts.
 * Reduced-motion users get a single static frame (animate="off").
 */
export default function ShaderBackground({ isDark }: { isDark: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const [fadedIn, setFadedIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFadedIn(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      aria-hidden
      className={`absolute inset-0 transition-opacity duration-1000 ${
        fadedIn ? (isDark ? "opacity-40" : "opacity-35") : "opacity-0"
      }`}
    >
      <ShaderGradientCanvas style={{ width: "100%", height: "100%" }} fov={45}>
        <ShaderGradient
          control="props"
          type="waterPlane"
          animate={prefersReducedMotion ? "off" : "on"}
          brightness={1.2}
          cAzimuthAngle={170}
          cDistance={4.4}
          cPolarAngle={70}
          cameraZoom={1}
          color1="#94ffd1"
          color2="#6bf5ff"
          color3="#ffffff"
          envPreset="city"
          lightType="3d"
          positionX={0}
          positionY={0.9}
          positionZ={-0.3}
          reflection={0.1}
          rotationX={45}
          rotationY={0}
          rotationZ={0}
          shader="defaults"
          uAmplitude={0}
          uDensity={1.2}
          uFrequency={0}
          uSpeed={0.2}
          uStrength={3.4}
          uTime={0}
          wireframe={false}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
