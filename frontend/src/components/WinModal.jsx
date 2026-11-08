import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headset, X, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ASSETS, Coin, Sparkle, Ribbon } from "@/components/Decor";
import { claimPrize } from "@/api";

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

export const WinModal = ({ result, onClose, onContact }) => {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("TRC20");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const doRedeem = async () => {
    if (!address.trim()) return toast.error("请填写收款账户地址");
    setSubmitting(true);
    try {
      await claimPrize(result.code, address, network);
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
                  <p className="text-[14px] mt-3" style={{ color: "#DCE8FF" }}>填写收款账户，客服核验后直接发放 USDT</p>

                  {submitted ? (
                    <div data-testid="redeem-success" className="mt-4 rounded-2xl px-4 py-4 text-center" style={{ background: "rgba(20,80,50,0.45)", border: "1px solid rgba(94,224,160,0.5)" }}>
                      <CheckCircle2 size={26} className="mx-auto mb-1.5" style={{ color: "#5EE0A0" }} />
                      <p className="text-[15px] font-bold text-white">领取申请已提交</p>
                      <p className="text-[12px] mt-1" style={{ color: "#9DB4E8" }}>客服核验后将发放 USDT 至你的收款账户</p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl px-4 py-4 text-left" style={{ background: "rgba(10,28,90,0.55)", border: "1px solid rgba(140,190,255,0.4)" }}>
                      <p className="text-[13px] font-bold text-white mb-2 flex items-center gap-1.5"><Wallet size={14} style={{ color: "#F5C76B" }} /> 填写收款账户领取奖励</p>
                      <div className="flex gap-2 mb-2">
                        {["TRC20", "ERC20"].map((n) => (
                          <button key={n} data-testid={`network-${n}`} onClick={() => setNetwork(n)}
                            className="px-4 py-1.5 rounded-full text-[12px] font-bold"
                            style={network === n
                              ? { background: "linear-gradient(135deg,#F7D98C,#E8B24A)", color: "#231A08" }
                              : { background: "rgba(140,190,255,0.12)", color: "#9DB4E8", border: "1px solid rgba(140,190,255,0.3)" }}>
                            {n}
                          </button>
                        ))}
                      </div>
                      <input data-testid="address-input" value={address} onChange={(e) => setAddress(e.target.value)}
                        placeholder={`输入 ${network} 收款地址`}
                        className="w-full bg-transparent border rounded-xl px-3.5 py-2.5 text-[13px] font-mono outline-none"
                        style={{ borderColor: "rgba(140,190,255,0.35)", color: "#EDF1FA" }} />
                      <button data-testid="submit-redeem-btn" onClick={doRedeem} disabled={submitting}
                        className="btn-gold w-full py-3 mt-3 text-[16px]">
                        {submitting ? "提交中..." : "提交领取申请"}
                      </button>
                    </div>
                  )}

                  <button data-testid="contact-service-btn" onClick={onContact} className="mt-4 text-[14px] inline-flex items-center gap-1" style={{ color: "#DCE8FF" }}>
                    <Headset size={14} /> 有疑问？联系在线客服
                  </button>
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
