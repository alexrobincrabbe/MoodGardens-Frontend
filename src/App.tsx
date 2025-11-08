import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { TopBar, DesktopSidebar, MobileSidebar } from "./components";
import { AuthPanelProvider } from "./contexts";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-md px-3 py-2 text-xl transition-colors",
      isActive
        ? "bg-emerald-100 text-emerald-800"
        : "text-emeralld-800 hover:bg-emerald-50",
    ].join(" ");

  return (
    <AuthPanelProvider>
      <div className="font-poiret-one min-h-screen text-heart-blue">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: "0.9rem" },
          }}
        />
        <TopBar setSidebarOpen={setSidebarOpen} />
        <div className="mx-auto flex">
          <DesktopSidebar className="bg-white font-zen-loop" linkClasses={linkClasses} />
          <main className="min-h-screen background-image: bg-[repeating-linear-gradient(to_bottom,#c7d9d3_0,#d8f1f4_50vh,#fbe9db_100vh,#c7d9d3_150vh)] w-full p-4">
            <Outlet />
          </main>
        </div>
        <MobileSidebar
          linkClasses={linkClasses}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>
    </AuthPanelProvider>
  );
}
