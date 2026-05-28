import Image from "next/image";
import Link from "next/link";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
        <Image
          src="/empresario.png"
          alt="Empresario"
          width={500}
          height={195}
          priority
          className="h-10 w-auto invert"
        />
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-semibold rounded-md border border-white/20 hover:border-white hover:bg-white hover:text-black transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Globe — sits behind, centered */}
      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-90">
        <RotatingEarth width={900} height={900} />
      </div>

      {/* Hero copy */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pointer-events-none">
        <Image
          src="/empresario.png"
          alt="Empresario"
          width={500}
          height={195}
          priority
          className="h-28 md:h-36 w-auto invert mb-6"
        />
        <p className="max-w-xl text-sm md:text-base text-slate-300 mb-10">
          The judging portal for E-Cell IIT Kharagpur&apos;s flagship startup competition.
          Pitch decks, panel rounds, and live leaderboards — in one place.
        </p>
        <div className="flex items-center gap-3 pointer-events-auto">
          <Link
            href="/login"
            className="px-6 py-3 rounded-md bg-white text-black font-semibold hover:bg-slate-200 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-md border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
          >
            Register as Participant
          </Link>
        </div>
      </main>
    </div>
  );
}
