import { motion, AnimatePresence } from "framer-motion";
import { Copy, Headset, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ASSETS, Coin, Sparkle, Ribbon } from "@/components/Decor";

const Confetti = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 34 }).map((_, i) => (
      <span key={i} className="absolute" style={{
        left: `${(i * 37) % 100}%`, top: "-4%",
        width: 5 + (i % 3) * 3, height: 9 + (i % 4) * 4,
        background: ["#F5C76B", "#5FB0FF", "#FCE7B0", "#2F6BFF", "#E9AE4C"][i % 5],
        borderRadius: 2, opacity: 0.95,
        animation: `confetti-fall ${2.4 + (i % 5) * 0.45}s linear ${(i % 8) * 0.18}s infinite`,
      }} />
    ))}
  </div>
);

const fmtDate = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const WinModal = ({ result, onClose, onContact }) => {
  const expires = result ? fmtDate(new Date(result.expires_at || Date.now() + 7 * 24 * 3600 * 1000)) : "";
  return (
    <AnimatePresence>
      {result && (
        <motion.div data-testid="win-modal" data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: "radial-gradient(ellipse 90% 55% at 50% 45%, rgba(40,100,235,0.55), transparent 75%), linear-gradient(180deg, rgba(6,14,44,0.92), rgba(5,11,36,0.96))", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <Confetti />
          {/* surrounding ornaments */}
          <Ribbon color="gold" className="left-0 top-[30%]" style={{ width: 70, height: 140 }} />
          <Ribbon color="blue" flip className="right-0 top-[22%]" style={{ width: 70, height: 140 }} />
          <Ribbon color="gold" flip className="right-1 top-[62%]" style={{ width: 54, height: 110 }} />
          <Coin size={62} rotate={-20} className="-left-4 top-[72%]" />
          <Coin size={56} rotate={25} className="-right-3 top-[52%]" delay={0.8} />
          <Coin size={60} rotate={10} className="-right-2 top-[76%]" delay={1.4} />
          <Sparkle size={18} className="left-6 top-[16%]" />
          <Sparkle size={16} className="right-10 top-[14%]" color="#FFFFFF" delay={0.6} />
          <Sparkle size={14} className="left-5 top-[55%]" color="#FFFFFF" delay={1.2} />
          </div>
          <div className="relative min-h-full flex flex-col items-center justify-center px-5 pt-6 pb-2">

          <motion.h2 className="silver-gold-title font-black relative z-10 mb-5" style={{ fontSize: "clamp(32px, 10vw, 42px)", letterSpacing: "0.08em" }}
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            幸运抽奖
          </motion.h2>

          <motion.div className="relative z-10 w-full max-w-[360px]"
            initial={{ scale: 0.6, y: 60, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}>
            <div className="relative rounded-[28px] p-[1.5px]" style={{ background: "linear-gradient(180deg, #9CCBFF, rgba(95,176,255,0.35) 40%, rgba(95,176,255,0.7))", boxShadow: "0 0 34px rgba(60,140,255,0.65)" }}>
              <div className="relative rounded-[27px] overflow-hidden" style={{ background: "linear-gradient(180deg, #2B5BCB 0%, #1E47B0 40%, #183C9A 100%)" }}>
                {/* header tab */}
                <div className="relative mx-6 pt-5 pb-4 text-center rounded-b-[22px]"
                  style={{ background: "linear-gradient(180deg, rgba(70,130,255,0.55), rgba(30,70,180,0.25))", borderBottom: "2px solid rgba(140,200,255,0.8)", boxShadow: "0 6px 16px rgba(95,176,255,0.35)" }}>
                  <Sparkle size={12} className="left-10 top-7" color="#9CC8FF" />
                  <Sparkle size={12} className="right-10 top-7" color="#9CC8FF" delay={0.5} />
                  <h3 className="gold-title font-black text-[30px] tracking-[0.12em] leading-none">恭喜中奖</h3>
                </div>
                <button data-testid="win-modal-close" onClick={onClose} className="absolute top-4 right-4 p-1 text-white/90 z-10" aria-label="关闭">
                  <X size={22} />
                </button>

                {/* trophy */}
                <div className="relative flex justify-center -mb-8 mt-1">
                  <div className="absolute top-2 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,220,130,0.55), transparent 65%)" }} />
                  <motion.img src={ASSETS.trophy} alt="奖杯" className="relative w-40 h-auto z-[1]" draggable={false}
                    initial={{ scale: 0.5, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.15 }}
                    style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.45))" }} />
                </div>

                {/* curved lower panel */}
                <div className="relative px-5 pt-10 pb-5 text-center"
                  style={{ background: "linear-gradient(180deg, rgba(56,110,230,0.75), rgba(32,74,180,0.9))", borderRadius: "50% 50% 0 0 / 34px 34px 0 0", borderTop: "1.5px solid rgba(160,210,255,0.8)", boxShadow: "inset 0 10px 20px rgba(255,255,255,0.08)" }}>
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="gold-title font-num leading-none" style={{ fontSize: 54 }}>{result.amount}</span>
                    <span className="gold-title font-num text-[26px]">USDT</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <span className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, #FCE7B0)" }} />
                    <span className="text-[17px] font-black text-white">已生成专属领取券</span>
                    <span className="h-px w-10" style={{ background: "linear-gradient(90deg, #FCE7B0, transparent)" }} />
                  </div>

                  <div className="mt-4 rounded-2xl px-4 py-3 text-left" style={{ background: "rgba(10,28,90,0.55)", border: "1px solid rgba(140,190,255,0.4)" }}>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-white/90 shrink-0">领取券卡号</span>
                      <span data-testid="coupon-code-text" className="font-num text-[18px] tracking-wide text-white truncate">{result.coupon_code}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-[11px]" style={{ color: "#9DB4E8" }}>有效期 7 天 · 过期失效</span>
                      <span className="btn-gold px-3 py-0.5 text-[12px]">未兑换</span>
                    </div>
                  </div>

                  <button onClick={onContact} className="mt-3 text-[14px] inline-flex items-center gap-0.5" style={{ color: "#DCE8FF" }}>
                    请复制券码，<span className="blue-text" style={{ color: "#A8D4FF" }}>联系客服核验兑换</span> <ChevronRight size={14} />
                  </button>

                  <div className="flex gap-3 mt-4">
                    <button data-testid="copy-coupon-btn" className="btn-gold flex-1 py-3 text-[17px] flex items-center justify-center gap-1.5"
                      onClick={() => { navigator.clipboard?.writeText(result.coupon_code).catch(() => {}); toast.success("券码已复制"); }}>
                      <Copy size={16} /> 复制券码
                    </button>
                    <button data-testid="contact-service-btn" className="btn-gold flex-1 py-3 text-[17px] flex items-center justify-center gap-1.5" onClick={onContact}>
                      <Headset size={16} /> 去联系客服
                    </button>
                  </div>
                  <p className="text-[14px] mt-4 text-white">领取券有效期至 <span className="font-num text-[16px]">{expires}</span></p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* pedestal rings */}
          <div className="relative z-0 -mt-6 w-[118%] max-w-[480px] h-24 pointer-events-none shrink-0">
            <div className="absolute inset-x-6 top-0 h-16 rounded-[50%]" style={{ border: "2px solid rgba(95,176,255,0.7)", boxShadow: "0 0 24px rgba(60,140,255,0.7)", background: "radial-gradient(ellipse, rgba(40,90,210,0.5), transparent 70%)" }} />
            <div className="absolute inset-x-0 top-6 h-16 rounded-[50%]" style={{ borderBottom: "3px solid rgba(245,199,107,0.85)", filter: "drop-shadow(0 0 8px rgba(245,199,107,0.6))" }} />
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
