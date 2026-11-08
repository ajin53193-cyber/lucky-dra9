import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronsRight, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ASSETS, Sparkle, TechFrame } from "@/components/Decor";
import { toast } from "sonner";

const STEPS = [
  { n: 1, text: "中奖后填写收款账户" },
  { n: 2, text: "提交领取申请" },
  { n: 3, text: "客服核验" },
  { n: 4, text: "发放USDT奖励" },
];

const StepCircle = ({ n, first }) => (
  <div className="relative w-[54px] h-[54px] rounded-full flex items-center justify-center shrink-0"
    style={first ? {
      background: "radial-gradient(circle at 40% 30%, #FFF0C8 0%, #F2C063 50%, #C98A2B 100%)",
      boxShadow: "0 0 0 3px rgba(10,22,64,0.9), 0 0 0 4.5px #F8D78C, 0 0 16px rgba(245,199,107,0.7)",
    } : {
      background: "radial-gradient(circle at 40% 30%, #2D5FCF 0%, #163A9A 60%, #0E2770 100%)",
      boxShadow: `0 0 0 3px rgba(10,22,64,0.9), 0 0 0 4.5px ${n === 3 ? "#7CC8FF" : "#4D9BFF"}, 0 0 16px rgba(77,155,255,0.7)`,
    }}>
    <span className="font-num text-[30px] leading-none" style={{ color: first ? "#FFFFFF" : "#FCE7B0", textShadow: first ? "0 2px 3px rgba(120,70,10,0.7)" : "0 2px 4px rgba(0,0,0,0.5)" }}>{n}</span>
  </div>
);

export default function Redeem() {
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen pb-10 relative">
      <PageHeader title="客服兑换" />
      <Sparkle size={22} className="right-[28%] top-[86px]" />
      <Sparkle size={14} className="left-2 top-[300px]" color="#9CC8FF" delay={0.6} />
      <Sparkle size={12} className="right-1 top-[270px]" color="#9CC8FF" delay={1.2} />
      <div className="px-4 mt-6 space-y-6">
        {/* flow card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <TechFrame cut={22} innerClassName="px-3 pt-5 pb-5">
            <span className="absolute left-[30%] right-[30%] top-0 h-[3px] rounded-b" style={{ background: "linear-gradient(90deg,transparent,#5FB0FF,transparent)" }} />
            <p className="flex items-center gap-1 px-2 text-[22px] font-black gold-text">兑换流程 <ChevronsRight size={22} style={{ color: "#F5C76B" }} /></p>
            <div className="flex items-start justify-between mt-4">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex items-start">
                  <div data-testid={`step-${s.n}`} className="flex flex-col items-center w-[66px]">
                    <StepCircle n={s.n} first={i === 0} />
                    <p className="text-[12px] font-bold mt-2.5 text-center whitespace-nowrap" style={{ color: i === 3 ? "#FCE7B0" : "#FFFFFF" }}>{s.text}</p>
                  </div>
                  {i < STEPS.length - 1 && <ArrowRight size={18} className="mt-[18px] -mx-1.5 shrink-0" style={{ color: "#F5C76B" }} />}
                </div>
              ))}
            </div>
          </TechFrame>
        </motion.div>

        {/* code card */}
        <motion.div className="glass px-5 pt-5 pb-4" style={{ borderRadius: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-[20px] font-black text-white">收款账户</p>
          <input data-testid="redeem-code-input" value={code} onChange={(e) => setCode(e.target.value)}
            placeholder="请输入或粘贴收款地址"
            className="w-full mt-4 bg-white rounded-xl px-4 py-3.5 text-[17px] font-medium outline-none"
            style={{ color: "#152043", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)" }} />
          <div className="flex justify-end mt-4">
            <button data-testid="redeem-copy-btn" className="btn-gold px-8 py-2.5 text-[16px]"
              onClick={() => {
                if (!code.trim()) return toast.error("请先输入或粘贴收款地址");
                navigator.clipboard?.writeText(code.trim()).catch(() => {});
                toast.success("地址已复制");
              }}>复制地址</button>
          </div>
        </motion.div>

        {/* service card */}
        <motion.div className="glass relative px-5 pt-4 pb-5 overflow-hidden" style={{ borderRadius: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <img src={ASSETS.service} alt="" aria-hidden="true" draggable={false} className="absolute -right-2 top-1 w-[132px] h-auto pointer-events-none" />
          <p className="text-[20px] font-black gold-text">客服入口卡</p>
          <p className="text-[16px] mt-2 text-white">客服时间：<span className="font-num text-[20px] gold-text">09:00-22:00</span></p>
          <p className="text-[16px] mt-1 text-white">平均响应时间：<span className="font-bold text-[18px] blue-text">3分钟</span></p>
          <button data-testid="contact-online-btn" className="btn-gold relative w-full py-3.5 mt-6 text-[19px] tracking-wider"
            onClick={() => toast.info(code ? `地址 ${code} 已准备好，请等待客服接入` : "客服即将接入，请稍候")}>
            联系在线客服
          </button>
        </motion.div>

        <p className="flex items-center justify-center gap-1.5 text-[13px] text-white/95">
          <CheckCircle2 size={16} style={{ color: "#F5C76B" }} /> 中奖后填写收款账户，客服核验后直接发放 USDT
        </p>
      </div>
    </div>
  );
}
