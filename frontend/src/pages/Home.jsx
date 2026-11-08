import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Search, ChevronRight, Diamond, Trophy, Info } from "lucide-react";
import { Logo } from "@/components/Logo";
import { WinModal } from "@/components/WinModal";
import { Coin, Sparkle, Ribbon, TechFrame } from "@/components/Decor";
import { validateCode, spin, getRecentWinners, getPoolStats } from "@/api";
import { playClick, playSpin, playWin } from "@/sound";
import { toast } from "sonner";

const PRIZES = [8888, 1888, 588, 58, 18, 8];
// 12 segments on the wheel, each prize appears twice (like the reference wheel)
const SEGMENTS = Array.from({ length: 12 }, (_, i) => PRIZES[i % PRIZES.length]);
const SEG_DEG = 360 / SEGMENTS.length;

const Wheel = ({ rotation, spinning, ready, onSpin }) => {
  const S = 400, c = S / 2, r = 172;
  const polar = (rad, deg) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [c + rad * Math.cos(a), c + rad * Math.sin(a)];
  };
  return (
    <div className="relative mx-auto" style={{ width: "min(86vw, 346px)", aspectRatio: "1 / 1" }}>
      {/* blue halo */}
      <div className="absolute -inset-4 rounded-full" style={{ background: "radial-gradient(circle, rgba(60,140,255,0.45) 55%, rgba(40,110,255,0) 72%)", filter: "blur(10px)" }} />
      <div className="absolute inset-0 rounded-full wheel-outer-glow" />

      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="wGoldRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF1C4" /><stop offset="30%" stopColor="#F2C063" />
            <stop offset="55%" stopColor="#9C6418" /><stop offset="80%" stopColor="#F5CD78" /><stop offset="100%" stopColor="#B57A25" />
          </linearGradient>
          <linearGradient id="wBlueRing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7CC0FF" /><stop offset="50%" stopColor="#2F6BFF" /><stop offset="100%" stopColor="#5FB0FF" />
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={197} fill="#071033" stroke="url(#wBlueRing)" strokeWidth="5" />
        <circle cx={c} cy={c} r={186} fill="none" stroke="rgba(95,176,255,0.35)" strokeWidth="1" />
      </svg>

      {/* rotating disc */}
      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 w-full h-full"
        style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4.6s cubic-bezier(0.12, 0.85, 0.08, 1)" : "none" }}>
        <defs>
          <radialGradient id="segBlue" cx="50%" cy="50%" r="50%">
            <stop offset="25%" stopColor="#2F6FE6" /><stop offset="100%" stopColor="#173FA6" />
          </radialGradient>
          <radialGradient id="segDark" cx="50%" cy="50%" r="50%">
            <stop offset="25%" stopColor="#141C3C" /><stop offset="100%" stopColor="#080D24" />
          </radialGradient>
          <linearGradient id="wGoldTxt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF4D0" /><stop offset="55%" stopColor="#F7D082" /><stop offset="100%" stopColor="#E0A443" />
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
                fill={blue ? "url(#segBlue)" : "url(#segDark)"} stroke="rgba(245,199,107,0.55)" strokeWidth="1.2" />
              <text x={ax} y={ay} transform={`rotate(${mid} ${ax} ${ay})`} textAnchor="middle" dominantBaseline="middle"
                fill="url(#wGoldTxt)" fontSize={p >= 1000 ? 27 : 30} fontWeight="800" fontFamily="Barlow, sans-serif"
                style={{ paintOrder: "stroke", stroke: "rgba(40,20,0,0.35)", strokeWidth: 1 }}>{p}</text>
              <text x={ux} y={uy} transform={`rotate(${mid} ${ux} ${uy})`} textAnchor="middle" dominantBaseline="middle"
                fill={blue ? "#FCE7B0" : "#D9E4FF"} fontSize="15" fontWeight="800" fontFamily="Barlow, sans-serif" letterSpacing="1">USDT</text>
            </g>
          );
        })}
        {/* gold rim with bulbs */}
        <circle cx={c} cy={c} r={r + 6} fill="none" stroke="url(#wGoldRim2)" strokeWidth="12" />
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(90,50,5,0.6)" strokeWidth="1.5" />
        {Array.from({ length: 24 }).map((_, i) => {
          const [bx, by] = polar(r + 6, i * 15 + 7.5);
          return <circle key={i} cx={bx} cy={by} r="2.6" fill={i % 2 ? "#FFF6D8" : "#FFD27A"}
            opacity={spinning ? (i % 2 ? 1 : 0.55) : 0.85} style={{ filter: "drop-shadow(0 0 3px #FFE7A8)" }} />;
        })}
      </svg>

      {/* static overlay: knobs + gloss */}
      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <defs>
          <radialGradient id="knob" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF6D8" /><stop offset="45%" stopColor="#F2C063" /><stop offset="100%" stopColor="#8A5512" />
          </radialGradient>
          <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.16)" /><stop offset="55%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={r - 2} fill="url(#gloss)" />
        {[0, 90, 180, 270].map((d) => {
          const [kx, ky] = polar(r + 6, d);
          return <circle key={d} cx={kx} cy={ky} r="10" fill="url(#knob)" stroke="#6B3F0A" strokeWidth="1" />;
        })}
      </svg>

      {/* center hub = spin button with pointer on top */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center" style={{ width: "31%" }}>
        {ready && !spinning && <span className="absolute inset-0 rounded-full pulse-ring" style={{ border: "3px solid rgba(248,215,140,0.8)" }} />}
        <button data-testid="spin-btn" onClick={onSpin} disabled={!ready || spinning}
          className={`hub-btn relative w-full aspect-square rounded-full flex flex-col items-center justify-center text-white ${!ready && !spinning ? "locked cursor-not-allowed" : ""}`}>
          <span className="font-black leading-none" style={{ fontSize: "clamp(15px, 4.6vw, 19px)", textShadow: "0 2px 4px rgba(0,20,80,0.7)" }}>
            {spinning ? "抽奖中" : "开始抽奖"}
          </span>
          <span className="mt-1 text-[9px] tracking-wider" style={{ color: "#CFE3FF" }}>
            {spinning ? "GOOD LUCK" : ready ? "可抽奖 1 次" : "请先校验"}
          </span>
        </button>
        <svg viewBox="0 0 40 46" className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: "38%", top: "-41%" }} aria-hidden="true">
          <defs>
            <linearGradient id="ptr" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B57A25" /><stop offset="50%" stopColor="#FFF1C4" /><stop offset="100%" stopColor="#C98A2B" />
            </linearGradient>
          </defs>
          <path d="M20 1 L37 45 Q20 39 3 45 Z" fill="url(#ptr)" stroke="#7A4A0E" strokeWidth="1.2" style={{ filter: "drop-shadow(0 0 5px rgba(255,220,140,0.8))" }} />
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
  const [checkState, setCheckState] = useState(null); // ok | fail | loading
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
      {/* nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="font-num text-[19px] tracking-wide text-white">GSET RWA</span>
        </div>
        <button data-testid="connect-wallet-btn" className="pill-outline px-4 py-1.5 text-[14px] font-medium flex items-center gap-1.5 text-white">
          <Diamond size={14} /> 连接钱包
        </button>
      </nav>

      {/* hero */}
      <motion.div className="relative z-10 px-4 pt-3 text-center" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
        <motion.h1 variants={fadeUp} className="gold-title font-black leading-tight" style={{ fontSize: "clamp(40px, 12vw, 52px)", letterSpacing: "0.06em" }}>
          幸运抽奖
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-1 text-[15px] font-bold text-white" style={{ textShadow: "0 1px 8px rgba(60,130,255,0.6)" }}>
          GSET机构RWA <span className="mx-1 opacity-70">|</span> 总奖池 <span className="font-num">{pool.total_pool.toLocaleString()}</span> USDT
        </motion.p>
      </motion.div>

      {/* code input */}
      <motion.div className="relative z-10 px-4 mt-4" initial="hidden" animate="show" variants={fadeUp}>
        <div className="glass px-4 pt-4 pb-3" style={{ borderRadius: 22 }}>
          <div className="relative flex items-center bg-white rounded-full p-1 pl-4" style={{ boxShadow: "0 4px 16px rgba(0,20,80,0.35), inset 0 2px 4px rgba(0,0,0,0.06)" }}>
            <Search size={20} className="shrink-0" style={{ color: "#6B7795" }} />
            <input data-testid="code-input" value={code} onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doValidate()}
              placeholder="粘贴你的抽奖码"
              className="flex-1 min-w-0 bg-transparent px-2.5 py-2 text-[15px] outline-none"
              style={{ color: "#152043" }} />
            <button data-testid="validate-btn" onClick={doValidate} disabled={checkState === "loading"}
              className="btn-blue px-7 py-2.5 text-[16px] shrink-0">{checkState === "loading" ? "校验中" : "校验"}</button>
          </div>
          <div className="flex items-center justify-between mt-2.5 px-1 text-[12px]">
            {checkState === "ok" ? (
              <p data-testid="validate-success" className="flex items-center gap-1 font-medium" style={{ color: "#5EE0A0" }}>
                <CheckCircle2 size={14} /> 校验成功：已解锁抽奖机会
              </p>
            ) : checkState === "fail" ? (
              <p data-testid="validate-fail" className="flex items-center gap-1 font-medium" style={{ color: "#FF8A98" }}>
                <XCircle size={14} /> 校验失败：抽奖码无效、已使用或已过期
              </p>
            ) : (
              <p className="flex items-center gap-1" style={{ color: "#C9D6F5" }}><Info size={13} /> 请输入抽奖码</p>
            )}
            {checkState !== "fail" && <p style={{ color: "#C9D6F5" }}>校验成功后解锁抽奖机会</p>}
          </div>
        </div>
      </motion.div>

      {/* wheel stage with ornaments */}
      <motion.div className="relative mt-9" initial="hidden" animate="show" variants={fadeUp}>
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
        <Sparkle size={16} className="right-8 bottom-16" delay={1.9} color="#9CC8FF" />

        <div className="relative z-[2]">
          <Wheel rotation={rotation} spinning={spinning} ready={!!validatedCode} onSpin={doSpin} />
        </div>

        {/* pedestal */}
        <div className="relative z-[1] mx-auto -mt-6" style={{ width: "min(80vw, 320px)" }}>
          <div className="mx-auto h-8" style={{ width: "44%", background: "linear-gradient(180deg,#1B3C98,#0E2366)", clipPath: "polygon(12% 0, 88% 0, 100% 100%, 0 100%)", boxShadow: "inset 0 0 12px rgba(95,176,255,0.6)" }} />
          <div className="relative h-[54px] rounded-[50%] flex items-center justify-center"
            style={{ background: "radial-gradient(ellipse at 50% 40%, #2552C2 0%, #13307F 55%, #0A1A4F 100%)", boxShadow: "0 0 0 2px rgba(95,176,255,0.85), 0 0 22px rgba(60,140,255,0.8), inset 0 -8px 16px rgba(0,0,0,0.35)" }}>
            <span data-testid="spin-count" className="text-[12px] font-medium text-white/90">本轮可抽奖次数：{validatedCode ? 1 : 0} 次</span>
          </div>
          <div className="mx-auto -mt-5 h-10 rounded-b-[50%]" style={{ width: "108%", marginLeft: "-4%", background: "linear-gradient(180deg,#112A72,#081646)", boxShadow: "0 10px 30px rgba(20,70,200,0.6), inset 0 -2px 0 rgba(95,176,255,0.7)" }} />
        </div>
      </motion.div>

      {/* pool card */}
      <motion.div className="relative z-10 px-5 -mt-3" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10 px-8 py-1.5 text-[15px] font-black cream"
            style={{ background: "linear-gradient(180deg,#24489F,#132D74)", clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0 100%)", borderTop: "1.5px solid #F5C76B" }}>
            总USDT奖池
          </div>
          <TechFrame cut={16} innerClassName="px-5 pt-8 pb-4 text-center">
            <div className="gold-title font-num leading-none" style={{ fontSize: "clamp(38px, 11vw, 46px)" }}>
              {pool.total_pool.toLocaleString()} <span className="text-[20px]">USDT</span>
            </div>
            <div className="h-3 rounded-full mt-4 overflow-hidden" style={{ background: "rgba(6,14,44,0.85)", boxShadow: "inset 0 0 0 1px rgba(95,176,255,0.35)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(180deg,#FFF0C8,#F2C063 50%,#C98A2B)", boxShadow: "0 0 10px rgba(245,199,107,0.7)" }}
                initial={{ width: 0 }} whileInView={{ width: `${remainPct}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
            </div>
            <p className="text-[14px] mt-3 font-medium text-white">所有奖品统一发放USDT</p>
          </TechFrame>
        </div>
      </motion.div>

      {/* winners ticker */}
      <motion.div className="relative z-10 px-5 mt-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <div className="glass-dark flex items-center overflow-hidden py-2.5 pl-3" style={{ borderRadius: 999 }}>
          <span className="flex items-center gap-1 shrink-0 text-[12px] font-bold pr-2 mr-1 cream" style={{ borderRight: "1px solid rgba(160,190,255,0.3)" }}>
            <Trophy size={14} style={{ color: "#F5C76B" }} /> 近期中奖
          </span>
          <div className="overflow-hidden flex-1">
            <div className="marquee-track">
              {[...winners, ...winners].map((w, i) => (
                <div key={i} data-testid={i < winners.length ? `winner-item-${i}` : undefined}
                  className="flex items-center gap-2 px-4 text-[12px] whitespace-nowrap" style={{ color: "#C9D6F5" }}>
                  <span className="font-mono blue-text">{maskWallet(w.wallet)}</span>
                  <span className="font-num gold-text text-[13px]">{w.amount} USDT</span>
                  <span>{w.status === "submitted" ? "已提交" : "待领取"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* bottom action bar */}
      <motion.div className="relative z-10 px-4 mt-5" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <div className="rounded-full p-[1.5px]" style={{ background: "linear-gradient(90deg,#F8D78C,rgba(248,215,140,0.35) 50%,#5FB0FF)", boxShadow: "0 0 18px rgba(60,140,255,0.35)" }}>
          <div className="flex items-center rounded-full p-1.5" style={{ background: "linear-gradient(180deg,#132A6E,#0A1A4C)" }}>
            <button data-testid="nav-codes" onClick={() => navigate("/codes")} className="flex-1 py-2.5 text-[15px] font-black gold-text">我的抽奖码</button>
            <span className="w-px h-8" style={{ background: "rgba(160,190,255,0.35)" }} />
            <button data-testid="nav-invite" onClick={() => navigate("/invite")} className="btn-blue px-10 py-3 text-[18px] tracking-widest">邀请</button>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 px-4 mt-5 flex justify-center gap-8 text-[13px]" style={{ color: "#C9D6F5" }}>
        <button data-testid="nav-rules" onClick={() => navigate("/rules")} className="flex items-center gap-0.5">活动规则 <ChevronRight size={13} /></button>
        <button data-testid="nav-redeem" onClick={() => navigate("/redeem")} className="flex items-center gap-0.5">客服兑换 <ChevronRight size={13} /></button>
      </div>
      <p className="relative z-10 text-center text-[12px] mt-3" style={{ color: "#AFC0E8" }}>中奖后填写 GSET RWA 账户 ID，客服核验后发放 USDT</p>

      <WinModal result={result} onClose={() => setResult(null)} onContact={() => { setResult(null); navigate("/redeem"); }} />
    </div>
  );
}
