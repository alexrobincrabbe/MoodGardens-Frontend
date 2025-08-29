import { Outlet, NavLink } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b bg-white">
        <nav className="mx-auto max-w-5xl flex items-center gap-4 p-4">
          <span className="font-bold">🌱 Mood Gardens</span>
          <NavLink to="/" className="text-sm" end>Home</NavLink>
          <NavLink to="/today" className="text-sm">Today</NavLink>
          <NavLink to="/gardens" className="text-sm">Gardens</NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
