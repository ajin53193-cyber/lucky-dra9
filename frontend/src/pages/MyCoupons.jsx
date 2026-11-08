import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Copy, Headset } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getMyCoupons } from "@/api";
import { toast } from "sonner";

const STATUS_STYLE = {
  pending: { label: "待兑换", color: "#F5C76B" },
  redeemed: { label: "已兑换", color: "#5EE0A0" },
  expired: { label: "已过期", color: "#8A93B0" },
};

export default function MyCoupons() {
  const [coupons, setCoupons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyCoupons().then((r) => setCoupons(r.data.coupons)).catch(() => {});
  }, []);

  const count = (s) => coupons.filter((c) => c.status === s).length;

  return (
    <div className="min-h-screen pb-10" style={{ background: "#0F1320" }}>
      <PageHeader title="我的领取券" />
      <div className="px-4 mt-4">
        <motion.div className="glass-gold grid grid-cols-4 divide-x py-4 text-center" style={{ borderColor: "rgba(245,199,107,0.12)" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {[
            { label: "全部", n: coupons.length },
            { label: "待兑换", n: count("pending") },
            { label: "已兑换", n: count("redeemed") },
            { label: "已过期", n: count("expired") },
          ].map((s) => (
            <div key={s.label} data-testid={`stat-${s.label}`}>
              <p className="text-xs" style={{ color: "#8A93B0" }}>{s.label}</p>
              <p className="font-num text-2xl font-black mt-1" style={{ color: "#F5C76B" }}>{s.n}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-5 space-y-4">
          {coupons.map((c, i) => {
            const st = STATUS_STYLE[c.status];
            const active = c.status === "pending";
            return (
              <motion.div key={c.code} data-testid={`coupon-card-${i}`} className="glass p-4"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold font-mono" style={{ color: "#6EA8FF" }}>{c.code}</p>
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: `${st.color}22`, color: st.color }}>{st.label}</span>
                </div>
                <p className="mt-3 text-sm" style={{ color: "#EDF1FA" }}>中奖金额：<span className="font-num text-xl font-black" style={{ color: "#F5C76B" }}>{c.amount} USDT</span></p>
                <p className="text-xs mt-1" style={{ color: "#8A93B0" }}>有效期至：{new Date(c.expires_at).toLocaleDateString("zh-CN")}</p>
                <div className="flex gap-3 mt-4">
                  <button data-testid={`copy-coupon-btn-${i}`} disabled={!active}
                    className={`flex-1 py-2 text-xs flex items-center justify-center gap-1 ${active ? "btn-gold" : "btn-locked"}`}
                    onClick={() => { navigator.clipboard?.writeText(c.code); toast.success("券码已复制"); }}>
                    <Copy size={13} /> 复制券码
                  </button>
                  <button data-testid={`contact-btn-${i}`} disabled={!active}
                    className={`flex-1 py-2 text-xs flex items-center justify-center gap-1 ${active ? "btn-blue" : "btn-locked"}`}
                    onClick={() => navigate("/redeem")}>
                    <Headset size={13} /> 联系客服
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-center mt-6" style={{ color: "#8A93B0" }}>领取券有有效期，超时自动失效</p>
      </div>
    </div>
  );
}
