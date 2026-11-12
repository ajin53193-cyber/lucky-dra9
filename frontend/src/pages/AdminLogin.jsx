import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn } from "lucide-react";
import { Logo } from "@/components/Logo";
import { adminLogin, setToken } from "@/api";
import { toast } from "sonner";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const doLogin = async () => {
    if (!password.trim()) return toast.error("请输入密码");
    setLoading(true);
    try {
      const r = await adminLogin(password);
      setToken(r.data.token);
      toast.success("登录成功");
      navigate("/admin");
    } catch (e) {
      toast.error(e.response?.data?.detail || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col items-center mb-8">
          <Logo size={52} />
          <h1 className="gold-title font-black text-[26px] mt-4">管理后台</h1>
          <p className="text-[12px] mt-1 tracking-widest" style={{ color: "#64748B" }}>GSET RWA ADMIN</p>
        </div>
        <div className="glass p-6">
          <p className="text-[13px] mb-2 flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
            <Lock size={14} /> 管理员密码
          </p>
          <input data-testid="admin-password-input" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doLogin()}
            placeholder="输入后台密码"
            className="w-full bg-transparent border rounded-xl px-4 py-3 text-[15px] outline-none"
            style={{ borderColor: "rgba(96,165,250,0.3)", color: "#F8FAFC" }} />
          <button data-testid="admin-login-btn" onClick={doLogin} disabled={loading}
            className="btn-gold w-full py-3.5 mt-4 text-[16px] flex items-center justify-center gap-1.5">
            <LogIn size={17} /> {loading ? "登录中..." : "登录"}
          </button>
        </div>
        <button onClick={() => navigate("/")} className="w-full text-center text-[13px] mt-5" style={{ color: "#64748B" }}>
          返回用户端
        </button>
      </motion.div>
    </div>
  );
}
