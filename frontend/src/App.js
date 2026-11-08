import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import MyCodes from "@/pages/MyCodes";
import MyCoupons from "@/pages/MyCoupons";
import Invite from "@/pages/Invite";
import Redeem from "@/pages/Redeem";
import Rules from "@/pages/Rules";

function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="App max-w-[480px] mx-auto min-h-screen" style={{ background: "#0F1320" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/codes" element={<MyCodes />} />
          <Route path="/coupons" element={<MyCoupons />} />
          <Route path="/invite" element={<Invite />} />
          <Route path="/redeem" element={<Redeem />} />
          <Route path="/rules" element={<Rules />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" theme="dark" />
    </div>
  );
}

export default App;
