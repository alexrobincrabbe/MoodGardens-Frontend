import { useAuthData } from "../hooks";
import { SignOutButton } from "../components";
import { Menu } from "lucide-react";
import logo from "../assets/images/mg-logo.png";

type TopBarProps = {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function TopBar({ setSidebarOpen }: TopBarProps) {
  const { user, authReady } = useAuthData();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur md:h-[72px] md:p-2">
      <div className="mx-auto flex items-center justify-between">
        {/* Left: logo + burger (burger only on mobile) */}
        <div className="flex items-center">
          {/* Burger: mobile only */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-emerald-400 focus:outline-none md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-12 w-12" />
          </button>
          <span className="hidden items-center gap-2 font-bold text-emerald-800 md:flex">
            <img src={logo} className="h-12"></img>
            <span className="w-full text-center text-3xl">Mood Gardens</span>
          </span>
        </div>

        {/* Right: auth state + logout, always in top bar */}
        <div className="flex items-center gap-3">
          {!authReady && <p className="text-sm text-gray-600">Signing in...</p>}

          {user && authReady && (
            <div className="flex-col items-center">
              <div className="block text-center">
                <p className="max-w-[160px] truncate text-sm font-medium">
                  {user.email}
                </p>
              </div>
              <SignOutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
