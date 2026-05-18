"use client";

import dynamic from "next/dynamic";

const OasisCanvas = dynamic(() => import("@/components/OasisCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#120f0d] text-sm tracking-[0.18em] text-[#f4eadb]/75 uppercase">
      Preparing the lounge...
    </div>
  ),
});

export default function OasisStage() {
  return <OasisCanvas />;
}
