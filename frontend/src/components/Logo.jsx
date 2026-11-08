export const Logo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" data-testid="logo-svg">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#6EA8FF" />
        <stop offset="55%" stopColor="#3B7BFF" />
        <stop offset="100%" stopColor="#F5C76B" />
      </linearGradient>
    </defs>
    <path d="M24 3 L42 13.5 V34.5 L24 45 L6 34.5 V13.5 Z" stroke="url(#lg1)" strokeWidth="2.5" fill="rgba(59,123,255,0.08)" />
    <path d="M33 18 H21 M21 18 V30 M21 24 H30 M21 30 H33" stroke="#F5C76B" strokeWidth="3" strokeLinecap="round" />
    <circle cx="24" cy="24" r="19.5" stroke="rgba(245,199,107,0.25)" strokeWidth="1" strokeDasharray="3 4" />
  </svg>
);
