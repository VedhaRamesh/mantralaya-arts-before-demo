import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textClassName = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8 sm:w-9 sm:h-9', svg: 36 },
    md: { box: 'w-10 h-10', svg: 42 },
    lg: { box: 'w-14 h-14', svg: 56 },
    xl: { box: 'w-18 h-18', svg: 72 },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Sacred Devotional Lotus Flower Insignia */}
      <div
        className={`${currentSize.box} rounded-xl bg-gradient-to-br from-[#701A1E] via-[#581216] to-[#3B0A0D] p-1 flex items-center justify-center shadow-md border border-amber-400/35 shrink-0 relative overflow-hidden group`}
      >
        {/* Soft divine radiating aura */}
        <div className="absolute inset-0 bg-radial from-amber-400/25 via-amber-500/5 to-transparent pointer-events-none" />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Mantralaya Arts Sacred Lotus Flower Emblem"
        >
          <defs>
            {/* Primary Golden Radiance Gradient */}
            <linearGradient id="lotusGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9E6" />
              <stop offset="25%" stopColor="#FDE68A" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>

            {/* Saffron & Vermilion Devotional Accent Gradient for Inner Petals */}
            <linearGradient id="lotusCrimsonGoldGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="30%" stopColor="#FBBF24" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Outer Petals Depth Gradient */}
            <linearGradient id="lotusOuterPetalGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="40%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Glowing Center Stamen Filter */}
            <filter id="lotusGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* 1. Base Padma Pedestal (Water Lily / Lotus Seat) */}
          <path
            d="M26 82 C34 85 42 86 50 86 C58 86 66 85 74 82 C71 85 62 88 50 88 C38 88 29 85 26 82 Z"
            fill="url(#lotusGoldGrad)"
            opacity="0.85"
          />
          <path
            d="M32 86 C40 88 45 89 50 89 C55 89 60 88 68 86 C64 89 58 91 50 91 C42 91 36 89 32 86 Z"
            fill="url(#lotusCrimsonGoldGrad)"
            opacity="0.6"
          />

          {/* 2. Lower Lateral Blooming Petals (Deepest Layer) */}
          {/* Left Lower Petal */}
          <path
            d="M50 78 C35 77 20 73 13 62 C18 59 28 61 38 68 C44 72 48 76 50 78 Z"
            fill="url(#lotusGoldGrad)"
            opacity="0.9"
          />
          {/* Right Lower Petal */}
          <path
            d="M50 78 C65 77 80 73 87 62 C82 59 72 61 62 68 C56 72 52 76 50 78 Z"
            fill="url(#lotusGoldGrad)"
            opacity="0.9"
          />

          {/* 3. Outer Mid Blooming Petals (Wide Open Layer) */}
          {/* Left Mid-Outer Petal */}
          <path
            d="M50 77 C36 74 18 64 16 46 C24 44 34 50 42 62 C46 68 49 74 50 77 Z"
            fill="url(#lotusOuterPetalGrad)"
          />
          {/* Right Mid-Outer Petal */}
          <path
            d="M50 77 C64 74 82 64 84 46 C76 44 66 50 58 62 C54 68 51 74 50 77 Z"
            fill="url(#lotusOuterPetalGrad)"
          />

          {/* 4. Secondary Intermediate Petals (Graceful Upward Curves) */}
          {/* Left Intermediate Petal */}
          <path
            d="M50 76 C40 72 26 58 30 32 C37 36 43 46 47 62 C49 68 50 73 50 76 Z"
            fill="url(#lotusCrimsonGoldGrad)"
          />
          {/* Right Intermediate Petal */}
          <path
            d="M50 76 C60 72 74 58 70 32 C63 36 57 46 53 62 C51 68 50 73 50 76 Z"
            fill="url(#lotusCrimsonGoldGrad)"
          />

          {/* 5. Inner Flanking Petals (Cradling Center) */}
          {/* Left Inner Petal */}
          <path
            d="M50 75 C43 69 35 56 38 24 C44 32 48 44 50 62 C50 67 50 72 50 75 Z"
            fill="url(#lotusGoldGrad)"
          />
          {/* Right Inner Petal */}
          <path
            d="M50 75 C57 69 65 56 62 24 C56 32 52 44 50 62 C50 67 50 72 50 75 Z"
            fill="url(#lotusGoldGrad)"
          />

          {/* 6. Central Sacred Lotus Petal (Divine Apex) */}
          <path
            d="M50 14 C41 28 39 46 43 64 C45 71 48 75 50 76 C52 75 55 71 57 64 C61 46 59 28 50 14 Z"
            fill="url(#lotusGoldGrad)"
            stroke="#FEF08A"
            strokeWidth="0.6"
          />

          {/* 7. Inner Sacred Lotus Core / Bud */}
          <path
            d="M50 24 C45 36 44 52 49 68 C50 71 50 73 50 73 C50 73 50 71 51 68 C56 52 55 36 50 24 Z"
            fill="url(#lotusCrimsonGoldGrad)"
            opacity="0.85"
          />

          {/* Central spine highlight on main petal */}
          <line
            x1="50"
            y1="18"
            x2="50"
            y2="64"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* 8. Sacred Lotus Stamens & Center Pericarp Seed Pod (Golden Bindu) */}
          <circle cx="50" cy="74" r="3" fill="#FFFBEB" filter="url(#lotusGlow)" />
          <circle cx="50" cy="74" r="1.8" fill="#F59E0B" />
          <circle cx="44" cy="75" r="1.4" fill="#FDE68A" />
          <circle cx="56" cy="75" r="1.4" fill="#FDE68A" />
          <circle cx="39" cy="77" r="1.1" fill="#FBBF24" />
          <circle cx="61" cy="77" r="1.1" fill="#FBBF24" />
        </svg>
      </div>

      {showText && (
        <div className={`flex flex-col min-w-0 ${textClassName}`}>
          <span className="font-cinzel text-base font-bold tracking-wider text-amber-100 uppercase truncate">
            Mantralaya Arts
          </span>
          <span className="text-[10px] text-amber-200/70 tracking-widest font-sans uppercase truncate">
            Temple Gifts &amp; Pooja Essentials
          </span>
        </div>
      )}
    </div>
  );
};
