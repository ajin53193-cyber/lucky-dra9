import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { ASSETS, Sparkle } from "@/components/Decor";
import { getMyCodes } from "@/api";

const STATUS_STYLE = {
  unused: { label: "未使用" },
  used: { label: "已使用" },
  expired: { label: "已失效" },
};

const fmtDate = (s) => {
  const d = new Date(s);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function MyCodes() {
  const [codes, setCodes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyCodes().then((r) => setCodes(r.data.codes)).catch(() => {});
  }, []);

  const count = (s) => codes.filter((c) => c.status === s).length;

  return (
    <div className="min-h-screen pb-10">
      <PageHeader title="我的抽奖码" />
      <div className="px-4 mt-3">
        {/* stat bar */}
        <motion.div className="card-blue grid grid-cols-3 py-4 text-center"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {[
            { label: "可用抽奖码", n: count("unused") },
            { label: "已使用", n: count("used") },
            { label: "已失效", n: count("expired") },
          ].map((s, i) => (
            <div key={s.label} data-testid={`stat-${s.label}`} className="relative">
              {i > 0 && <span className="absolute left-0 top-2 bottom-2 w-px" style={{ background: "rgba(200,225,255,0.4)" }} />}
              <p className="text-[14px] font-medium text-white/95">{s.label}：</p>
              <p className="font-num text-[34px] leading-tight text-white" style={{ textShadow: "0 2px 8px rgba(0,20,90,0.5)" }}>{s.n}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-6 space-y-5">
          {codes.map((c, i) => {
            const st = STATUS_STYLE[c.status] || { label: c.status };
            const active = c.status === "unused";
            return (
              <motion.div key={c.code} data-testid={`code-card-${i}`}
                className={`relative overflow-hidden p-4 pr-3 ${active ? "glass-gold" : "glass-dark"}`}
                style={active ? { background: "linear-gradient(135deg, #3A7BF0 0%, #2557D0 50%, #1C45B5 100%)", borderRadius: 18 } : { borderRadius: 18 }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                {active && <span className="absolute left-0 top-0 w-10 h-10" style={{ background: "linear-gradient(135deg, #FCE3A2 0%, #E9AE4C 50%, transparent 50%)" }} />}
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rotate-45 shrink-0" style={{ background: active ? "linear-gradient(135deg,#FCE7B0,#E9AE4C)" : "linear-gradient(135deg,#8CC0FF,#3E7BEF)", boxShadow: active ? "0 0 8px #F5C76B" : "0 0 8px #4D9BFF" }} />
                  <p className="text-[17px] font-black whitespace-nowrap">
                    <span className="gold-text">抽奖码：</span><span className="font-num tracking-wide cream">{c.code}</span>
                  </p>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div className="pl-5 space-y-2 text-[15px] text-white">
                    <p>获取时间：<span className="font-num text-[16px]">{fmtDate(c.created_at)}</span></p>
                    <p>状态：{st.label}</p>
                  </div>
                  <div className="relative shrink-0 w-[116px] flex flex-col items-center">
                    <div className="absolute -top-[86px] right-1">
                      <img src={ASSETS.ticket} alt="" aria-hidden="true" className="w-[78px] h-auto" style={{ opacity: active ? 1 : 0.8 }} draggable={false} />
                      <Sparkle size={12} className="-right-2 top-1" color={active ? "#FFFFFF" : "#F8D78C"} />
                    </div>
                    {active ? (
                      <button data-testid={`use-code-btn-${i}`} className="relative btn-gold px-6 py-2 text-[15px]"
                        onClick={() => navigate(`/?code=${c.code}`)}>立即使用</button>
                    ) : (
                      <span className="relative btn-gold-dim px-4 py-2 text-[14px] whitespace-nowrap">状态：{st.label}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {codes.length === 0 && (
            <div className="glass-dark p-8 text-center text-[14px]" style={{ color: "#C9D6F5" }}>暂无抽奖码</div>
          )}
        </div>
        <p className="text-[14px] text-center mt-7 text-white/90">抽奖码校验通过后才能启动转盘</p>
        <p className="text-[12px] text-center mt-1" style={{ color: "#9DB4E8" }}>一个抽奖码仅可抽奖一次</p>
      </div>
    </div>
  );
}
