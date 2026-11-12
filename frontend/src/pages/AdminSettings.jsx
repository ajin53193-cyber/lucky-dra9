import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Settings, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { adminGetSettings, adminUpdateSettings } from "@/api";
import { toast } from "sonner";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [pool, setPool] = useState("");
  const [title, setTitle] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetSettings().then((r) => {
      setSettings(r.data);
      setPool(String(r.data.total_pool));
      setTitle(r.data.activity_title);
      setActive(r.data.activity_active);
    }).catch(() => {});
  }, []);

  const doSave = async () => {
    setSaving(true);
    try {
      await adminUpdateSettings({ total_pool: Number(pool), activity_title: title, activity_active: active });
      toast.success("设置已保存");
    } catch (e) {
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="活动设置">
      <motion.div className="glass p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="flex items-center gap-2 text-[15px] font-bold mb-5" style={{ color: "#F8FAFC" }}>
          <Settings size={17} style={{ color: "#F5C76B" }} /> 基础设置
        </p>

        <p className="text-[13px] mb-2" style={{ color: "#94A3B8" }}>活动标题</p>
        <input data-testid="setting-title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border rounded-xl px-4 py-3 text-[15px] outline-none mb-4"
          style={{ borderColor: "rgba(96,165,250,0.3)", color: "#F8FAFC" }} />

        <p className="text-[13px] mb-2" style={{ color: "#94A3B8" }}>总奖池（USDT）</p>
        <input data-testid="setting-pool" value={pool} onChange={(e) => setPool(e.target.value)}
          type="number"
          className="w-full bg-transparent border rounded-xl px-4 py-3 text-[15px] font-num outline-none mb-4"
          style={{ borderColor: "rgba(96,165,250,0.3)", color: "#F5C76B" }} />

        <div className="flex items-center justify-between py-3 border-t" style={{ borderColor: "rgba(96,165,250,0.1)" }}>
          <div>
            <p className="text-[14px] font-bold" style={{ color: "#F8FAFC" }}>活动开启</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#64748B" }}>关闭后用户无法抽奖</p>
          </div>
          <button data-testid="setting-active" onClick={() => setActive(!active)}>
            {active ? <ToggleRight size={36} style={{ color: "#10B981" }} /> : <ToggleLeft size={36} style={{ color: "#64748B" }} />}
          </button>
        </div>

        <button data-testid="save-settings-btn" onClick={doSave} disabled={saving}
          className="btn-gold w-full py-3.5 mt-4 text-[16px] flex items-center justify-center gap-1.5">
          <Save size={17} /> {saving ? "保存中..." : "保存设置"}
        </button>
      </motion.div>
    </AdminShell>
  );
}
