import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export const PageHeader = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
      style={{ background: "rgba(15,19,32,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(90,130,255,0.12)" }}>
      <button data-testid="back-btn" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm" style={{ color: "#8A93B0" }}>
        <ChevronLeft size={18} /> 返回
      </button>
      <h1 className="text-base font-bold font-display gold-text">{title}</h1>
      <button data-testid="home-btn" onClick={() => navigate("/")} className="text-sm" style={{ color: "#8A93B0" }}>首页</button>
    </div>
  );
};
