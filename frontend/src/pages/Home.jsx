import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Wallet, ChevronRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { WinModal } from "@/components/WinModal";
import { validateCode, spin, getRecentWinners, getPoolStats } from "@/api";
import { toast } from "sonner";

const PRIZES = [5000, 1000, 200, 50, 10, 2];
const SEG_COLORS = ["#16244D", "#0E1730"];

const Wheel = ({ rotation, spinning }) => {
  const size = 300, cx = size / 2, r = size / 2 - 8;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute -inset-3 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(59,123,255,0.35), rgba(245,199,107,0.3), rgba(59,123,255,0.35))", filter: "blur(14px)" }} />
      <svg viewBox={`0 0 ${size} ${size}`} className="relative rounded-full glow-ring"
        style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4.5s cubic-bezier(0.15, 0.9, 0.1, 1)" : "none" }}>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F9E2A8" /><stop offset="100%" stopColor="#D9A13B" />
          </linearGradient>
        </defs>
        {PRIZES.map((p, i) => {
          const a0 = (i * 60 - 90) * (Math.PI / 180), a1 = ((i + 1) * 60 - 90) * (Math.PI / 180);
          const x0 = cx + r * Math.cos(a0), y0 = cx + r * Math.sin(a0);
          const x1 = cx + r * Math.cos(a1), y1 = cx + r * Math.sin(a1);
          const mid = (a0 + a1) / 2, tr = r * 0.62;
          return (
            <g key={p}>
              <path d={`M ${cx} ${cx} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`}
                fill={SEG_COLORS[i % 2]} stroke="rgba(245,199,107,0.4)" strokeWidth="1.5" />
              <text x={cx + tr * Math.cos(mid)} y={cx + tr * Math.sin(mid)}
                transform={`rotate(${(mid * 180) / Math.PI + 90} ${cx + tr * Math.cos(mid)} ${cx + tr * Math.sin(mid)})`}
                textAnchor="middle" fill="#F5C76B" fontSize="17" fontWeight="800" fontFamily="Bebas Neue, sans-serif">
                {p} USDT
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="url(#goldGrad)" strokeWidth="6" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <circle key={i} cx={cx + (r + 1) * Math.cos(a)} cy={cx + (r + 1) * Math.sin(a)} r="3" fill="#F5C76B" opacity={spinning ? 0.9 : 0.5} />;
        })}
      </svg>
      <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-10" style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "20px solid #F5C76B", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />
    </div>
  );
};

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

export default function Home() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [checkState, setCheckState] = useState(null); // ok | fail | loading
  const [validatedCode, setValidatedCode] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [winners, setWinners] = useState([]);
  const [pool, setPool] = useState({ total_pool: 1000000, used: 0 });
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  useEffect(() => {
    getRecentWinners().then((r) => setWinners(r.data.winners)).catch(() => {});
    getPoolStats().then((r) => setPool(r.data)).catch(() => {});
  }, []);

  const doValidate = async () => {
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
    try {
      const res = await spin(validatedCode);
      const idx = PRIZES.indexOf(res.data.amount);
      const target = 360 * 6 + (360 - (idx * 60 + 30)) - (rotation % 360);
      setRotation((r) => r + target);
      setTimeout(() => {
        setSpinning(false);
        setResult(res.data);
        setValidatedCode(null);
        setCheckState(null);
        setCode("");
      }, 4700);
    } catch (e) {
      setSpinning(false);
      toast.error(e.response?.data?.detail || "抽奖失败");
      setValidatedCode(null);
      setCheckState(null);
    }
  };

  const maskWallet = (w) => (w && w.length > 12 ? `${w.slice(0, 6)}...${w.slice(-4)}` : w);
  const pct = Math.min(100, Math.round((pool.used / pool.total_pool) * 100));

  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      {/* ambient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(59,123,255,0.22), transparent 70%)" }} />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(245,199,107,0.14), transparent 70%)" }} />
      </div>

      {/* nav */}
      <nav className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-display font-black text-lg tracking-wide" style={{ color: "#EDF1FA" }}>GSET <span className="gold-text">RWA</span></span>
        </div>
        <button data-testid="connect-wallet-btn" className="glass px-4 py-1.5 text-sm flex items-center gap-1.5" style={{ color: "#6EA8FF" }}>
          <Wallet size={15} /> 连接钱包
        </button>
      </nav>

      {/* hero */}
      <motion.div ref={heroRef} style={{ y: heroY }} className="px-4 pt-4 text-center" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
        <motion.div variants={fadeUp} className="overflow-hidden">
          <h1 className="font-display text-4xl font-black leading-tight">
            <span className="gold-text">幸运抽奖</span>
          </h1>
        </motion.div>
        <motion.p variants={fadeUp} className="mt-1 text-sm tracking-widest" style={{ color: "#8A93B0" }}>GSET 机构 RWA ・ 总奖池</motion.p>
        <motion.div variants={fadeUp} className="font-num text-5xl font-black mt-2" style={{ color: "#F5C76B", textShadow: "0 0 40px rgba(245,199,107,0.35)" }}>
          1,000,000 <span className="text-xl">USDT</span>
        </motion.div>
        <motion.p variants={fadeUp} className="text-xs mt-2" style={{ color: "#8A93B0" }}>输入有效抽奖码参与抽奖，奖品全部为 USDT，中奖获得领取券，联系客服兑换</motion.p>
      </motion.div>

      {/* code input */}
      <motion.div className="px-4 mt-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <div className="glass p-4">
          <p className="text-xs mb-2" style={{ color: "#8A93B0" }}>请输入抽奖码</p>
          <div className="flex gap-2">
            <input data-testid="code-input" value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="粘贴你的抽奖码"
              className="flex-1 bg-transparent border rounded-full px-4 py-2.5 text-sm outline-none"
              style={{ borderColor: "rgba(90,130,255,0.3)", color: "#EDF1FA" }} />
            <button data-testid="validate-btn" onClick={doValidate} className="btn-blue px-6 text-sm">校验</button>
          </div>
          {checkState === "ok" && (
            <p data-testid="validate-success" className="flex items-center gap-1 text-xs mt-2" style={{ color: "#5EE0A0" }}>
              <CheckCircle2 size={14} /> 校验成功：抽奖码有效，已解锁抽奖机会
            </p>
          )}
          {checkState === "fail" && (
            <p data-testid="validate-fail" className="flex items-center gap-1 text-xs mt-2" style={{ color: "#FF7B8A" }}>
              <XCircle size={14} /> 校验失败：抽奖码无效、已使用或已过期
            </p>
          )}
        </div>
      </motion.div>

      {/* wheel */}
      <motion.div className="flex flex-col items-center mt-8" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <Wheel rotation={rotation} spinning={spinning} />
        <p className="text-xs mt-5 mb-3" style={{ color: "#8A93B0" }}>本轮可抽奖次数：{validatedCode ? 1 : 0} 次</p>
        <button data-testid="spin-btn" onClick={doSpin} disabled={!validatedCode || spinning}
          className={`px-12 py-3.5 text-lg ${validatedCode && !spinning ? "btn-gold pulse-gold" : "btn-locked"}`}>
          {spinning ? "抽奖中..." : "开始抽奖"}
        </button>
      </motion.div>

      {/* pool card */}
      <motion.div className="px-4 mt-10" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <div className="glass-gold p-5">
          <p className="text-sm" style={{ color: "#8A93B0" }}>总 USDT 奖池</p>
          <div className="font-num text-4xl font-black mt-1" style={{ color: "#F5C76B" }}>
            {pool.total_pool.toLocaleString()} <span className="text-base">USDT</span>
          </div>
          <div className="h-2.5 rounded-full mt-4 overflow-hidden" style={{ background: "rgba(245,199,107,0.15)" }}>
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#F9E2A8,#D9A13B)" }}
              initial={{ width: 0 }} whileInView={{ width: `${Math.max(pct, 2)}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
          </div>
          <p className="text-xs mt-3" style={{ color: "#8A93B0" }}>中奖发放领取券，联系客服兑换 USDT</p>
        </div>
      </motion.div>

      {/* winners marquee */}
      <motion.div className="px-4 mt-8" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <p className="text-sm font-bold mb-3" style={{ color: "#EDF1FA" }}>近期中奖名单</p>
        <div className="glass overflow-hidden py-3">
          <div className="marquee-track">
            {[...winners, ...winners].map((w, i) => (
              <div key={i} data-testid={i < winners.length ? `winner-item-${i}` : undefined}
                className="flex items-center gap-3 px-5 text-xs whitespace-nowrap" style={{ color: "#8A93B0" }}>
                <span className="font-mono" style={{ color: "#6EA8FF" }}>{maskWallet(w.wallet)}</span>
                <span style={{ color: "#F5C76B" }} className="font-bold">{w.amount} USDT</span>
                <span>{w.status === "redeemed" ? "已兑换" : w.status === "expired" ? "已过期" : "待兑换"}</span>
                <span>{new Date(w.created_at).toLocaleDateString("zh-CN")}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* quick links */}
      <motion.div className="px-4 mt-8 grid grid-cols-3 gap-3" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        {[
          { label: "我的抽奖码", to: "/codes", id: "nav-codes" },
          { label: "我的领取券", to: "/coupons", id: "nav-coupons" },
          { label: "邀请好友", to: "/invite", id: "nav-invite" },
        ].map((l) => (
          <button key={l.to} data-testid={l.id} onClick={() => navigate(l.to)} className="glass py-4 text-sm font-bold flex flex-col items-center gap-1" style={{ color: "#EDF1FA" }}>
            {l.label}
            <span className="text-[10px] font-normal" style={{ color: "#8A93B0" }}>{l.to === "/invite" ? "邀请不赠送抽奖码" : "查看详情"}</span>
          </button>
        ))}
      </motion.div>

      <motion.div className="px-4 mt-6 flex justify-center gap-6 text-xs" style={{ color: "#8A93B0" }} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <button data-testid="nav-rules" onClick={() => navigate("/rules")} className="flex items-center gap-1">活动规则 <ChevronRight size={12} /></button>
        <button data-testid="nav-redeem" onClick={() => navigate("/redeem")} className="flex items-center gap-1">客服兑换 <ChevronRight size={12} /></button>
      </motion.div>

      <WinModal result={result} onClose={() => setResult(null)} onContact={() => { setResult(null); navigate("/redeem"); }} />
    </div>
  );
}
