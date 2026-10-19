import React, { useState } from 'react';

// Common local SVG flags as instant offline fallbacks
const LOCAL_FLAGS: Record<string, string> = {
  FR: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="1" height="2" fill="%23002395"/><rect x="1" width="1" height="2" fill="%23ffffff"/><rect x="2" width="1" height="2" fill="%23ed2939"/></svg>`,
  ES: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="2" fill="%23aa151b"/><rect y="0.5" width="3" height="1" fill="%23f1bf00"/></svg>`,
  DE: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3"><rect width="5" height="1" fill="%23000"/><rect y="1" width="5" height="1" fill="%23dd0000"/><rect y="2" width="5" height="1" fill="%23ffce00"/></svg>`,
  IT: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="1" height="2" fill="%23009246"/><rect x="1" width="1" height="2" fill="%23ffffff"/><rect x="2" width="1" height="2" fill="%23ce2b37"/></svg>`,
  GB: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath><clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><g clip-path="url(%23s)"><path d="M0,0 v30 h60 v-30 z" fill="%23012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="%23fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(%23t)" stroke="%23C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="%23fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="%23C8102E" stroke-width="6"/></g></svg>`,
  IE: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="1" height="2" fill="%23169b62"/><rect x="1" width="1" height="2" fill="%23ffffff"/><rect x="2" width="1" height="2" fill="%23ff883e"/></svg>`,
  BE: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="1" height="2" fill="%23000"/><rect x="1" width="1" height="2" fill="%23ffd90c"/><rect x="2" width="1" height="2" fill="%23f31830"/></svg>`,
  NL: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="1" fill="%23ae1c28"/><rect y="1" width="3" height="1" fill="%23fff"/><rect y="1.33" width="3" height="0.67" fill="%2321468b"/></svg>`,
  CH: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23d52b1e"/><rect x="13" y="6" width="6" height="20" fill="%23fff"/><rect x="6" y="13" width="20" height="6" fill="%23fff"/></svg>`,
  PT: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="1.2" height="2" fill="%23046a38"/><rect x="1.2" width="1.8" height="2" fill="%23da291c"/></svg>`,
  MA: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="2" fill="%23c1272d"/><polygon points="1.5,0.6 1.62,0.95 1.98,0.95 1.69,1.17 1.8,1.52 1.5,1.31 1.2,1.52 1.31,1.17 1.02,0.95 1.38,0.95" fill="none" stroke="%23006233" stroke-width="0.04"/></svg>`,
  DZ: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="1.5" height="2" fill="%23006233"/><rect x="1.5" width="1.5" height="2" fill="%23ffffff"/><circle cx="1.5" cy="1" r="0.5" fill="%23d21034"/><circle cx="1.6" cy="1" r="0.4" fill="%23ffffff"/></svg>`,
  US: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 10"><rect width="19" height="10" fill="%23b22234"/><path d="M0,1.5h19M0,3.1h19M0,4.6h19M0,6.2h19M0,7.7h19M0,9.2h19" stroke="%23fff" stroke-width="0.77"/><rect width="7.6" height="5.4" fill="%233c3b6e"/></svg>`,
};

interface CountryFlagProps {
  code?: string;
  country?: string;
  flag?: string;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code,
  country,
  flag,
  className = 'w-5 h-3.5',
}) => {
  const [imgError, setImgError] = useState(false);
  const cleanCode = (code || '').trim().toUpperCase();

  // If known 2-letter ISO code
  if (cleanCode && cleanCode.length === 2 && cleanCode !== 'XX' && cleanCode !== 'INT') {
    // 1. Try FlagCDN (high quality SVG/PNG)
    if (!imgError) {
      return (
        <img
          src={`https://flagcdn.com/w40/${cleanCode.toLowerCase()}.png`}
          srcSet={`https://flagcdn.com/w80/${cleanCode.toLowerCase()}.png 2x`}
          alt={country || cleanCode}
          title={country || cleanCode}
          className={`inline-block object-cover border border-white/20 align-middle shrink-0 shadow-sm ${className}`}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      );
    }

    // 2. Offline fallback to local SVG if FlagCDN cannot be reached
    if (LOCAL_FLAGS[cleanCode]) {
      return (
        <img
          src={LOCAL_FLAGS[cleanCode]}
          alt={country || cleanCode}
          title={country || cleanCode}
          className={`inline-block object-cover border border-white/20 align-middle shrink-0 shadow-sm ${className}`}
        />
      );
    }

    // 3. Fallback to clean styled badge with ISO code
    return (
      <span
        title={country || cleanCode}
        className="inline-block bg-radar-surface px-1 py-0.5 rounded text-[9px] font-mono font-bold text-radar-cyan border border-radar-border shrink-0 align-middle"
      >
        {cleanCode}
      </span>
    );
  }

  // Fallback for International / Unknown
  return (
    <span title={country} className="inline-block shrink-0 align-middle text-sm">
      {flag || '🌐'}
    </span>
  );
};
