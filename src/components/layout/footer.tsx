export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 px-4 py-4">
      <p className="text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Poker. All rights reserved.
      </p>
    </footer>
  );
}
