import type { LucideIcon } from "lucide-react";
import { CardSurface } from "./CardSurface";

interface ProjectedChangeCardProps {
  value: number;
  icon?: LucideIcon;
  positiveLabel: string;
  negativeLabel: string;
}

export function ProjectedChangeCard({ value, icon: Icon, positiveLabel, negativeLabel }: ProjectedChangeCardProps) {
  const isPositive = value >= 0;
  
  return (
    <CardSurface>
      <div className="mb-4">
        <h3 className="text-white text-lg font-semibold mb-1">
          Projected Change
        </h3>
        <p className="text-gray-400 text-sm">
          Expected net change after all transactions are completed
        </p>
      </div>
      <div className="mt-4">
        <div
          className={`
            relative
            bg-gradient-to-br ${isPositive ? "from-green-500/10 via-emerald-500/5 to-green-500/10" : "from-red-500/10 via-rose-500/5 to-red-500/10"}
            border ${isPositive ? "border-green-500/40" : "border-red-500/40"}
            rounded-lg p-6
            transition-all duration-300
            ${isPositive ? "hover:border-green-500/60 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]" : "hover:border-red-500/60 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]"}
            motion-safe:transition-all
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-gray-400 text-sm font-medium">
                {isPositive ? positiveLabel : negativeLabel}
              </p>
              <div className="flex flex-col gap-1">
                <p
                  className={`text-3xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}
                >
                  {isPositive ? "+" : ""}${value.toFixed(2)}
                </p>
              </div>
            </div>
            {Icon && (
              <div className={`p-3 rounded-lg ${isPositive ? "bg-green-500/20" : "bg-red-500/20"} transition-transform duration-300 motion-safe:hover:scale-110 motion-reduce:transition-none`}>
                <Icon className={`w-5 h-5 ${isPositive ? "text-green-400" : "text-red-400"}`} />
              </div>
            )}
          </div>
        </div>
      </div>
    </CardSurface>
  );
}
