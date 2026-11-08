import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Users, Eye, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
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
    <div className="min-h-screen pb-10" style={{ background: "#0F1320" }}>
      <PageHeader title="好友邀请" />
      <div className="px-4 mt-4 space-y-4">
        <motion.div className="glass p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-display font-bold" style={{ color: "#EDF1FA" }}>分享你的邀请链接，邀请好友了解本项目</p>
          <div className="flex items-start gap-2 mt-3 p-3 rounded-xl" style={{ background: "rgba(245,199,107,0.08)", border: "1px solid rgba(245,199,107,0.2)" }}>
            <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: "#F5C76B" }} />
            <p className="text-xs leading-relaxed" style={{ color: "#F5C76B" }}>
              邀请好友仅为项目分享，不赠送抽奖码，好友无法通过邀请链接参与抽奖
            </p>
          </div>
        </motion.div>

        <motion.div className="glass grid grid-cols-2 divide-x py-4 text-center" style={{ borderColor: "rgba(90,130,255,0.12)" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div data-testid="invite-count">
            <Users size={18} className="mx-auto mb-1" style={{ color: "#6EA8FF" }} />
            <p className="text-xs" style={{ color: "#8A93B0" }}>我的邀请人数</p>
            <p className="font-num text-3xl font-black mt-1" style={{ color: "#F5C76B" }}>{info?.invited_count ?? "-"}</p>
          </div>
          <div data-testid="visit-count">
            <Eye size={18} className="mx-auto mb-1" style={{ color: "#6EA8FF" }} />
            <p className="text-xs" style={{ color: "#8A93B0" }}>链接访问次数</p>
            <p className="font-num text-3xl font-black mt-1" style={{ color: "#F5C76B" }}>{info?.visit_count ?? "-"}</p>
          </div>
        </motion.div>

        <motion.div className="glass p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p className="text-xs mb-2" style={{ color: "#8A93B0" }}>我的邀请链接</p>
          <div className="flex gap-2">
            <input data-testid="invite-link-input" readOnly value={info?.invite_url ?? ""}
              className="flex-1 bg-transparent border rounded-full px-4 py-2.5 text-xs font-mono outline-none"
              style={{ borderColor: "rgba(90,130,255,0.3)", color: "#6EA8FF" }} />
            <button data-testid="copy-invite-btn" className="btn-gold px-5 text-xs flex items-center gap-1"
              onClick={() => { navigator.clipboard?.writeText(info?.invite_url || ""); toast.success("邀请链接已复制"); }}>
              <Copy size={13} /> 复制
            </button>
          </div>
        </motion.div>

        <motion.div className="glass p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-sm font-bold mb-3" style={{ color: "#EDF1FA" }}>邀请排行榜</p>
          <div className="grid grid-cols-3 text-xs py-2" style={{ color: "#8A93B0" }}>
            <span>排名</span><span>用户</span><span className="text-right">邀请数量</span>
          </div>
          {leaders.map((l, i) => (
            <div key={l.user_id} data-testid={`leader-row-${i}`} className="grid grid-cols-3 text-sm py-2.5 border-t" style={{ borderColor: "rgba(90,130,255,0.1)" }}>
              <span className="font-num font-black" style={{ color: i < 3 ? "#F5C76B" : "#8A93B0" }}>{String(i + 1).padStart(2, "0")}</span>
              <span className="font-mono text-xs" style={{ color: "#6EA8FF" }}>{l.user_id.slice(0, 10)}...</span>
              <span className="text-right font-bold" style={{ color: "#EDF1FA" }}>{l.invited_count}</span>
            </div>
          ))}
          {leaders.length === 0 && <p className="text-xs text-center py-4" style={{ color: "#8A93B0" }}>暂无排行数据</p>}
        </motion.div>
      </div>
    </div>
  );
}
