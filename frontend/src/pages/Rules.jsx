import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const RULES = [
  "总奖池 1,000,000 USDT，所有奖品均以 USDT 发放",
  "需要输入有效抽奖码校验后，方可参与抽奖",
  "一个抽奖码仅限抽奖 1 次",
  "抽奖中奖不会自动到账，生成领取券",
  "用户凭领取券联系客服核验兑换奖励，领取券存在有效期，过期失效",
  "邀请好友仅为项目分享，邀请不赠送抽奖码，邀请链接不能参与抽奖",
  "平台拥有本次活动最终解释权",
];

export default function Rules() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-10" style={{ background: "#0F1320" }}>
      <PageHeader title="活动规则" />
      <div className="px-4 mt-4">
        <motion.div className="glass p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-5">
            <p className="font-display text-2xl font-black gold-text">1,000,000 USDT</p>
            <p className="text-xs mt-1" style={{ color: "#8A93B0" }}>GSET 机构 RWA 幸运抽奖活动</p>
          </div>
          {RULES.map((r, i) => (
            <div key={i} data-testid={`rule-${i + 1}`} className="flex gap-3 py-3 border-t first:border-0" style={{ borderColor: "rgba(90,130,255,0.1)" }}>
              <span className="font-num font-black text-sm shrink-0 w-6" style={{ color: "#F5C76B" }}>{String(i + 1).padStart(2, "0")}</span>
              <p className="text-sm leading-relaxed" style={{ color: "#EDF1FA" }}>{r}</p>
            </div>
          ))}
        </motion.div>
        <motion.button data-testid="rules-agree-btn" className="btn-gold w-full py-3.5 mt-5 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          onClick={() => navigate("/")}>
          <CheckCircle2 size={17} /> 我已阅读并了解
        </motion.button>
      </div>
    </div>
  );
}
