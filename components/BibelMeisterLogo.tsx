export default function BibelMeisterLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: Math.round(size * 0.2167) }}
    >
      <rect width="120" height="120" fill="#0F172A" />
      <path d="M10 90 Q30 75 50 80 Q70 85 110 65" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M10 78 Q30 60 52 68 Q72 75 110 50" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.75"/>
      <path d="M10 65 Q32 44 55 54 Q75 62 110 36" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M10 52 Q34 28 57 40 Q78 50 110 22" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <line x1="110" y1="16" x2="110" y2="28" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="104" y1="22" x2="116" y2="22" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="106" y1="18" x2="114" y2="26" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
      <line x1="114" y1="18" x2="106" y2="26" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
      <circle cx="110" cy="22" r="1.5" fill="#FFFBEB"/>
    </svg>
  );
}
