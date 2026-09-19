"use client";

import React, { useState } from "react";
import { Users, Search, ShieldCheck, Ban, CheckCircle2, AlertCircle } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleAction = async (targetUserId: string, action: string, role?: string) => {
    setUpdatingId(targetUserId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action, role }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUsers(users.map((u) => (u.id === targetUserId ? { ...u, ...data.user } : u)));
      }
    } catch {
      alert("Failed to update user status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500">
            Control member privileges, verify accounts, assign roles, and handle suspensions.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, username..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {u.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900">{u.displayName}</span>
                          {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand" />}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          @{u.username} &bull; {u.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleAction(u.id, "CHANGE_ROLE", e.target.value)}
                      disabled={updatingId === u.id}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold bg-white"
                    >
                      <option value="USER">USER</option>
                      <option value="CREATOR">CREATOR</option>
                      <option value="PROVIDER">PROVIDER</option>
                      <option value="AFFILIATE">AFFILIATE</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </td>

                  <td className="py-3 px-4">
                    {u.isBanned ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                        Active
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-400">{timeAgo(u.createdAt)}</td>

                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleAction(u.id, u.isVerified ? "UNVERIFY" : "VERIFY")}
                      disabled={updatingId === u.id}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px]"
                    >
                      {u.isVerified ? "Unverify" : "Verify Badge"}
                    </button>

                    <button
                      onClick={() => handleAction(u.id, u.isBanned ? "UNBAN" : "BAN")}
                      disabled={updatingId === u.id}
                      className={`px-2.5 py-1 font-semibold rounded-lg text-[11px] ${
                        u.isBanned
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {u.isBanned ? "Lift Ban" : "Suspend User"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
