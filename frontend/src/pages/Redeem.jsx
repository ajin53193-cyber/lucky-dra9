import { useState } from "react";
import { motion } from "framer-motion";
import { Headset, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

const STEPS = [
  { n: 1, text: "在【我的领取券】复制未兑换券码" },
  { n: 2, text: "打开在线客服" },
  { n: 3, text: "提交券码等待客服核验" },
  { n: 4, text: "核验完成发放 USDT" },
];

export default function Redeem() {
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen pb-10" style={{ background: "#0F1320" }}>
      <PageHeader title="客服兑换" />
      <div className="px-4 mt-4 space-y-4">
        <motion.div className="glass p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-display font-bold mb-4" style={{ color: "#EDF1FA" }}>领取券兑换流程</p>
          {STEPS.map((s, i) => (
            <div key={s.n} data-testid={`step-${s.n}`} className="flex items-center gap-3 py-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-num font-black text-sm shrink-0"
                style={{ background: i === 0 ? "linear-gradient(135deg,#F9E2A8,#D9A13B)" : "rgba(59,123,255,0.15)", color: i === 0 ? "#231A08" : "#6EA8FF", border: "1px solid rgba(245,199,107,0.3)" }}>
                {s.n}
              </div>
              <p className="text-sm" style={{ color: "#EDF1FA" }}>{s.text}</p>
            </div>
          ))}
        </motion.div>

        <motion.div className="glass p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-xs mb-2" style={{ color: "#8A93B0" }}>领取券码</p>
          <input data-testid="redeem-code-input" value={code} onChange={(e) => setCode(e.target.value)}
            placeholder="请输入或粘贴券码"
            className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm font-mono outline-none"
            style={{ borderColor: "rgba(90,130,255,0.3)", color: "#EDF1FA" }} />
        </motion.div>

        <motion.div className="glass-gold p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex justify-between text-sm mb-4">
            <div><p style={{ color: "#8A93B0" }} className="text-xs">客服时间</p><p className="font-num font-bold" style={{ color: "#F5C76B" }}>09:00 - 22:00</p></div>
            <div><p style={{ color: "#8A93B0" }} className="text-xs">平均响应</p><p className="font-num font-bold" style={{ color: "#F5C76B" }}>3 分钟</p></div>
          </div>
          <button data-testid="contact-online-btn" className="btn-gold w-full py-3.5 flex items-center justify-center gap-2"
            onClick={() => toast.info(code ? `券码 ${code} 已准备好，请等待客服接入` : "请先输入券码，客服即将接入")}>
            <Headset size={17} /> 联系在线客服
          </button>
          <p className="flex items-center gap-1.5 text-xs mt-4" style={{ color: "#8A93B0" }}>
            <ShieldCheck size={14} style={{ color: "#5EE0A0" }} /> 请妥善保管券码，丢失无法补发
          </p>
        </motion.div>
      </div>
    </div>
  );
}
