"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ShoppingBag,
  Briefcase,
  Share2,
  User,
  ArrowLeft,
  Video,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProviders";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, settings } = useApp();

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Wallet & Ledger", href: "/dashboard/wallet", icon: Wallet },
    { label: "Bookings & Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { label: "My Services", href: "/dashboard/services", icon: Briefcase },
    { label: "Affiliates & Referrals", href: "/dashboard/affiliates", icon: Share2 },
    { label: "Profile Settings", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100/70">
      {/* Dashboard Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-black">
              U
            </div>
            <span className="font-extrabold text-sm text-slate-900 truncate">
              {settings.app_name || "Umuguzipro"}
            </span>
          </Link>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user.displayName?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user.displayName}</p>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-brand text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Studio & Site links */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Link
            href="/studio"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-brand text-white text-xs font-bold transition-colors"
          >
            <Video className="w-4 h-4" />
            <span>Open Creator Studio</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand transition-colors pt-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between md:hidden">
          <Link href="/dashboard" className="font-extrabold text-slate-900">
            Dashboard
          </Link>
          <Link href="/" className="text-xs font-semibold text-brand">
            Home
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
