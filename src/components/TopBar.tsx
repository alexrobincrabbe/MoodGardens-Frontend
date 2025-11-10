import { useAuthData } from "../hooks";
import { GenericButton, SignOutButton } from "../components";
import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { type LinkClasses } from "../types";

type TopBarProps = {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  linkClasses: LinkClasses;
};

export function TopBar({ setSidebarOpen, linkClasses }: TopBarProps) {
  const { user, authReady } = useAuthData();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md backdrop-blur md:h-[80px] md:p-2">
      <div className="mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-plant-green rounded-md p-1.5 hover:bg-gray-100 focus:ring-2 focus:ring-emerald-400 focus:outline-none lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-12 w-12" />
          </button>
          <span className="text-plant-green hidden items-center gap-2 lg:flex">
            <span className="font-zen-loop w-full text-center text-5xl text-shadow-black">
              Mood Gardens
            </span>
          </span>
        </div>
        <nav className="font-zen-loop hidden w-full flex-1 justify-between px-[10vw] lg:flex">
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
        <div className="flex justify-center items-center gap-3">
          {!authReady && <p className="text-sm text-gray-600">Signing in...</p>}
          {user && authReady && (
            <div className="flex-col items-center">
              <div className="block text-center">
                <p className="max-w-[160px] truncate">{user.email}</p>
              </div>
              <SignOutButton />
            </div>
          )}
          {!user && (
            <GenericButton>
              <NavLink to="/#login" end>
                Sign in
              </NavLink>
            </GenericButton>
          )}
        </div>
      </div>
    </header>
  );
}
