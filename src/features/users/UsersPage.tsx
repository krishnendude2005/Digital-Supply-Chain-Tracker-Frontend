import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../lib/api-client";
import { useOutletContext } from "react-router-dom";
import type { Role } from "../../types";

interface ShellContext {
  openDrawer: (kind: "shipment" | "item" | "user" | "assign" | "status" | "checkpoint", dataId?: string) => void;
}

export const UsersPage: React.FC = () => {
  const { openDrawer } = useOutletContext<ShellContext>();

  // Fetch users query
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: apiService.getUsers,
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const roleBadgeClasses: Record<Role, string> = {
    ADMIN: "bg-status-delayed/10 border-status-delayed/30 text-[#FB6B6B]",
    WAREHOUSE_MANAGER: "bg-primary/10 border-primary/30 text-primary",
    SUPPLIER: "bg-tertiary/10 border-tertiary/30 text-[#cbb9ff]",
    TRANSPORTER: "bg-secondary/10 border-secondary/30 text-secondary"
  };

  return (
    <div className="page space-y-gutter">
      {/* Head */}
      <div className="page-head flex items-end justify-between mb-6">
        <div>
          <h1 className="font-page-h1 text-page-h1 text-text-primary font-semibold">Users &amp; Roles</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Manage authenticated team workspaces, operational roles, and credential parameters.
          </p>
        </div>
        <button
          onClick={() => openDrawer("user")}
          className="btn btn-primary bg-gradient-to-b from-[#FFC576] to-primary text-[#1A1300] px-4 py-2 rounded text-button font-button shadow-[0_4px_12px_rgba(255,180,84,0.35)] hover:brightness-105 transition-all"
        >
          + Register User
        </button>
      </div>

      {/* Main Table */}
      <div className="panel bg-[#131519] border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-status-delayed font-data-mono">
            Error loading user directory stream.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle font-label-eyebrow text-[10px]">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role System</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {users.map((account) => (
                  <tr key={account.userId} className="hover:bg-bg-elevated/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[14px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary/40 to-primary/45 border border-border-subtle flex items-center justify-center text-[11px] font-bold text-text-primary">
                          {getInitials(account.name)}
                        </div>
                        <div>
                          <p className="text-text-primary text-[13.5px] leading-tight">{account.name}</p>
                          <p className="text-[10px] text-text-tertiary font-data-mono mt-1">ID: {account.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13.5px] text-text-secondary font-data-mono">
                      {account.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wider font-data-mono ${roleBadgeClasses[account.role] || ""}`}>
                        {account.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[12.5px] text-text-tertiary font-data-mono">
                      {new Date(account.createdAt).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDrawer("assign", account.email)} // We reuse assignment overlay or role modifications
                        className="btn btn-subtle bg-bg-elevated-2 border border-border-strong text-text-primary text-[12px] px-3 py-1 rounded hover:bg-surface-container transition-all"
                      >
                        Change role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
