import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Ticket, BadgeCheck, Settings, ExternalLink, LogOut } from "lucide-react";
import { clearToken, getToken } from "@/api";

const NAV = [
  { to: "/admin", label: "数据总览", icon: LayoutDashboard },
  { to: "/admin/codes", label: "抽奖码管理", icon: Ticket },
  { to: "/admin/claims", label: "领取审核", icon: BadgeCheck },
  { to: "/admin/settings", label: "活动设置", icon: Settings },
];

export const AdminShell = ({ title, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!getToken()) navigate("/admin/login", { replace: true });
  }, []);
  if (!getToken()) return null;
  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40"
        style={{ background: "rgba(10, 14, 28, 0.78)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(96,165,250,0.12)" }}>
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <h1 className="text-base font-black gold-text">{title}</h1>
            <p className="text-[10px] mt-0.5 tracking-wider" style={{ color: "#64748B" }}>GSET RWA 管理后台</p>
          </div>
          <div className="flex items-center gap-2">
            <button data-testid="goto-site" onClick={() => navigate("/")} className="pill-outline px-3.5 py-1.5 text-[12px] flex items-center gap-1" style={{ color: "#60A5FA" }}>
              <ExternalLink size={12} /> 用户端
            </button>
            <button data-testid="admin-logout" onClick={() => { clearToken(); navigate("/admin/login"); }} className="pill-outline px-3 py-1.5 text-[12px] flex items-center gap-1" style={{ color: "#94A3B8" }}>
              <LogOut size={12} />
            </button>
          </div>
        </div>
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(245,199,107,0.5), rgba(96,165,250,0.5), transparent)" }} />
      </div>
      <div className="px-4 pt-4 pb-2">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[480px] mx-auto"
        style={{ background: "rgba(10, 14, 28, 0.92)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(96,165,250,0.15)" }}>
        <div className="grid grid-cols-4">
          {NAV.map((n) => {
            const active = location.pathname === n.to;
            const Icon = n.icon;
            return (
              <button key={n.to} data-testid={`admin-nav-${n.label}`} onClick={() => navigate(n.to)}
                className="flex flex-col items-center gap-1 py-2.5"
                style={{ color: active ? "#F5C76B" : "#64748B" }}>
                <Icon size={19} />
                <span className="text-[10px] font-medium">{n.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
