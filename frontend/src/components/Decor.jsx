// Shared decorative elements matching the reference designs
// (floating 3D gold coins, sparkles, ribbons, tech lines, page background).

export const ASSETS = {
  coin: "/assets/gold_coin.webp",
  trophy: "/assets/gold_trophy.webp",
  hexCheck: "/assets/hex_check.webp",
  ticket: "/assets/code_ticket.webp",
  service: "/assets/service_hex.webp",
};

export const PageBg = () => <div className="page-bg" aria-hidden="true" />;

export const Coin = ({ size = 48, rotate = 0, delay = 0, className = "", style = {} }) => (
  <span aria-hidden="true" className={`absolute pointer-events-none select-none float-y2 ${className}`}
    style={{ width: size, animationDelay: `${delay}s`, ...style }}>
    <img src={ASSETS.coin} alt="" draggable={false} className="block w-full h-auto"
      style={{ transform: `rotate(${rotate}deg)`, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))" }} />
  </span>
);

export const Sparkle = ({ size = 16, color = "#F8D78C", delay = 0, className = "", style = {} }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"
    className={`absolute pointer-events-none twinkle ${className}`} style={{ animationDelay: `${delay}s`, ...style }}>
    <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill={color}
      style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
  </svg>
);

export const Ribbon = ({ className = "", style = {}, flip = false, color = "gold" }) => {
  const id = `rb-${color}-${flip ? 1 : 0}`;
  const stops = color === "gold"
    ? ["#FCE3A2", "#E9AE4C", "#9C6418"]
    : ["#7CC0FF", "#2F6BFF", "#173B9E"];
  return (
    <svg viewBox="0 0 120 200" aria-hidden="true" className={`absolute pointer-events-none ${className}`}
      style={{ transform: flip ? "scaleX(-1)" : undefined, ...style }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={stops[0]} /><stop offset="55%" stopColor={stops[1]} /><stop offset="100%" stopColor={stops[2]} />
        </linearGradient>
      </defs>
      <path d="M110 0 C40 40 10 90 30 140 C40 165 70 185 100 200 C60 175 35 150 32 120 C30 80 60 40 110 0 Z" fill={`url(#${id})`} opacity="0.9" />
    </svg>
  );
};

// thin neon tech divider (blue lines with a gold center segment)
export const TechLine = ({ className = "" }) => (
  <svg viewBox="0 0 360 16" className={`w-full ${className}`} aria-hidden="true" preserveAspectRatio="none" style={{ height: 14 }}>
    <path d="M0 3 H70 L82 12 H140" stroke="rgba(95,176,255,0.7)" strokeWidth="1.2" fill="none" />
    <path d="M360 3 H290 L278 12 H220" stroke="rgba(95,176,255,0.7)" strokeWidth="1.2" fill="none" />
    <rect x="150" y="9" width="60" height="4" rx="2" fill="#F5C76B" style={{ filter: "drop-shadow(0 0 4px #F5C76B)" }} />
    <rect x="96" y="9" width="22" height="2.5" rx="1" fill="#5FB0FF" />
    <rect x="242" y="9" width="22" height="2.5" rx="1" fill="#5FB0FF" />
  </svg>
);

export const TechFrame = ({ children, className = "", innerClassName = "", variant = "gold", cut = 18, glow = true, ...rest }) => (
  <div className={glow ? (variant === "gold" ? "tech-glow-gold" : "tech-glow") : ""}>
    <div className={`tech-frame ${variant === "blue" ? "blue" : ""} ${className}`} style={{ "--cut": `${cut}px` }} {...rest}>
      <div className={`tech-inner ${innerClassName}`}>{children}</div>
    </div>
  </div>
);
