"use client";

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export default function ShaderBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <ShaderGradientCanvas
        style={{ width: "100%", height: "100%" }}
        pointerEvents="none"
      >
        <ShaderGradient
          type="waterPlane"
          animate="on"
          uTime={0.2}
          uSpeed={0.3}
          uStrength={2.5}
          uDensity={1.2}
          uFrequency={5.5}
          uAmplitude={4}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={45}
          rotationY={0}
          rotationZ={-45}
          color1="#f5a623"
          color2="#1a0530"
          color3="#06060f"
          lightType="3d"
          envPreset="city"
          grain="on"
          brightness={1}
          reflection={0.2}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
