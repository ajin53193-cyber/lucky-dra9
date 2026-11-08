import { motion, AnimatePresence } from "framer-motion";
import { Copy, Headset, X } from "lucide-react";
import { toast } from "sonner";

const Confetti = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 36 }).map((_, i) => (
      <span key={i} className="absolute" style={{
        left: `${(i * 37) % 100}%`, top: "-4%",
        width: 6 + (i % 3) * 3, height: 10 + (i % 4) * 4,
        background: ["#F5C76B", "#3B7BFF", "#6EA8FF", "#F9E2A8"][i % 4],
        borderRadius: 2, opacity: 0.9,
        animation: `confetti-fall ${2.2 + (i % 5) * 0.4}s linear ${(i % 8) * 0.15}s infinite`,
      }} />
    ))}
  </div>
);

export const WinModal = ({ result, onClose, onContact }) => (
  <AnimatePresence>
    {result && (
      <motion.div data-testid="win-modal" className="fixed inset-0 z-50 flex items-center justify-center px-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ background: "rgba(6,9,18,0.8)", backdropFilter: "blur(8px)" }}>
        <Confetti />
        <motion.div className="glass-gold relative w-full max-w-sm p-6 text-center overflow-hidden"
          initial={{ scale: 0.6, y: 60, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}>
          <button data-testid="win-modal-close" onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full" style={{ color: "#8A93B0" }}>
            <X size={18} />
          </button>
          <div className="text-5xl mb-2 float-y">🏆</div>
          <h2 className="font-display text-2xl font-black gold-text mb-1">恭喜中奖</h2>
          <p className="text-sm" style={{ color: "#8A93B0" }}>本次中奖</p>
          <div className="font-num text-5xl font-black my-2" style={{ color: "#F5C76B", textShadow: "0 0 30px rgba(245,199,107,0.4)" }}>
            {result.amount} <span className="text-2xl">USDT</span>
          </div>
          <div className="glass rounded-xl px-4 py-3 my-4">
            <p className="text-xs mb-1" style={{ color: "#8A93B0" }}>已生成专属领取券</p>
            <p data-testid="coupon-code-text" className="font-mono text-lg font-bold" style={{ color: "#6EA8FF" }}>{result.coupon_code}</p>
          </div>
          <p className="text-xs mb-4" style={{ color: "#8A93B0" }}>请复制券码，前往客服窗口提交兑换</p>
          <div className="flex gap-3">
            <button data-testid="copy-coupon-btn" className="btn-gold flex-1 py-3 flex items-center justify-center gap-1"
              onClick={() => { navigator.clipboard?.writeText(result.coupon_code); toast.success("券码已复制"); }}>
              <Copy size={16} /> 复制券码
            </button>
            <button data-testid="contact-service-btn" className="btn-blue flex-1 py-3 flex items-center justify-center gap-1" onClick={onContact}>
              <Headset size={16} /> 去联系客服
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
