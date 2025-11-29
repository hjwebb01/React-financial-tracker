import type { LucideIcon } from "lucide-react";

interface SumCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export function SumCard({ title, value, icon: Icon, iconBgColor, iconColor }: SumCardProps) {
  return (
    <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-gray-400 text-sm">{title}</p>
          <div className="flex flex-col gap-1">
            <p className="text-white text-xl font-semibold">
              ${value.toFixed(2)}
            </p>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}