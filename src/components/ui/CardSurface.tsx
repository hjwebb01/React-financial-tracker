import type { ReactNode } from "react";

interface CardSurfaceProps {
  children: ReactNode;
  className?: string;
}

export function CardSurface({ children, className = "" }: CardSurfaceProps) {
  return (
    <div
      className={`
        relative
        bg-gradient-to-br from-[#2a2a2a] via-[#252525] to-[#2a2a2a]
        border border-gray-700/50
        rounded-lg
        p-6
        backdrop-blur-sm
        transition-all duration-300 ease-out
        hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]
        motion-safe:hover:-translate-y-0.5
        before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:pointer-events-none before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        motion-reduce:transition-none motion-reduce:hover:translate-y-0
        ${className}
      `}
    >
      {children}
    </div>
  );
}
