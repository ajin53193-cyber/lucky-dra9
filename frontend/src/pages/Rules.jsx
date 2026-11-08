import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Coin, Sparkle, TechFrame } from "@/components/Decor";

const RULES = [
  "总奖池 1,000,000 USDT，所有奖品均以 USDT 发放",
  "需要输入有效抽奖码校验后，方可参与抽奖",
  "一个抽奖码仅限抽奖 1 次",
  "抽奖中奖不会自动到账，需填写收款账户提交领取申请",
  "客服核验后将 USDT 发放至你填写的收款账户",
  "邀请好友仅为项目分享，邀请不赠送抽奖码，邀请链接不能参与抽奖",
  "平台拥有本次活动最终解释权",
];

export default function Rules() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-10 relative">
      <PageHeader title="活动规则" />
      <Coin size={54} rotate={-20} className="-left-4 top-[96px]" />
      <Coin size={46} rotate={25} className="-right-3 top-[150px]" delay={0.8} />
      <Sparkle size={16} className="right-12 top-[90px]" />
      <div className="px-4 mt-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <TechFrame cut={20} innerClassName="p-5">
            <div className="text-center mb-4">
              <p className="gold-title font-num text-[34px] leading-none">1,000,000 USDT</p>
              <p className="text-[13px] mt-2 text-white/90">GSET 机构 RWA 幸运抽奖活动</p>
            </div>
            {RULES.map((r, i) => (
              <div key={i} data-testid={`rule-${i + 1}`} className="flex gap-3 py-3 border-t" style={{ borderColor: "rgba(120,170,255,0.2)" }}>
                <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-num text-[14px]"
                  style={i === 0 ? { background: "radial-gradient(circle at 40% 30%, #FFF0C8, #F2C063 55%, #C98A2B)", color: "#3A2306" } : { background: "radial-gradient(circle at 40% 30%, #2D5FCF, #163A9A)", color: "#FCE7B0", boxShadow: "0 0 0 1.5px #4D9BFF" }}>
                  {i + 1}
                </span>
                <p className="text-[14px] leading-relaxed text-white">{r}</p>
              </div>
            ))}
          </TechFrame>
        </motion.div>
        <motion.button data-testid="rules-agree-btn" className="btn-gold w-full py-3.5 mt-6 text-[17px] flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          onClick={() => navigate("/")}>
          <CheckCircle2 size={18} /> 我已阅读并了解
        </motion.button>
      </div>
    </div>
  );
}
