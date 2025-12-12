import type { LucideIcon } from "lucide-react";
import { CardSurface } from "./CardSurface";

interface SumCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export function SumCard({ title, value, icon: Icon, iconBgColor, iconColor }: SumCardProps) {
  return (
    <CardSurface>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <div className="flex flex-col gap-1">
            <p className="text-white text-xl font-semibold">
              ${value.toFixed(2)}
            </p>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${iconBgColor} transition-transform duration-300 motion-safe:hover:scale-110 motion-reduce:transition-none`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </CardSurface>
  );
}