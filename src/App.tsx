import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { TopBar, MobileSidebar } from "./components";
import { AuthPanelProvider } from "./contexts";
import { ScrollToHash } from "./components";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-md px-3 py-2 text-xl transition-colors",
      isActive
        ? "bg-emerald-100 text-emerald-800"
        : "hover:bg-emerald-50",
    ].join(" ");

  return (
    <AuthPanelProvider>
      <div className="font-poiret-one text-heart-blue min-h-screen">
        <Toaster
          position="top-right"
          containerStyle={{
            top: 100, // adjust this to match your TopBar height (in px)
            right: 16,
          }}
          toastOptions={{
            duration: 3000,
            style: { fontSize: "0.9rem" },
          }}
        />
        <ScrollToHash />
        <TopBar linkClasses={linkClasses} setSidebarOpen={setSidebarOpen} />
        <div className="mx-auto flex">
          <main className="background-image: min-h-screen w-full bg-[repeating-linear-gradient(to_bottom,#c7d9d3_0,#d8f1f4_50vh,#fbe9db_100vh,#c7d9d3_150vh)] p-4">
            <Outlet />
          </main>
        </div>
        <MobileSidebar
          className="lg:hidden"
          linkClasses={linkClasses}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>
    </AuthPanelProvider>
  );
}
