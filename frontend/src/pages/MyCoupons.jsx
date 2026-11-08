import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle2, Copy, ChevronsRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ASSETS } from "@/components/Decor";
import { getMyCoupons } from "@/api";
import { toast } from "sonner";

const STATUS_STYLE = {
  pending: { label: "未兑换" },
  redeemed: { label: "已兑换" },
  expired: { label: "已过期" },
};

const fmtDate = (s) => {
  const d = new Date(s);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// ticket shape: beveled top-right corner + perforation notch on the left edge
const TICKET_CLIP = "polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 0 100%)";
const NOTCH_MASK = "radial-gradient(circle 9px at 0 64px, transparent 8.5px, #000 9px)";

export default function MyCoupons() {
  const [coupons, setCoupons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyCoupons().then((r) => setCoupons(r.data.coupons)).catch(() => {});
  }, []);

  const count = (s) => coupons.filter((c) => c.status === s).length;

  return (
    <div className="min-h-screen pb-10 relative">
      <span className="absolute left-0 top-[46%] z-10 px-1.5 py-3 rounded-r-lg" style={{ background: "linear-gradient(180deg,#3E7BEF,#1C45B5)", boxShadow: "0 0 12px rgba(77,155,255,0.6)" }}>
        <ChevronsRight size={16} className="text-white" />
      </span>
      <PageHeader title="我的领取券" menu />
      <div className="px-4 mt-4">
        {/* overview frame */}
        <motion.div className="relative tech-glow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="absolute -top-3 left-3 z-10 px-5 py-1 text-[14px] font-black" style={{ background: "linear-gradient(135deg,#FCE3A2,#E9AE4C)", color: "#3A2306", clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)" }}>总览卡</span>
          <div className="tech-frame blue" style={{ "--cut": "16px" }}>
            <div className="tech-inner px-4 pt-6 pb-4">
              <div className="flex justify-between text-[15px] font-bold">
                <span data-testid="stat-全部" className="gold-text">领取券总数：<span className="font-num">{coupons.length}</span></span>
                <span data-testid="stat-待兑换" className="cream">待兑换：<span className="font-num">{count("pending")}</span></span>
              </div>
              <div className="card-blue mt-4 px-4 py-3" style={{ borderRadius: 14 }}>
                <div className="flex justify-between items-center">
                  <span className="text-[22px] font-black text-white">领取券：<span className="font-num">{coupons.length}</span></span>
                  <span data-testid="stat-已兑换" className="text-[14px] text-white">已兑换：<span className="font-num">{count("redeemed")}</span></span>
                </div>
                <div className="h-px my-2.5" style={{ background: "rgba(200,225,255,0.3)" }} />
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-[12px]" style={{ color: "#CFE0FF" }}><CheckCircle2 size={14} style={{ color: "#9CC8FF" }} /> 凭券码联系客服兑换</span>
                  <span data-testid="stat-已过期" className="text-[14px] text-white">已过期：<span className="font-num">{count("expired")}</span></span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 space-y-5">
          {coupons.map((c, i) => {
            const st = STATUS_STYLE[c.status] || { label: c.status };
            const active = c.status === "pending";
            return (
              <motion.div key={c.code} data-testid={`coupon-card-${i}`} className="relative"
                style={{ filter: active ? "drop-shadow(0 0 10px rgba(245,199,107,0.35))" : "drop-shadow(0 0 10px rgba(77,155,255,0.35))" }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div style={{ WebkitMaskImage: NOTCH_MASK, maskImage: NOTCH_MASK }}>
                <div className="p-[1.5px]" style={{ clipPath: TICKET_CLIP, borderRadius: 16, background: active ? "linear-gradient(135deg,#F8D78C,rgba(248,215,140,0.3) 40%,#5FB0FF)" : "linear-gradient(135deg,rgba(140,190,255,0.8),rgba(77,155,255,0.3) 50%,#5FB0FF)" }}>
                  <div className="relative" style={{ clipPath: TICKET_CLIP, borderRadius: 15, background: active ? "linear-gradient(160deg,#2556C6 0%,#173C99 55%,#112E7C 100%)" : "linear-gradient(160deg,#1B3F98 0%,#132F7A 55%,#0E2462 100%)" }}>
                    {/* corner tab = contact service */}
                    <button data-testid={`contact-btn-${i}`} disabled={!active} onClick={() => navigate("/redeem")}
                      className="absolute right-0 top-0 pl-6 pr-4 py-2 text-[14px] font-bold flex items-center gap-0.5 disabled:opacity-60"
                      style={{ color: "#FCE7B0", background: "linear-gradient(135deg,#4E95FF,#2557D0)", clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)" }}>
                      联系客服 <ChevronRight size={14} />
                    </button>
                    {/* header strip */}
                    <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px dashed rgba(160,200,255,0.35)" }}>
                      <p className="text-[17px] font-black cream whitespace-nowrap">领取券 <span className="font-num tracking-wide">{c.code}</span></p>
                    </div>
                    <div className="relative px-5 pt-3 pb-4">
                      <img src={ASSETS.hexCheck} alt="" aria-hidden="true" draggable={false}
                        className="absolute right-3 top-0 w-[108px] h-auto pointer-events-none" style={{ opacity: active ? 1 : 0.7, filter: active ? "none" : "saturate(0.7)" }} />
                      <p className="text-[15px] font-bold text-white">中奖金额：<span className="font-num text-[28px] gold-text">{c.amount} USDT</span></p>
                      <p className="text-[14px] mt-1.5 text-white">状态：{st.label}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="flex items-center gap-1.5 text-[13px] text-white/95 whitespace-nowrap">
                          <CheckCircle2 size={15} style={{ color: "#F5C76B" }} /> 有效期至：<span className="font-num text-[15px]">{fmtDate(c.expires_at)}</span>
                        </p>
                        <button data-testid={`copy-coupon-btn-${i}`} disabled={!active}
                          className={`relative z-[1] px-4 py-2 text-[14px] flex items-center gap-1 whitespace-nowrap ${active ? "btn-gold" : "btn-gold-dim"}`}
                          onClick={() => { navigator.clipboard?.writeText(c.code).catch(() => {}); toast.success("券码已复制"); }}>
                          {active ? (<><Copy size={14} /> 复制券码</>) : `状态：${st.label}`}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </motion.div>
            );
          })}
          {coupons.length === 0 && (
            <div className="glass-dark p-8 text-center text-[14px]" style={{ color: "#C9D6F5" }}>暂无领取券，快去抽奖吧</div>
          )}
        </div>
        <p className="text-[14px] text-center mt-7 text-white/90">中奖不会自动到账，凭券码联系客服兑换<span className="blue-text font-bold">USDT</span></p>
        <p className="text-[12px] text-center mt-1" style={{ color: "#9DB4E8" }}>领取券有有效期，超时自动失效</p>
      </div>
    </div>
  );
}
