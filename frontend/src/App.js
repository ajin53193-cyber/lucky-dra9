import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import MyCodes from "@/pages/MyCodes";
import Redeem from "@/pages/Redeem";
import Rules from "@/pages/Rules";
import Admin from "@/pages/Admin";
import AdminCodes from "@/pages/AdminCodes";
import { PageBg } from "@/components/Decor";

function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="App relative max-w-[480px] mx-auto min-h-screen" style={{ background: "#050C26" }}>
      <PageBg />
      <div className="page-content" style={{ overflowX: "clip" }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/codes" element={<MyCodes />} />
            <Route path="/redeem" element={<Redeem />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/codes" element={<AdminCodes />} />
          </Routes>
        </BrowserRouter>
      </div>
      <Toaster position="top-center" theme="dark" />
    </div>
  );
}

export default App;
