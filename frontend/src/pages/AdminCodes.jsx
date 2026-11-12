import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft, Copy } from "lucide-react";
import { adminBatchGen } from "@/api";
import { toast } from "sonner";

const AMOUNTS = [8, 18, 58, 588, 1888, 8888];
const COUNTS = [10, 50, 100, 200];

export default function AdminCodes() {
  const [amount, setAmount] = useState(58);
  const [count, setCount] = useState(50);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const doGen = async () => {
    setGenerating(true);
    try {
      const r = await adminBatchGen(amount, count);
      setResult(r.data);
      toast.success(`已生成 ${r.data.generated} 个 ${amount} USDT 抽奖码`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const copyAll = () => {
    navigator.clipboard?.writeText(result.codes.join("\n"));
    toast.success("全部抽奖码已复制");
  };

  return (
    <div className="min-h-screen pb-10">
      <div className="sticky top-0 z-40"
        style={{ background: "rgba(10, 14, 28, 0.72)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(96,165,250,0.12)" }}>
        <div className="flex items-center justify-between px-4 py-3">
          <button data-testid="back-btn" onClick={() => navigate("/admin")} className="flex items-center gap-0.5 text-sm" style={{ color: "#94A3B8" }}>
            <ChevronLeft size={18} /> 返回审核台
          </button>
          <h1 className="text-base font-black gold-text">批量生成抽奖码</h1>
          <span className="w-14" />
        </div>
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(245,199,107,0.5), rgba(96,165,250,0.5), transparent)" }} />
      </div>

      <div className="px-4 mt-4">
        <motion.div className="glass p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[15px] font-bold mb-3" style={{ color: "#F8FAFC" }}>选择金额档位</p>
          <div className="grid grid-cols-3 gap-2.5">
            {AMOUNTS.map((a) => (
              <button key={a} data-testid={`amount-${a}`} onClick={() => setAmount(a)}
                className="py-3 rounded-xl text-center font-num font-black text-[16px] transition-all"
                style={amount === a
                  ? { background: "linear-gradient(180deg,#FFF0C8,#EDB65A)", color: "#3A2306", boxShadow: "0 4px 16px rgba(232,168,64,0.4)" }
                  : { background: "rgba(96,165,250,0.1)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.25)" }}>
                {a}
              </button>
            ))}
          </div>

          <p className="text-[15px] font-bold mt-5 mb-3" style={{ color: "#F8FAFC" }}>生成数量</p>
          <div className="grid grid-cols-4 gap-2.5">
            {COUNTS.map((n) => (
              <button key={n} data-testid={`count-${n}`} onClick={() => setCount(n)}
                className="py-2.5 rounded-xl text-center font-num font-bold text-[15px] transition-all"
                style={count === n
                  ? { background: "linear-gradient(180deg,#60A5FA,#1D4ED8)", color: "#fff", boxShadow: "0 4px 16px rgba(59,130,246,0.4)" }
                  : { background: "rgba(96,165,250,0.08)", color: "#94A3B8", border: "1px solid rgba(96,165,250,0.2)" }}>
                {n}
              </button>
            ))}
          </div>

          <button data-testid="generate-btn" onClick={doGen} disabled={generating}
            className="btn-gold w-full py-3.5 mt-6 text-[17px]">
            {generating ? "生成中..." : `生成 ${count} 个 ${amount} USDT 抽奖码`}
          </button>
        </motion.div>

        {result && (
          <motion.div className="glass p-5 mt-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <p className="flex items-center gap-1.5 text-[15px] font-bold" style={{ color: "#10B981" }}>
                <CheckCircle2 size={17} /> 已生成 {result.generated} 个
              </p>
              <button data-testid="copy-all-btn" onClick={copyAll} className="btn-gold px-4 py-1.5 text-[13px] flex items-center gap-1">
                <Copy size={13} /> 全部复制
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-xl p-3 space-y-1.5" style={{ background: "rgba(10,20,60,0.5)", border: "1px solid rgba(96,165,250,0.15)" }}>
              {result.codes.map((c, i) => (
                <p key={c} data-testid={`gen-code-${i}`} className="font-mono text-[13px]" style={{ color: "#93C5FD" }}>{c}</p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
