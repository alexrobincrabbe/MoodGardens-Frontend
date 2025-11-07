import { NavLink } from "react-router-dom";
import { type LinkClasses } from "../types";

type DesktopSidebarProps = {
    className: string;
  linkClasses: LinkClasses;
};

export function DesktopSidebar({ className, linkClasses }: DesktopSidebarProps) {
  return (
    <aside className={`sticky top-[72px] hidden h-[calc(100vh-72px)] w-52 shrink-0 border-r border-soft-luminous-gold p-4 md:block ` + className}>
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
  );
}
