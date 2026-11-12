import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ASSETS, Coin, Sparkle, Ribbon } from "@/components/Decor";
import { claimPrize } from "@/api";

const Confetti = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 34 }).map((_, i) => (
      <span key={i} className="absolute" style={{
        left: `${(i * 37) % 100}%`, top: "-4%",
        width: 5 + (i % 3) * 3, height: 9 + (i % 4) * 4,
        background: ["#F5C76B", "#60A5FA", "#FFE899", "#3B82F6", "#E9AE4C"][i % 5],
        borderRadius: 2, opacity: 0.95,
        animation: `confetti-fall ${2.4 + (i % 5) * 0.45}s linear ${(i % 8) * 0.18}s infinite`,
      }} />
    ))}
  </div>
);

export const WinModal = ({ result, onClose }) => {
  const [accountId, setAccountId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const doRedeem = async () => {
    if (!accountId.trim()) return toast.error("请填写 GSET RWA 收款ID");
    setSubmitting(true);
    try {
      await claimPrize(result.code, accountId);
      setSubmitted(true);
      toast.success("领取申请已提交");
    } catch (e) {
      toast.error(e.response?.data?.detail || "提交失败");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <AnimatePresence>
      {result && (
        <motion.div data-testid="win-modal" data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: "radial-gradient(ellipse 90% 55% at 50% 45%, rgba(37,99,235,0.5), transparent 75%), linear-gradient(180deg, rgba(10,14,28,0.92), rgba(7,10,22,0.96))", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <Confetti />
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
            <div className="relative rounded-[28px] p-[1.5px]" style={{ background: "linear-gradient(180deg, #93C5FD, rgba(96,165,250,0.3) 40%, rgba(96,165,250,0.6))", boxShadow: "0 0 40px rgba(59,130,246,0.6)" }}>
              <div className="relative rounded-[27px] overflow-hidden" style={{ background: "linear-gradient(180deg, #1E3A8A 0%, #1E40AF 40%, #172554 100%)" }}>
                <div className="relative mx-6 pt-5 pb-4 text-center rounded-b-[22px]"
                  style={{ background: "linear-gradient(180deg, rgba(96,165,250,0.4), rgba(30,64,175,0.2))", borderBottom: "2px solid rgba(147,197,253,0.7)", boxShadow: "0 6px 20px rgba(96,165,250,0.3)" }}>
                  <Sparkle size={12} className="left-10 top-7" color="#93C5FD" />
                  <Sparkle size={12} className="right-10 top-7" color="#93C5FD" delay={0.5} />
                  <h3 className="gold-title font-black text-[30px] tracking-[0.12em] leading-none">恭喜中奖</h3>
                </div>
                <button data-testid="win-modal-close" onClick={onClose} className="absolute top-4 right-4 p-1 text-white/90 z-10" aria-label="关闭">
                  <X size={22} />
                </button>

                <div className="relative flex justify-center -mb-8 mt-1">
                  <div className="absolute top-2 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,220,130,0.5), transparent 65%)" }} />
                  <motion.img src={ASSETS.trophy} alt="奖杯" className="relative w-40 h-auto z-[1]" draggable={false}
                    initial={{ scale: 0.5, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.15 }}
                    style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))" }} />
                </div>

                <div className="relative px-5 pt-10 pb-5 text-center"
                  style={{ background: "linear-gradient(180deg, rgba(59,130,246,0.6), rgba(30,64,175,0.85))", borderRadius: "50% 50% 0 0 / 34px 34px 0 0", borderTop: "1.5px solid rgba(147,197,253,0.7)", boxShadow: "inset 0 10px 20px rgba(255,255,255,0.08)" }}>
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="gold-title font-num leading-none" style={{ fontSize: 54 }}>{result.amount}</span>
                    <span className="gold-title font-num text-[26px]">USDT</span>
                  </div>
                  <p className="text-[14px] mt-3" style={{ color: "#DBEAFE" }}>填写 GSET RWA 收款ID，奖励将发放至该账户</p>

                  {submitted ? (
                    <div data-testid="redeem-success" className="mt-4 rounded-2xl px-4 py-4 text-center" style={{ background: "rgba(16,80,50,0.5)", border: "1px solid rgba(16,185,129,0.5)" }}>
                      <CheckCircle2 size={26} className="mx-auto mb-1.5" style={{ color: "#10B981" }} />
                      <p className="text-[15px] font-bold text-white">领取申请已提交</p>
                      <p className="text-[12px] mt-1" style={{ color: "#94A3B8" }}>USDT 将发放至你的 GSET RWA 账户</p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl px-4 py-4 text-left" style={{ background: "rgba(10,20,60,0.55)", border: "1px solid rgba(147,197,253,0.35)" }}>
                      <p className="text-[13px] font-bold text-white mb-2 flex items-center gap-1.5"><Wallet size={14} style={{ color: "#F5C76B" }} /> 填写 GSET RWA 收款ID领取奖励</p>
                      <input data-testid="account-id-input" value={accountId} onChange={(e) => setAccountId(e.target.value)}
                        placeholder="输入你的 GSET RWA 收款ID"
                        className="w-full bg-transparent border rounded-xl px-3.5 py-2.5 text-[14px] font-mono outline-none"
                        style={{ borderColor: "rgba(147,197,253,0.35)", color: "#F8FAFC" }} />
                      <button data-testid="submit-redeem-btn" onClick={doRedeem} disabled={submitting}
                        className="btn-gold w-full py-3 mt-3 text-[16px]">
                        {submitting ? "提交中..." : "提交领取申请"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="relative z-0 -mt-6 w-[118%] max-w-[480px] h-24 pointer-events-none shrink-0">
            <div className="absolute inset-x-6 top-0 h-16 rounded-[50%]" style={{ border: "2px solid rgba(96,165,250,0.6)", boxShadow: "0 0 26px rgba(59,130,246,0.6)", background: "radial-gradient(ellipse, rgba(37,99,235,0.45), transparent 70%)" }} />
            <div className="absolute inset-x-0 top-6 h-16 rounded-[50%]" style={{ borderBottom: "3px solid rgba(245,199,107,0.8)", filter: "drop-shadow(0 0 10px rgba(245,199,107,0.5))" }} />
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
