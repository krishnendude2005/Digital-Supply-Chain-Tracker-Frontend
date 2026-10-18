import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../lib/api-client";

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch counts dynamically for the badges
  const { data: shipments = [] } = useQuery({
    queryKey: ["shipments"],
    queryFn: apiService.getShipments,
    enabled: !!user,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiService.getAlerts(),
    enabled: !!user,
  });

  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: apiService.getItems,
    enabled: !!user,
  });

  if (!user) return null;

  // Filter lists based on role
  const activeShipmentsCount = user.role === "TRANSPORTER"
    ? shipments.filter(s => s.transporterEmail === user.email && s.currentStatus !== "DELIVERED").length
    : shipments.filter(s => s.currentStatus !== "DELIVERED").length;

  const unresolvedAlertsCount = user.role === "TRANSPORTER"
    ? 0 // transporters don't see active global alerts
    : alerts.filter(a => !a.resolved).length;

  const itemsCount = items.length;

  const roleLabels: Record<string, string> = {
    ADMIN: "System Admin",
    WAREHOUSE_MANAGER: "Warehouse Mgr",
    SUPPLIER: "Supplier Org",
    TRANSPORTER: "Transporter Ops",
  };

  const nameAbbreviation = user.email.substring(0, 2).toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[248px] bg-[#131519]/92 backdrop-blur-md border-r border-border-subtle flex flex-col py-panel-padding z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_14px_2px_rgba(255,180,84,0.6)]"></div>
        <div>
          <span className="font-panel-h3 text-panel-h3 text-primary uppercase tracking-widest block">Waypoint</span>
          <p className="text-[10px] font-data-mono text-text-tertiary mt-0.5">Control Network v2.4</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 overflow-y-auto">
        <div className="nav-section px-3 mb-1">
          <span className="font-data-mono text-[10px] tracking-wider text-text-tertiary uppercase">Overview</span>
        </div>
        
        <NavLink 
          to="/dashboard"
          className={({ isActive }) => 
            `nav-item flex items-center gap-3 px-3 py-2.5 rounded transition-all font-panel-h3 text-panel-h3 ${
              isActive 
                ? "bg-bg-elevated-2 text-text-primary active-accent" 
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            }`
          }
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          Dashboard
        </NavLink>

        <div className="nav-section px-3 pt-4 mb-1">
          <span className="font-data-mono text-[10px] tracking-wider text-text-tertiary uppercase">Operations</span>
        </div>

        <NavLink 
          to="/shipments"
          className={({ isActive }) => 
            `nav-item flex items-center gap-3 px-3 py-2.5 rounded transition-all font-panel-h3 text-panel-h3 ${
              isActive 
                ? "bg-bg-elevated-2 text-text-primary active-accent" 
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            }`
          }
        >
          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          Shipments 
          {activeShipmentsCount > 0 && (
            <span className="badge-count ml-auto bg-background border border-border-strong text-text-secondary text-[10.5px] px-2 py-0.5 rounded-full font-data-mono">
              {activeShipmentsCount}
            </span>
          )}
        </NavLink>

        {/* Items is visible to ADMIN, WAREHOUSE_MANAGER, SUPPLIER */}
        {user.role !== "TRANSPORTER" && (
          <NavLink 
            to="/items"
            className={({ isActive }) => 
              `nav-item flex items-center gap-3 px-3 py-2.5 rounded transition-all font-panel-h3 text-panel-h3 ${
                isActive 
                  ? "bg-bg-elevated-2 text-text-primary active-accent" 
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            Items
            {itemsCount > 0 && (
              <span className="badge-count ml-auto bg-background border border-border-strong text-text-secondary text-[10.5px] px-2 py-0.5 rounded-full font-data-mono">
                {itemsCount}
              </span>
            )}
          </NavLink>
        )}

        {/* Alerts is visible to ADMIN, WAREHOUSE_MANAGER, SUPPLIER */}
        {user.role !== "TRANSPORTER" && (
          <NavLink 
            to="/alerts"
            className={({ isActive }) => 
              `nav-item flex items-center gap-3 px-3 py-2.5 rounded transition-all font-panel-h3 text-panel-h3 ${
                isActive 
                  ? "bg-bg-elevated-2 text-text-primary active-accent" 
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Alerts
            {unresolvedAlertsCount > 0 && (
              <span className="badge-count ml-auto border border-[#FB6B6B]/40 text-[#FB6B6B] text-[10px] px-2 py-0.5 rounded-full font-bold">
                {unresolvedAlertsCount}
              </span>
            )}
          </NavLink>
        )}

        {/* Admin Section */}
        {user.role === "ADMIN" && (
          <>
            <div className="nav-section px-3 pt-4 mb-1">
              <span className="font-data-mono text-[10px] tracking-wider text-text-tertiary uppercase">Administration</span>
            </div>
            
            <NavLink 
              to="/users"
              className={({ isActive }) => 
                `nav-item flex items-center gap-3 px-3 py-2.5 rounded transition-all font-panel-h3 text-panel-h3 ${
                  isActive 
                    ? "bg-bg-elevated-2 text-text-primary active-accent" 
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              Users &amp; Roles
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-auto px-3 pt-4 border-t border-border-subtle/50 space-y-1">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-[#1b1b1f] rounded-lg border border-border-subtle/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center font-bold text-background text-[11px]">
            {nameAbbreviation}
          </div>
          <div className="overflow-hidden">
            <p className="text-[12px] font-semibold truncate text-text-primary leading-tight">
              {user.email.split("@")[0]}
            </p>
            <p className="text-[10px] text-text-tertiary truncate leading-none mt-1">
              {roleLabels[user.role]}
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 text-text-secondary hover:text-status-delayed hover:bg-red-500/10 transition-all px-3 py-2.5 rounded text-[13px] font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};
