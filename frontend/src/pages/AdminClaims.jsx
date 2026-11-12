import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, Copy, Package, BadgeCheck, Download } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { adminGetClaims, adminPayClaim, exportClaims } from "@/api";
import { toast } from "sonner";

const STATUS = {
  won: { label: "待领取", color: "#F5C76B" },
  submitted: { label: "已提交", color: "#60A5FA" },
  paid: { label: "已发放", color: "#10B981" },
};

const fmt = (s) => new Date(s).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState("all");
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

  const filtered = filter === "all" ? claims : claims.filter((c) => c.status === filter);
  const count = (s) => claims.filter((c) => c.status === s).length;

  return (
    <AdminShell title="领取审核">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1" style={{ scrollbarWidth: "none" }}>
          {[
            { key: "all", label: `全部 ${claims.length}` },
            { key: "won", label: `待领取 ${count("won")}` },
            { key: "submitted", label: `已提交 ${count("submitted")}` },
            { key: "paid", label: `已发放 ${count("paid")}` },
          ].map((t) => (
            <button key={t.key} data-testid={`filter-${t.key}`} onClick={() => setFilter(t.key)}
              className="shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all"
              style={filter === t.key
                ? { background: "linear-gradient(180deg,#FFF0C8,#EDB65A)", color: "#3A2306" }
                : { background: "rgba(96,165,250,0.1)", color: "#94A3B8", border: "1px solid rgba(96,165,250,0.2)" }}>
              {t.label}
            </button>
          ))}
        </div>
        <button data-testid="export-claims-btn" onClick={() => exportClaims(filter === "all" ? null : filter)}
          className="pill-outline shrink-0 px-3.5 py-2 text-[13px] flex items-center gap-1" style={{ color: "#60A5FA" }}>
          <Download size={13} /> 导出
        </button>
      </div>

      <div className="space-y-4">
        {filtered.map((c, i) => {
          const st = STATUS[c.status] || { label: c.status, color: "#94A3B8" };
          return (
            <motion.div key={c.code} data-testid={`claim-card-${i}`} className="glass p-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[12px]" style={{ color: "#64748B" }}>抽奖码</p>
                  <p className="font-mono text-[15px] font-bold" style={{ color: "#60A5FA" }}>{c.code}</p>
                </div>
                <span className="text-[12px] px-3 py-1 rounded-full font-bold" style={{ background: `${st.color}22`, color: st.color }}>{st.label}</span>
              </div>
              <p className="mt-3 text-[14px]" style={{ color: "#F8FAFC" }}>
                金额：<span className="font-num text-[22px] font-black" style={{ color: "#F5C76B" }}>{c.amount} USDT</span>
              </p>
              {c.account_id && (
                <p className="text-[12px] mt-1.5 flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
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
        {filtered.length === 0 && <div className="glass-dark p-8 text-center text-[14px]" style={{ color: "#94A3B8" }}>暂无记录</div>}
      </div>
    </AdminShell>
  );
}
