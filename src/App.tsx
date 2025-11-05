import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuthData } from "./hooks";
import { SignOutButton } from "./components";
import { Toaster } from "react-hot-toast";
import { Menu } from "lucide-react";
import logo from "./assets/images/mg-logo.png";

export default function App() {
  const { user, authReady } = useAuthData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-md px-3 py-2 text-sm transition-colors",
      isActive
        ? "bg-emerald-100 text-emerald-800"
        : "text-gray-700 hover:bg-emerald-50",
    ].join(" ");

  return (
    <div className="min-h-screen bg-matteGold text-neutral-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: "0.9rem" },
        }}
      />

      {/* Sticky top bar */}
      <header className="sticky md:h-[72px] md:p-2 top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex items-center justify-between">
          {/* Left: logo + burger (burger only on mobile) */}
          <div className="flex items-center">
            {/* Burger: mobile only */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden rounded-md p-1.5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Open navigation"
            >
                <Menu className="h-12 w-12" />
            </button>
            <span className="md:flex hidden items-center gap-2 font-bold text-emerald-800">
                <img src={logo} className="h-12"></img>
              <span className="text-3xl w-full text-center">Mood Gardens</span>
            </span>
          </div>

          {/* Right: auth state + logout, always in top bar */}
          <div className="flex items-center gap-3">
            {!authReady && (
              <p className="text-sm text-gray-600">Signing in...</p>
            )}

            {user && authReady && (
              <div className="flex-col items-center">
                <div className="text-center block">
                  <p className="text-sm font-medium truncate max-w-[160px]">
                    {user.email}
                  </p>
                </div>
                <SignOutButton />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Layout: sidebar + content */}
      <div className="mx-auto flex">
        {/* Desktop sidebar (always visible) */}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-52 shrink-0 border-r bg-white/90 p-4 md:block">
          <nav className="flex flex-col gap-2">
            <NavLink to="/" end className={linkClasses}>
              Home
            </NavLink>
            <NavLink to="/today" className={linkClasses}>
              Today
            </NavLink>
            <NavLink to="/gardens" className={linkClasses}>
              Gardens
            </NavLink>
          </nav>
        </aside>

        {/* Main content */}
        <main className="w-full bg-gradient-to-b from-pastel-aqua to-peach-cream p-4">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar (slide-out drawer) */}
      {/* Dark overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-white p-4 shadow-lg transform transition-transform duration-200 ease-out md:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold text-emerald-800">
            <img src={logo} className="h-16" />
            <span>Mood Gardens</span>
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink
            to="/"
            end
            className={linkClasses}
            onClick={() => setSidebarOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/today"
            className={linkClasses}
            onClick={() => setSidebarOpen(false)}
          >
            Today
          </NavLink>
          <NavLink
            to="/gardens"
            className={linkClasses}
            onClick={() => setSidebarOpen(false)}
          >
            Gardens
          </NavLink>
        </nav>
      </aside>
    </div>
  );
}
