import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 felt-texture min-h-screen">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">Poker Stud</h1>
          <p className="text-xl text-green-100">
            Play 7-Card Stud with friends online
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-8">
          <Link
            href="/lobby"
            className={cn(buttonVariants({ size: "lg" }), "w-full text-lg")}
          >
            Enter Lobby
          </Link>

          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "w-full text-lg border-white/30 text-white hover:bg-white/10 hover:text-white"
            )}
          >
            Sign In
          </Link>
        </div>

        <div className="pt-8 text-sm text-green-200">
          <p>No download required • Play in your browser</p>
        </div>
      </div>
    </main>
  );
}
