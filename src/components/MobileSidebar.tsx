import { NavLink } from "react-router-dom";
import { type LinkClasses } from "../types";

type MobileSidebarProps = {
  className: string;
  linkClasses: LinkClasses;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function MobileSidebar({
  className = "",
  linkClasses,
  sidebarOpen,
  setSidebarOpen,
}: MobileSidebarProps) {
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`${className} font-zen-loop fixed inset-y-0 left-0 z-50 w-48 transform border-r bg-white p-4 shadow-lg transition-transform duration-200 ease-out  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-3xl">Mood Gardens</span>
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
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
    </>
  );
}
