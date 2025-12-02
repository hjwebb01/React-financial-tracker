export function Logo() {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <div className="relative w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.125)]">
        <svg
          viewBox="0 0 100 100"
          className="w-10 h-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="topChevron" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>

            <linearGradient id="bottomChevron" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>

            <filter id="chevronGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.13
                        0 0 0 0 0.83
                        0 0 0 0 0.93
                        0 0 0 0.6 0"
              />
            </filter>
          </defs>

          <g filter="url(#chevronGlow)" opacity="0.1">
            <path d="M20 45 L50 20 L80 45 L70 45 L50 30 L30 45 Z" fill="#22d3ee" />
            <path d="M20 70 L50 45 L80 70 L70 70 L50 55 L30 70 Z" fill="#0ea5e9" />
          </g>

          <path
            d="M20 45 L50 20 L80 45 L70 45 L50 30 L30 45 Z"
            fill="url(#topChevron)"
          />

          <path
            d="M20 70 L50 45 L80 70 L70 70 L50 55 L30 70 Z"
            fill="url(#bottomChevron)"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-extrabold bg-linear-to-r from-green-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.05)] tracking-tight">
        BudgetWise
      </h1>
    </div>
  );
}

