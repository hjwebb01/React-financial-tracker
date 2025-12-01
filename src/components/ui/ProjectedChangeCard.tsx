import type { LucideIcon } from "lucide-react";

interface ProjectedChangeCardProps {
  value: number;
  icon?: LucideIcon;
  positiveLabel: string;
  negativeLabel: string;
}

export function ProjectedChangeCard({ value, icon: Icon, positiveLabel, negativeLabel }: ProjectedChangeCardProps) {
  const isPositive = value >= 0;
  
  return (
    <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
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
          className={`bg-[#2a2a2a] border rounded-lg p-6 ${isPositive ? "bg-green-500/10 border-green-500" : "bg-red-500/10 border-red-500"}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-gray-400 text-sm">
                {isPositive ? positiveLabel : negativeLabel}
              </p>
              <div className="flex flex-col gap-1">
                <p
                  className={`text-3xl font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}
                >
                  {isPositive ? "+" : ""}${value.toFixed(2)}
                </p>
              </div>
            </div>
            {Icon && (
              <div className={`p-3 rounded-lg ${isPositive ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <Icon className={`w-5 h-5 ${isPositive ? "text-green-500" : "text-red-500"}`} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
