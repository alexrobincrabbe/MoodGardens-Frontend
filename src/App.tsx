import { Outlet, NavLink } from "react-router-dom";
import { useAuthData } from "./hooks";
import { SignOutButton } from "./components";

export default function App() {
  const { user, authReady } = useAuthData();
  return (
    <div className="min-h-screen bg-matteGold text-neutral-900">
      <header className="flex border-b bg-white flex-col md:flex-row">
        <nav className="mx-auto max-w-5xl flex items-center gap-4 p-4">
          <span className="font-bold">🌱 Mood Gardens</span>
          <NavLink to="/" className="text-sm" end>
            Home
          </NavLink>
          <NavLink to="/today" className="text-sm">
            Today
          </NavLink>
          <NavLink to="/gardens" className="text-sm">
            Gardens
          </NavLink>
        </nav>
        {!authReady && (
          <div>
            <p className="text-sm text-gray-600">Signing in...</p>
          </div>
        )}
        {user && authReady && (
            <>
          <div className="pr-10 hidden md:flex align-center justify-center  flex-col">
            <p className="text-sm text-gray-600 text-center">Signed in as</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div className="hidden md:block">
          <SignOutButton />
          </div>
          </>
        )}
      </header>
      <main className="bg-gradient-to-b from-pastel-aqua to-peach-cream mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
