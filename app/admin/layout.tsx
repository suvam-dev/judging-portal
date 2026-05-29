"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Clock,
  FileCheck2,
  Link as LinkIcon,
  Trophy,
  Download,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logoutAdmin } from "./actions";

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Teams", href: "/admin/teams", icon: Users },
  { name: "Judges", href: "/admin/judges", icon: ShieldCheck },
  { name: "Rounds", href: "/admin/rounds", icon: Clock },
  { name: "Rubric", href: "/admin/rubric", icon: FileCheck2 },
  { name: "Assignments", href: "/admin/assignments", icon: LinkIcon },
  { name: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  { name: "Exports", href: "/admin/exports", icon: Download },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white shadow-sm z-20 relative">
        <Image
          src="/empresario.png"
          alt="Empresario"
          width={500}
          height={195}
          priority
          className="h-8 w-auto"
        />
        <button onClick={toggleSidebar} className="p-2 -mr-2 text-slate-600 hover:text-slate-900 focus:outline-none">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Premium Sidebar */}
      <aside 
        className={`fixed md:relative z-40 inset-y-0 left-0 w-72 flex flex-col border-r border-slate-200 bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        
        {/* Logo Section */}
        <div className="p-8 flex-col items-start gap-2 hidden md:flex">
          <Image
            src="/empresario.png"
            alt="Empresario"
            width={500}
            height={195}
            priority
            className="h-10 w-auto"
          />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mt-2">
            Control Panel
          </span>
        </div>

        {/* Mobile Sidebar Header */}
        <div className="p-6 flex items-center justify-between md:hidden border-b border-slate-200">
           <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900">Admin</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Control Panel
              </span>
           </div>
           <button onClick={toggleSidebar} className="text-slate-500 hover:text-slate-900">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6 mt-4 md:mt-0">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 mt-2">
            Management
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-md text-sm font-medium transition-colors relative ${
                  isActive 
                    ? "text-blue-800 bg-blue-50 border border-blue-100" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-800 rounded-r-md" />
                )}
                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-blue-800" : "text-slate-400 group-hover:text-slate-600"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile / Logout */}
        <div className="p-4 border-t border-slate-200">
          <form action={logoutAdmin}>
            <button className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar w-full relative">
        <div className="min-h-full p-4 sm:p-6 md:p-8 lg:p-12 pb-24 md:pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
