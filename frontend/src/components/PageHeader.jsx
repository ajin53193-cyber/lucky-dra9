import { useNavigate } from "react-router-dom";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { TechLine } from "@/components/Decor";

export const PageHeader = ({ title, menu = false }) => {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40"
      style={{ background: "linear-gradient(180deg, rgba(8,20,58,0.96) 0%, rgba(8,20,58,0.75) 75%, rgba(8,20,58,0) 100%)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
      <div className="relative flex items-center justify-between px-4 pt-4 pb-2">
        <button data-testid="back-btn" onClick={() => navigate(-1)} className="flex items-center gap-0.5 text-[17px] font-medium text-white z-10">
          <ChevronLeft size={26} strokeWidth={2.2} /> 返回
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[22px] font-black tracking-wide text-white"
          style={{ textShadow: "0 2px 10px rgba(60,130,255,0.5)" }}>{title}</h1>
        {menu ? (
          <div className="pill-outline flex items-center z-10 text-[15px] text-white">
            <span className="px-3 py-1.5"><MoreHorizontal size={18} /></span>
            <span className="w-px h-4" style={{ background: "rgba(160,190,255,0.45)" }} />
            <button data-testid="home-btn" onClick={() => navigate("/")} className="px-3 py-1.5 font-medium">首页</button>
          </div>
        ) : (
          <button data-testid="home-btn" onClick={() => navigate("/")} className="text-[17px] font-medium text-white z-10">首页</button>
        )}
      </div>
      <TechLine className="px-2 opacity-90" />
    </div>
  );
};
