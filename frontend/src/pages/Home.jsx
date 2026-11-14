import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Search, ChevronRight, Trophy, Info } from "lucide-react";
import { Logo } from "@/components/Logo";
import { WinModal } from "@/components/WinModal";
import { Coin, Sparkle, Ribbon, TechFrame } from "@/components/Decor";
import { validateCode, spin, getRecentWinners, getPoolStats } from "@/api";
import { playClick, playSpin, playWin } from "@/sound";
import { toast } from "sonner";

const PRIZES = [8888, 1888, 588, 58, 18, 8];
const SEGMENTS = Array.from({ length: 12 }, (_, i) => PRIZES[i % PRIZES.length]);
const SEG_DEG = 360 / SEGMENTS.length;

const Wheel = ({ rotation, spinning, ready, onSpin }) => {
  const S = 400, c = S / 2, r = 172;
  const polar = (rad, deg) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [c + rad * Math.cos(a), c + rad * Math.sin(a)];
  };
  return (
    <div className="relative mx-auto" style={{ width: "min(88vw, 356px)", aspectRatio: "1 / 1" }}>
      <div className="absolute -inset-5 rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.5) 50%, rgba(37,99,235,0) 72%)", filter: "blur(16px)" }} />
      <div className="absolute inset-0 rounded-full wheel-outer-glow" />

      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="wGoldRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF1C4" /><stop offset="30%" stopColor="#F2C063" />
            <stop offset="55%" stopColor="#9C6418" /><stop offset="80%" stopColor="#F5CD78" /><stop offset="100%" stopColor="#B57A25" />
          </linearGradient>
          <linearGradient id="wBlueRing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93C5FD" /><stop offset="50%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={197} fill="#0A1230" stroke="url(#wBlueRing)" strokeWidth="5" />
        <circle cx={c} cy={c} r={186} fill="none" stroke="rgba(96,165,250,0.3)" strokeWidth="1" />
      </svg>

      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 w-full h-full"
        style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4.6s cubic-bezier(0.12, 0.85, 0.08, 1)" : "none" }}>
        <defs>
          <radialGradient id="segBlue" cx="50%" cy="50%" r="50%">
            <stop offset="25%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#1E40AF" />
          </radialGradient>
          <radialGradient id="segDark" cx="50%" cy="50%" r="50%">
            <stop offset="25%" stopColor="#1A2440" /><stop offset="100%" stopColor="#0A0F24" />
          </radialGradient>
          <linearGradient id="wGoldTxt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF8E7" /><stop offset="55%" stopColor="#F7D082" /><stop offset="100%" stopColor="#E0A443" />
          </linearGradient>
          <linearGradient id="wGoldRim2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF1C4" /><stop offset="30%" stopColor="#F2C063" />
            <stop offset="55%" stopColor="#A86E1E" /><stop offset="80%" stopColor="#F5CD78" /><stop offset="100%" stopColor="#B57A25" />
          </linearGradient>
        </defs>
        {SEGMENTS.map((p, i) => {
          const [x0, y0] = polar(r, i * SEG_DEG);
          const [x1, y1] = polar(r, (i + 1) * SEG_DEG);
          const mid = i * SEG_DEG + SEG_DEG / 2;
          const [ax, ay] = polar(r * 0.74, mid);
          const [ux, uy] = polar(r * 0.56, mid);
          const blue = i % 2 === 0;
          return (
            <g key={i}>
              <path d={`M ${c} ${c} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`}
                fill={blue ? "url(#segBlue)" : "url(#segDark)"} stroke="rgba(245,199,107,0.5)" strokeWidth="1.2" />
              <text x={ax} y={ay} transform={`rotate(${mid} ${ax} ${ay})`} textAnchor="middle" dominantBaseline="middle"
                fill="url(#wGoldTxt)" fontSize={p >= 1000 ? 26 : 30} fontWeight="800" fontFamily="'JetBrains Mono', monospace"
                style={{ paintOrder: "stroke", stroke: "rgba(40,20,0,0.35)", strokeWidth: 1 }}>{p}</text>
              <text x={ux} y={uy} transform={`rotate(${mid} ${ux} ${uy})`} textAnchor="middle" dominantBaseline="middle"
                fill={blue ? "#FFE899" : "#BFDBFE"} fontSize="14" fontWeight="800" fontFamily="'JetBrains Mono', monospace" letterSpacing="1">USDT</text>
            </g>
          );
        })}
        <circle cx={c} cy={c} r={r + 6} fill="none" stroke="url(#wGoldRim2)" strokeWidth="12" />
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(90,50,5,0.6)" strokeWidth="1.5" />
        {Array.from({ length: 24 }).map((_, i) => {
          const [bx, by] = polar(r + 6, i * 15 + 7.5);
          return <circle key={i} cx={bx} cy={by} r="2.6" fill={i % 2 ? "#FFF6D8" : "#FFD27A"}
            opacity={spinning ? (i % 2 ? 1 : 0.5) : 0.85} style={{ filter: "drop-shadow(0 0 4px #FFE7A8)" }} />;
        })}
      </svg>

      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <defs>
          <radialGradient id="knob" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF6D8" /><stop offset="45%" stopColor="#F2C063" /><stop offset="100%" stopColor="#8A5512" />
          </radialGradient>
          <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" /><stop offset="55%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={r - 2} fill="url(#gloss)" />
        {[0, 90, 180, 270].map((d) => {
          const [kx, ky] = polar(r + 6, d);
          return <circle key={d} cx={kx} cy={ky} r="10" fill="url(#knob)" stroke="#6B3F0A" strokeWidth="1" />;
        })}
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center" style={{ width: "31%" }}>
        {ready && !spinning && <span className="absolute inset-0 rounded-full pulse-ring" style={{ border: "3px solid rgba(248,215,140,0.8)" }} />}
        <button data-testid="spin-btn" onClick={onSpin} disabled={!ready || spinning}
          className={`hub-btn relative w-full aspect-square rounded-full flex flex-col items-center justify-center text-white ${!ready && !spinning ? "locked cursor-not-allowed" : ""}`}>
          <span className="font-black leading-none" style={{ fontSize: "clamp(15px, 4.6vw, 19px)", textShadow: "0 2px 4px rgba(0,20,80,0.7)" }}>
            {spinning ? "抽奖中" : "开始抽奖"}
          </span>
          <span className="mt-1 text-[9px] tracking-wider" style={{ color: "#DBEAFE" }}>
            {spinning ? "GOOD LUCK" : ready ? "可抽奖 1 次" : "请先校验"}
          </span>
        </button>
        <svg viewBox="0 0 40 46" className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: "38%", top: "-41%" }} aria-hidden="true">
          <defs>
            <linearGradient id="ptr" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B57A25" /><stop offset="50%" stopColor="#FFF1C4" /><stop offset="100%" stopColor="#C98A2B" />
            </linearGradient>
          </defs>
          <path d="M20 1 L37 45 Q20 39 3 45 Z" fill="url(#ptr)" stroke="#7A4A0E" strokeWidth="1.2" style={{ filter: "drop-shadow(0 0 6px rgba(255,220,140,0.8))" }} />
          <path d="M20 6 L20 40" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
};

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } };

export default function Home() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get("code") || "");
  const [checkState, setCheckState] = useState(null);
  const [validatedCode, setValidatedCode] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [winners, setWinners] = useState([]);
  const [pool, setPool] = useState({ total_pool: 1000000, used: 0 });
  const rotRef = useRef(0);

  useEffect(() => {
    getRecentWinners().then((r) => setWinners(r.data.winners)).catch(() => {});
    getPoolStats().then((r) => setPool(r.data)).catch(() => {});
  }, []);

  const doValidate = async () => {
    playClick();
    if (!code.trim()) return setCheckState("fail");
    setCheckState("loading");
    try {
      await validateCode(code);
      setCheckState("ok");
      setValidatedCode(code.trim().toUpperCase());
    } catch {
      setCheckState("fail");
      setValidatedCode(null);
    }
  };

  const doSpin = async () => {
    if (!validatedCode || spinning) return;
    setSpinning(true);
    playSpin();
    try {
      const res = await spin(validatedCode);
      const options = SEGMENTS.map((p, i) => (p === res.data.amount ? i : -1)).filter((i) => i >= 0);
      const idx = options.length ? options[Math.floor(Math.random() * options.length)] : 0;
      const jitter = (Math.random() - 0.5) * (SEG_DEG * 0.5);
      const desired = (360 - (idx * SEG_DEG + SEG_DEG / 2) + jitter + 360) % 360;
      const cur = rotRef.current;
      const delta = (desired - (cur % 360) + 360) % 360;
      const next = cur + 360 * 6 + delta;
      rotRef.current = next;
      setRotation(next);
      setTimeout(() => {
        setSpinning(false);
        setResult(res.data);
        playWin();
        setValidatedCode(null);
        setCheckState(null);
        setCode("");
        getPoolStats().then((r) => setPool(r.data)).catch(() => {});
      }, 4800);
    } catch (e) {
      setSpinning(false);
      toast.error(e.response?.data?.detail || "抽奖失败");
      setValidatedCode(null);
      setCheckState(null);
    }
  };

  const maskWallet = (w) => (w && w.length > 12 ? `${w.slice(0, 6)}...${w.slice(-4)}` : w);
  const pct = Math.min(100, Math.round((pool.used / pool.total_pool) * 100));
  const remainPct = Math.max(100 - pct, 4);

  return (
    <div className="relative min-h-screen pb-10">
      <nav className="relative z-10 flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2.5">
          <Logo size={30} />
          <div>
            <span className="font-display text-[18px] font-extrabold tracking-wide text-white leading-none">GSET RWA</span>
            <p className="text-[9px] tracking-[0.3em] mt-0.5" style={{ color: "#64748B" }}>LUCKY DRAW</p>
          </div>
        </div>
        <span className="pill-outline px-4 py-1.5 text-[11px] font-bold tracking-wider" style={{ color: "#60A5FA" }}>总奖池 100万 USDT</span>
      </nav>

      <motion.div className="relative z-10 px-4 pt-5 text-center" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
        <motion.h1 variants={fadeUp} className="gold-title font-black leading-tight" style={{ fontSize: "clamp(42px, 12.5vw, 54px)", letterSpacing: "0.08em" }}>
          幸运抽奖
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-1.5 text-[14px] font-semibold" style={{ color: "#CBD5E1", textShadow: "0 1px 8px rgba(59,130,246,0.5)" }}>
          GSET机构RWA <span className="mx-1.5" style={{ color: "#475569" }}>·</span> 总奖池 <span className="font-num gold-text text-[16px]">{pool.total_pool.toLocaleString()}</span> USDT
        </motion.p>
      </motion.div>

      <motion.div className="relative z-10 px-4 mt-5" initial="hidden" animate="show" variants={fadeUp}>
        <div className="glass px-4 pt-4 pb-3" style={{ borderRadius: 22 }}>
          <div className="relative flex items-center bg-white rounded-full p-1 pl-4" style={{ boxShadow: "0 4px 20px rgba(37,99,235,0.3), inset 0 2px 4px rgba(0,0,0,0.06)" }}>
            <Search size={19} className="shrink-0" style={{ color: "#64748B" }} />
            <input data-testid="code-input" value={code} onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doValidate()}
              placeholder="粘贴你的抽奖码"
              className="flex-1 min-w-0 bg-transparent px-2.5 py-2.5 text-[15px] outline-none"
              style={{ color: "#0F172A" }} />
            <button data-testid="validate-btn" onClick={doValidate} disabled={checkState === "loading"}
              className="btn-blue px-6 py-2.5 text-[15px] shrink-0">{checkState === "loading" ? "校验中" : "校验"}</button>
          </div>
          <div className="flex items-center justify-between mt-2.5 px-1 text-[12px]">
            {checkState === "ok" ? (
              <p data-testid="validate-success" className="flex items-center gap-1 font-medium" style={{ color: "#10B981" }}>
                <CheckCircle2 size={14} /> 校验成功：已解锁抽奖机会
              </p>
            ) : checkState === "fail" ? (
              <p data-testid="validate-fail" className="flex items-center gap-1 font-medium" style={{ color: "#F87171" }}>
                <XCircle size={14} /> 校验失败：抽奖码无效、已使用或已过期
              </p>
            ) : (
              <p className="flex items-center gap-1" style={{ color: "#94A3B8" }}><Info size={13} /> 请输入抽奖码</p>
            )}
            {checkState !== "fail" && <p style={{ color: "#64748B" }}>校验成功后解锁抽奖机会</p>}
          </div>
        </div>
      </motion.div>

      <motion.div className="relative mt-10" initial="hidden" animate="show" variants={fadeUp}>
        <Ribbon color="gold" className="-left-3 top-6" style={{ width: 64, height: 120 }} />
        <Ribbon color="blue" flip className="-right-3 top-40" style={{ width: 70, height: 130 }} />
        <Coin size={70} rotate={-18} className="-left-5 -top-24" delay={0.3} />
        <Coin size={58} rotate={22} className="-right-2 top-2" delay={1.1} />
        <Coin size={64} rotate={-30} className="-right-5 top-44" delay={0.7} />
        <Coin size={46} rotate={35} className="left-1 top-40" delay={1.6} />
        <Coin size={60} rotate={12} className="-left-3 bottom-4" delay={0.2} />
        <Sparkle size={18} className="left-8 -top-3" />
        <Sparkle size={14} className="right-16 -top-6" delay={0.8} color="#FFFFFF" />
        <Sparkle size={22} className="right-6 top-36" delay={1.3} />
        <Sparkle size={20} className="left-3 top-[62%]" delay={0.5} color="#FFFFFF" />
        <Sparkle size={16} className="right-8 bottom-16" delay={1.9} color="#93C5FD" />

        <div className="relative z-[2]">
          <Wheel rotation={rotation} spinning={spinning} ready={!!validatedCode} onSpin={doSpin} />
        </div>

        <div className="relative z-[1] mx-auto -mt-7" style={{ width: "min(82vw, 330px)" }}>
          <div className="mx-auto h-8" style={{ width: "44%", background: "linear-gradient(180deg,#1E3A8A,#172554)", clipPath: "polygon(12% 0, 88% 0, 100% 100%, 0 100%)", boxShadow: "inset 0 0 14px rgba(96,165,250,0.5)" }} />
          <div className="relative h-[54px] rounded-[50%] flex items-center justify-center"
            style={{ background: "radial-gradient(ellipse at 50% 40%, #1D4ED8 0%, #1E3A8A 55%, #172554 100%)", boxShadow: "0 0 0 2px rgba(96,165,250,0.8), 0 0 24px rgba(59,130,246,0.7), inset 0 -8px 16px rgba(0,0,0,0.35)" }}>
            <span data-testid="spin-count" className="text-[12px] font-semibold" style={{ color: "#DBEAFE" }}>本轮可抽奖次数：{validatedCode ? 1 : 0} 次</span>
          </div>
          <div className="mx-auto -mt-5 h-10 rounded-b-[50%]" style={{ width: "108%", marginLeft: "-4%", background: "linear-gradient(180deg,#1E3A8A,#0F172A)", boxShadow: "0 12px 32px rgba(29,78,216,0.55), inset 0 -2px 0 rgba(96,165,250,0.6)" }} />
        </div>
      </motion.div>

      <motion.div className="relative z-10 px-4 -mt-2" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10 px-8 py-1.5 text-[14px] font-black cream"
            style={{ background: "linear-gradient(180deg,#1E3A8A,#172554)", clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0 100%)", borderTop: "1.5px solid #F5C76B" }}>
            总USDT奖池
          </div>
          <TechFrame cut={16} innerClassName="px-5 pt-8 pb-5 text-center">
            <div className="gold-title font-num leading-none" style={{ fontSize: "clamp(40px, 11.5vw, 48px)" }}>
              {pool.total_pool.toLocaleString()} <span className="text-[20px]">USDT</span>
            </div>
            <div className="h-3 rounded-full mt-4 overflow-hidden" style={{ background: "rgba(6,14,44,0.9)", boxShadow: "inset 0 0 0 1px rgba(96,165,250,0.3)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(180deg,#FFF0C8,#F2C063 50%,#C98A2B)", boxShadow: "0 0 12px rgba(245,199,107,0.7)" }}
                initial={{ width: 0 }} whileInView={{ width: `${remainPct}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
            </div>
            <p className="text-[13px] mt-3 font-medium" style={{ color: "#CBD5E1" }}>所有奖品统一发放USDT</p>
          </TechFrame>
        </div>
      </motion.div>

      <motion.div className="relative z-10 px-4 mt-5" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <div className="glass-dark flex items-center overflow-hidden py-2.5 pl-3" style={{ borderRadius: 999 }}>
          <span className="flex items-center gap-1 shrink-0 text-[12px] font-bold pr-2 mr-1 cream" style={{ borderRight: "1px solid rgba(96,165,250,0.25)" }}>
            <Trophy size={14} style={{ color: "#F5C76B" }} /> 近期中奖
          </span>
          <div className="overflow-hidden flex-1">
            <div className="marquee-track">
              {[...winners, ...winners].map((w, i) => (
                <div key={i} data-testid={i < winners.length ? `winner-item-${i}` : undefined}
                  className="flex items-center gap-2 px-4 text-[12px] whitespace-nowrap" style={{ color: "#94A3B8" }}>
                  <span className="font-mono blue-text">{maskWallet(w.wallet)}</span>
                  <span className="font-num gold-text text-[13px]">{w.amount} USDT</span>
                  <span>{w.status === "paid" ? "已发放" : w.status === "submitted" ? "已提交" : "待领取"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 px-4 mt-7 flex justify-center text-[13px]" style={{ color: "#94A3B8" }}>
        <button data-testid="nav-rules" onClick={() => navigate("/rules")} className="flex items-center gap-0.5">活动规则 <ChevronRight size={13} /></button>
      </div>
      <p className="relative z-10 text-center text-[11px] mt-3" style={{ color: "#64748B" }}>中奖后填写 GSET RWA 收款ID，USDT 将发放至该账户</p>

      <WinModal result={result} onClose={() => setResult(null)} />
    </div>
  );
}
