export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-4 border-[#C5A880]/20 border-t-[#C5A880] rounded-full animate-spin"></div>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C5A880]">Preparing Your Piece...</p>
      </div>
    </div>
  );
}
