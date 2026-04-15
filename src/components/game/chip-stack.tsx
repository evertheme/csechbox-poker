import { cn } from "@/lib/utils";
import { formatChips } from "@/lib/utils";

interface ChipStackProps {
  amount: number;
  className?: string;
  label?: string;
}

export function ChipStack({ amount, className, label }: ChipStackProps) {
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-yellow-400 border border-yellow-600">
        <span>●</span>
        <span>{formatChips(amount)}</span>
      </div>
      {label && <span className="text-xs text-zinc-500">{label}</span>}
    </div>
  );
}
