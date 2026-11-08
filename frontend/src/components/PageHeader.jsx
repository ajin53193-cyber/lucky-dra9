import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export const PageHeader = ({ title, subtitle }) => {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40"
      style={{ background: "rgba(10, 14, 28, 0.72)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(96, 165, 250, 0.12)" }}>
      <div className="flex items-center justify-between px-4 py-3">
        <button data-testid="back-btn" onClick={() => navigate(-1)} className="flex items-center gap-0.5 text-sm" style={{ color: "#94A3B8" }}>
          <ChevronLeft size={18} /> 返回
        </button>
        <div className="text-center">
          <h1 className="text-base font-black gold-text">{title}</h1>
          {subtitle && <p className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>{subtitle}</p>}
        </div>
        <button data-testid="home-btn" onClick={() => navigate("/")} className="text-sm" style={{ color: "#94A3B8" }}>首页</button>
      </div>
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(245,199,107,0.5), rgba(96,165,250,0.5), transparent)" }} />
    </div>
  );
};
