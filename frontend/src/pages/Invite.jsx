import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Users, Eye, AlertCircle, Crown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Coin, Sparkle, TechFrame } from "@/components/Decor";
import { getInviteInfo, getLeaderboard } from "@/api";
import { toast } from "sonner";

export default function Invite() {
  const [info, setInfo] = useState(null);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    getInviteInfo().then((r) => setInfo(r.data)).catch(() => {});
    getLeaderboard().then((r) => setLeaders(r.data.leaders)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pb-10 relative">
      <PageHeader title="好友邀请" />
      <Coin size={52} rotate={-20} className="-right-3 top-[92px]" />
      <Sparkle size={16} className="left-4 top-[96px]" />
      <div className="px-4 mt-4 space-y-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <TechFrame cut={18} innerClassName="p-5">
            <p className="text-[20px] font-black gold-text pr-10">邀请好友 · 共享 RWA 机遇</p>
            <p className="text-[14px] mt-1.5 text-white/90">分享你的邀请链接，邀请好友了解本项目</p>
            <div className="flex items-start gap-2 mt-4 p-3 rounded-xl" style={{ background: "rgba(245,199,107,0.1)", border: "1px solid rgba(245,199,107,0.45)" }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: "#F5C76B" }} />
              <p className="text-[13px] leading-relaxed cream">邀请好友仅为项目分享，不赠送抽奖码，好友无法通过邀请链接参与抽奖</p>
            </div>
          </TechFrame>
        </motion.div>

        <motion.div className="card-blue grid grid-cols-2 py-4 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div data-testid="invite-count">
            <Users size={18} className="mx-auto mb-1 text-white/90" />
            <p className="text-[13px] text-white/90">我的邀请人数</p>
            <p className="font-num text-[34px] leading-tight text-white">{info?.invited_count ?? "-"}</p>
          </div>
          <div data-testid="visit-count" className="relative">
            <span className="absolute left-0 top-2 bottom-2 w-px" style={{ background: "rgba(200,225,255,0.4)" }} />
            <Eye size={18} className="mx-auto mb-1 text-white/90" />
            <p className="text-[13px] text-white/90">链接访问次数</p>
            <p className="font-num text-[34px] leading-tight text-white">{info?.visit_count ?? "-"}</p>
          </div>
        </motion.div>

        <motion.div className="glass p-4" style={{ borderRadius: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p className="text-[16px] font-black text-white mb-3">我的邀请链接</p>
          <div className="flex items-center bg-white rounded-full p-1 pl-4">
            <input data-testid="invite-link-input" readOnly value={info?.invite_url ?? ""}
              className="flex-1 min-w-0 bg-transparent text-[13px] font-mono outline-none" style={{ color: "#152043" }} />
            <button data-testid="copy-invite-btn" className="btn-gold px-5 py-2 text-[14px] flex items-center gap-1 shrink-0"
              onClick={() => { navigator.clipboard?.writeText(info?.invite_url || "").catch(() => {}); toast.success("邀请链接已复制"); }}>
              <Copy size={14} /> 复制
            </button>
          </div>
        </motion.div>

        <motion.div className="glass-dark p-4" style={{ borderRadius: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="flex items-center gap-1.5 text-[17px] font-black gold-text mb-2"><Crown size={18} style={{ color: "#F5C76B" }} /> 邀请排行榜</p>
          <div className="grid grid-cols-3 text-[12px] py-2" style={{ color: "#9DB4E8" }}>
            <span>排名</span><span>用户</span><span className="text-right">邀请数量</span>
          </div>
          {leaders.map((l, i) => (
            <div key={l.user_id} data-testid={`leader-row-${i}`} className="grid grid-cols-3 items-center text-[14px] py-2.5 border-t" style={{ borderColor: "rgba(120,170,255,0.18)" }}>
              <span>
                <span className="inline-flex w-7 h-7 rounded-full items-center justify-center font-num text-[14px]"
                  style={i < 3 ? { background: "radial-gradient(circle at 40% 30%, #FFF0C8, #F2C063 55%, #C98A2B)", color: "#3A2306" } : { background: "rgba(77,155,255,0.2)", color: "#C9D6F5" }}>
                  {i + 1}
                </span>
              </span>
              <span className="font-mono text-[12px] blue-text">{l.user_id.slice(0, 10)}...</span>
              <span className="text-right font-num text-[16px] text-white">{l.invited_count}</span>
            </div>
          ))}
          {leaders.length === 0 && <p className="text-[13px] text-center py-4" style={{ color: "#9DB4E8" }}>暂无排行数据</p>}
        </motion.div>
      </div>
    </div>
  );
}
