import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { getMyCodes } from "@/api";

const STATUS_STYLE = {
  unused: { label: "未使用", color: "#5EE0A0" },
  used: { label: "已开奖", color: "#6EA8FF" },
  expired: { label: "已失效", color: "#8A93B0" },
};

export default function MyCodes() {
  const [codes, setCodes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyCodes().then((r) => setCodes(r.data.codes)).catch(() => {});
  }, []);

  const count = (s) => codes.filter((c) => c.status === s).length;

  return (
    <div className="min-h-screen pb-10" style={{ background: "#0F1320" }}>
      <PageHeader title="我的抽奖码" />
      <div className="px-4 mt-4">
        <motion.div className="glass grid grid-cols-3 divide-x py-4 text-center" style={{ borderColor: "rgba(90,130,255,0.12)" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {[
            { label: "可用抽奖码", n: count("unused"), color: "#F5C76B" },
            { label: "已使用", n: count("used"), color: "#6EA8FF" },
            { label: "已失效", n: count("expired"), color: "#8A93B0" },
          ].map((s) => (
            <div key={s.label} data-testid={`stat-${s.label}`}>
              <p className="text-xs" style={{ color: "#8A93B0" }}>{s.label}</p>
              <p className="font-num text-3xl font-black mt-1" style={{ color: s.color }}>{s.n}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-5 space-y-4">
          {codes.map((c, i) => {
            const st = STATUS_STYLE[c.status];
            return (
              <motion.div key={c.code} data-testid={`code-card-${i}`} className="glass p-4"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#F5C76B" }}>抽奖码：<span className="font-mono">{c.code}</span></p>
                    <p className="text-xs mt-2" style={{ color: "#8A93B0" }}>获取时间：{new Date(c.created_at).toLocaleDateString("zh-CN")}</p>
                    <p className="text-xs mt-1" style={{ color: st.color }}>状态：{st.label}</p>
                  </div>
                  {c.status === "unused" ? (
                    <button data-testid={`use-code-btn-${i}`} className="btn-gold px-4 py-2 text-xs"
                      onClick={() => navigate(`/?code=${c.code}`)}>立即使用</button>
                  ) : (
                    <span className="px-4 py-2 text-xs rounded-full" style={{ background: "rgba(120,130,160,0.15)", color: "#8A93B0" }}>{st.label}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-center mt-6" style={{ color: "#8A93B0" }}>一个抽奖码仅可抽奖一次</p>
      </div>
    </div>
  );
}
