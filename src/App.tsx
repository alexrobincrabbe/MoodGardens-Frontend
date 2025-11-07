import { useState } from "react";
import { Outlet} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { TopBar, DesktopSidebar, MobileSidebar } from "./components";
import { AuthPanelProvider } from "./contexts";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-md px-3 py-2 text-sm transition-colors",
      isActive
        ? "bg-emerald-100 text-emerald-800"
        : "text-gray-700 hover:bg-emerald-50",
    ].join(" ");

  return (
    <AuthPanelProvider>
    <div className="min-h-screen text-neutral-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: "0.9rem" },
        }}
      />
      <TopBar setSidebarOpen={setSidebarOpen} />
      <div className="mx-auto flex">
        <DesktopSidebar linkClasses={linkClasses} />
        <main className="from-pastel-aqua to-peach-cream w-full bg-gradient-to-b p-4">
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



