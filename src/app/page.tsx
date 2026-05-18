import OasisStage from "@/components/OasisStage";

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#120f0d]">
      <OasisStage />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-6 p-6 text-[#f4eadb]">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#f4eadb]/60">
            Phase 1 Foundation
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Focus Oasis</h1>
        </div>

        <div className="text-right text-xs leading-6 text-[#f4eadb]/65">
          <p>Ra Jae-heum</p>
          <p>Student ID 20261027</p>
        </div>
      </div>
    </main>
  );
}
