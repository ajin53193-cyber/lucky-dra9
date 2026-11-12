import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Ticket, Plus } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { adminGetCodes, adminBatchGen } from "@/api";
import { toast } from "sonner";

const AMOUNTS = [8, 18, 58, 588, 1888, 8888];
const COUNTS = [10, 50, 100, 200];
const STATUS = { unused: { label: "未使用", color: "#10B981" }, used: { label: "已使用", color: "#60A5FA" }, expired: { label: "已失效", color: "#64748B" } };

export default function AdminCodes() {
  const [codes, setCodes] = useState([]);
  const [amount, setAmount] = useState(58);
  const [count, setCount] = useState(50);
  const [filterAmt, setFilterAmt] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showGen, setShowGen] = useState(false);

  const load = () => adminGetCodes(filterStatus || null, filterAmt || null).then((r) => setCodes(r.data.codes)).catch(() => {});
  useEffect(() => { load(); }, [filterStatus, filterAmt]);

  const doGen = async () => {
    setGenerating(true);
    try {
      const r = await adminBatchGen(amount, count);
      toast.success(`已生成 ${r.data.generated} 个 ${amount} USDT 抽奖码`);
      setShowGen(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "生成失败");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AdminShell title="抽奖码管理">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <select data-testid="filter-amount" value={filterAmt} onChange={(e) => setFilterAmt(Number(e.target.value))}
            className="px-3 py-2 rounded-xl text-[13px] font-bold outline-none"
            style={{ background: "rgba(96,165,250,0.1)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.25)" }}>
            <option value={0}>全部金额</option>
            {AMOUNTS.map((a) => <option key={a} value={a}>{a} USDT</option>)}
          </select>
          <select data-testid="filter-status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-[13px] font-bold outline-none"
            style={{ background: "rgba(96,165,250,0.1)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.25)" }}>
            <option value="">全部状态</option>
            <option value="unused">未使用</option>
            <option value="used">已使用</option>
            <option value="expired">已失效</option>
          </select>
        </div>
        <button data-testid="toggle-gen-btn" onClick={() => setShowGen(!showGen)} className="btn-gold px-4 py-2 text-[13px] flex items-center gap-1">
          <Plus size={14} /> 生成
        </button>
      </div>

      {showGen && (
        <motion.div className="glass p-4 mb-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <p className="text-[13px] font-bold mb-2" style={{ color: "#94A3B8" }}>金额档位</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {AMOUNTS.map((a) => (
              <button key={a} onClick={() => setAmount(a)} className="py-2 rounded-lg font-num font-black text-[14px]"
                style={amount === a ? { background: "linear-gradient(180deg,#FFF0C8,#EDB65A)", color: "#3A2306" } : { background: "rgba(96,165,250,0.1)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.2)" }}>
                {a}
              </button>
            ))}
          </div>
          <p className="text-[13px] font-bold mb-2" style={{ color: "#94A3B8" }}>数量</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {COUNTS.map((n) => (
              <button key={n} onClick={() => setCount(n)} className="py-2 rounded-lg font-num font-bold text-[13px]"
                style={count === n ? { background: "linear-gradient(180deg,#60A5FA,#1D4ED8)", color: "#fff" } : { background: "rgba(96,165,250,0.08)", color: "#94A3B8", border: "1px solid rgba(96,165,250,0.15)" }}>
                {n}
              </button>
            ))}
          </div>
          <button data-testid="generate-btn" onClick={doGen} disabled={generating} className="btn-gold w-full py-3 text-[15px]">
            {generating ? "生成中..." : `生成 ${count} 个 ${amount} USDT 码`}
          </button>
        </motion.div>
      )}

      <div className="space-y-2.5">
        {codes.map((c, i) => {
          const st = STATUS[c.status] || { label: c.status, color: "#94A3B8" };
          return (
            <motion.div key={c.code} data-testid={`code-row-${i}`} className="glass px-4 py-3 flex items-center justify-between"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <div className="min-w-0">
                <p className="font-mono text-[14px] font-bold truncate" style={{ color: "#60A5FA" }}>{c.code}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#64748B" }}>{new Date(c.created_at).toLocaleDateString("zh-CN")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="font-num text-[14px] font-black" style={{ color: "#F5C76B" }}>{c.amount ?? "—"}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${st.color}22`, color: st.color }}>{st.label}</span>
                <button onClick={() => { navigator.clipboard?.writeText(c.code); toast.success("已复制"); }} className="p-1" style={{ color: "#64748B" }}><Copy size={13} /></button>
              </div>
            </motion.div>
          );
        })}
        {codes.length === 0 && <div className="glass-dark p-8 text-center text-[14px]" style={{ color: "#94A3B8" }}>暂无抽奖码</div>}
      </div>
    </AdminShell>
  );
}
