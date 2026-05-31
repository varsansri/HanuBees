"use client";

import dynamic from "next/dynamic";

export const ShaderBackground = dynamic(
  () => import("./ShaderBackground"),
  { ssr: false }
);

export const Scene3D = dynamic(
  () => import("./Scene3D"),
  { ssr: false }
);
