import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, Copy, Package, BadgeCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { adminGetClaims, adminPayClaim } from "@/api";
import { toast } from "sonner";

const STATUS = {
  won: { label: "待领取", color: "#F5C76B" },
  submitted: { label: "已提交", color: "#60A5FA" },
  paid: { label: "已发放", color: "#10B981" },
};

const fmt = (s) => new Date(s).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function Admin() {
  const [claims, setClaims] = useState([]);
  const navigate = useNavigate();

  const load = () => adminGetClaims().then((r) => setClaims(r.data.claims)).catch(() => {});
  useEffect(() => { load(); }, []);

  const doPay = async (code) => {
    try {
      await adminPayClaim(code);
      toast.success(`已标记 ${code} 为已发放`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "操作失败");
    }
  };

  const count = (s) => claims.filter((c) => c.status === s).length;

  return (
    <div className="min-h-screen pb-10">
      <PageHeader title="后台审核台" subtitle="领取申请管理" />
      <div className="px-4 mt-3">
        <motion.div className="card-blue grid grid-cols-3 py-4 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {[
            { label: "待领取", n: count("won"), icon: <Clock size={16} className="mx-auto mb-1" /> },
            { label: "已提交", n: count("submitted"), icon: <Package size={16} className="mx-auto mb-1" /> },
            { label: "已发放", n: count("paid"), icon: <BadgeCheck size={16} className="mx-auto mb-1" /> },
          ].map((s, i) => (
            <div key={s.label} data-testid={`admin-stat-${s.label}`} className="relative">
              {i > 0 && <span className="absolute left-0 top-2 bottom-2 w-px" style={{ background: "rgba(200,225,255,0.4)" }} />}
              {s.icon}
              <p className="text-[13px] font-medium text-white/95">{s.label}</p>
              <p className="font-num text-[30px] leading-tight text-white" style={{ textShadow: "0 2px 8px rgba(0,20,90,0.5)" }}>{s.n}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-5 space-y-4">
          {claims.map((c, i) => {
            const st = STATUS[c.status] || { label: c.status, color: "#94A3B8" };
            return (
              <motion.div key={c.code} data-testid={`claim-card-${i}`} className="glass p-4"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[13px]" style={{ color: "#94A3B8" }}>抽奖码</p>
                    <p className="font-mono text-[15px] font-bold" style={{ color: "#60A5FA" }}>{c.code}</p>
                  </div>
                  <span className="text-[12px] px-3 py-1 rounded-full font-bold" style={{ background: `${st.color}22`, color: st.color }}>{st.label}</span>
                </div>
                <p className="mt-3 text-[14px]" style={{ color: "#F8FAFC" }}>
                  金额：<span className="font-num text-[22px] font-black" style={{ color: "#F5C76B" }}>{c.amount} USDT</span>
                </p>
                {c.account_id && (
                  <p className="text-[12px] mt-1 flex items-center gap-1" style={{ color: "#94A3B8" }}>
                    收款ID：<span className="font-mono" style={{ color: "#60A5FA" }}>{c.account_id}</span>
                    <button onClick={() => { navigator.clipboard?.writeText(c.account_id); toast.success("已复制"); }} className="p-0.5"><Copy size={12} /></button>
                  </p>
                )}
                <p className="text-[11px] mt-2" style={{ color: "#64748B" }}>{fmt(c.created_at)}</p>
                {c.status === "submitted" && (
                  <button data-testid={`pay-btn-${i}`} onClick={() => doPay(c.code)}
                    className="btn-gold w-full py-2.5 mt-3 text-[15px] flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={16} /> 标记已发放
                  </button>
                )}
              </motion.div>
            );
          })}
          {claims.length === 0 && <div className="glass-dark p-8 text-center text-[14px]" style={{ color: "#94A3B8" }}>暂无领取申请</div>}
        </div>

        <button data-testid="admin-codes-btn" onClick={() => navigate("/admin/codes")}
          className="btn-blue w-full py-3.5 mt-6 text-[16px]">
          批量生成抽奖码
        </button>
      </div>
    </div>
  );
}
