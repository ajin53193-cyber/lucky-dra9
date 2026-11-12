import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, BadgeCheck, Package, DollarSign, TrendingUp, CheckCircle2 } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { adminGetStats } from "@/api";

const Card = ({ label, value, sub, icon: Icon, color = "#60A5FA", delay = 0 }) => (
  <motion.div className="glass p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <div className="flex items-center justify-between">
      <p className="text-[13px]" style={{ color: "#94A3B8" }}>{label}</p>
      <Icon size={18} style={{ color }} />
    </div>
    <p className="font-num text-[30px] font-black mt-2" style={{ color }}>{value}</p>
    {sub && <p className="text-[11px] mt-1" style={{ color: "#64748B" }}>{sub}</p>}
  </motion.div>
);

export default function Admin() {
  const [stats, setStats] = useState(null);
  useEffect(() => { adminGetStats().then((r) => setStats(r.data)).catch(() => {}); }, []);
  const pct = stats ? Math.min(100, Math.round(((stats.total_amount || 0) / stats.total_pool) * 100)) : 0;

  return (
    <AdminShell title="数据总览">
      <div className="grid grid-cols-2 gap-3">
        <Card label="抽奖码总数" value={stats?.total_codes ?? "-"} sub={`未使用 ${stats?.unused_codes ?? 0}`} icon={Ticket} color="#F5C76B" />
        <Card label="中奖记录" value={stats?.total_wins ?? "-"} sub={`待领取 ${stats?.total_wins - (stats?.submitted ?? 0) - (stats?.paid ?? 0) || 0}`} icon={BadgeCheck} color="#60A5FA" delay={0.05} />
        <Card label="已提交申请" value={stats?.submitted ?? "-"} sub="等待发放" icon={Package} color="#F59E0B" delay={0.1} />
        <Card label="已发放 USDT" value={(stats?.paid_amount ?? 0).toLocaleString()} sub={`共 ${stats?.paid ?? 0} 笔`} icon={DollarSign} color="#10B981" delay={0.15} />
      </div>

      <motion.div className="glass-gold p-5 mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex justify-between items-center">
          <p className="text-[14px] font-bold" style={{ color: "#F8FAFC" }}>奖池消耗</p>
          <p className="font-num text-[13px]" style={{ color: "#F5C76B" }}>{pct}%</p>
        </div>
        <div className="h-3 rounded-full mt-3 overflow-hidden" style={{ background: "rgba(6,14,44,0.9)", boxShadow: "inset 0 0 0 1px rgba(245,199,107,0.2)" }}>
          <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#FFF0C8,#EDB65A,#C98A2B)" }}
            initial={{ width: 0 }} animate={{ width: `${Math.max(pct, 2)}%` }} transition={{ duration: 1, ease: "easeOut" }} />
        </div>
        <div className="flex justify-between mt-2 text-[12px]" style={{ color: "#94A3B8" }}>
          <span>已用 {(stats?.total_amount ?? 0).toLocaleString()} USDT</span>
          <span>总池 {(stats?.total_pool ?? 0).toLocaleString()} USDT</span>
        </div>
      </motion.div>

      <motion.div className="glass p-5 mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <p className="text-[14px] font-bold mb-3" style={{ color: "#F8FAFC" }}>快捷操作</p>
        <div className="grid grid-cols-2 gap-3">
          <a href="/admin/codes" className="btn-blue py-3 text-center text-[14px] font-bold flex items-center justify-center gap-1.5"><Ticket size={15} /> 生成抽奖码</a>
          <a href="/admin/claims" className="btn-gold py-3 text-center text-[14px] font-bold flex items-center justify-center gap-1.5"><CheckCircle2 size={15} /> 审核领取</a>
        </div>
      </motion.div>
    </AdminShell>
  );
}
