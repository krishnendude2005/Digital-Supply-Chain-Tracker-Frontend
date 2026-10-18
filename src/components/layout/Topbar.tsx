import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { isMockMode, setMockMode, apiService } from "../../lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Fetch alerts for notification badge (must be before any early return)
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiService.getAlerts(),
    enabled: !!user,
  });

  const unresolvedAlerts = alerts.filter((a) => !a.resolved);
  const recentAlerts = unresolvedAlerts.slice(0, 5);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  // Resolve breadcrumbs path
  const pathParts = location.pathname.split("/").filter(Boolean);
  const currentSection =
    pathParts.length > 0
      ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1)
      : "Dashboard";

  const toggleApiMode = () => {
    const nextMock = !isMockMode();
    setMockMode(nextMock);
    toast.success(
      `Switched to ${nextMock ? "Mock local store" : "Live Spring Boot REST API"} mode!`
    );
  };

  const nameAbbreviation = user.email.substring(0, 2).toUpperCase();

  return (
    <header className="fixed top-0 right-0 left-[248px] z-40 h-16 bg-[#0a0b0e]/60 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-container-margin">
      <div className="flex items-center gap-3">
        <div className="breadcrumb text-[13px] text-text-tertiary">
          Waypoint /{" "}
          <b className="text-text-primary font-semibold">{currentSection}</b>
        </div>
        <div className="h-4 w-[1px] bg-border-strong mx-1"></div>
        <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-highest/40 rounded-full border border-border-subtle">
          <div className="w-2 h-2 rounded-full bg-status-delivered beacon-pulse"></div>
          <span className="text-[10px] font-data-mono text-text-secondary uppercase tracking-wider">
            System Live
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Toggle Mode Button (Mock vs Real API) */}
        <button
          onClick={toggleApiMode}
          title="Click to toggle between Mock Local Storage and Real Backend Endpoint modes"
          className={`flex items-center gap-1.5 px-3 py-1 rounded border text-[11px] font-data-mono transition-colors ${
            isMockMode()
              ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              : "bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/20"
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {isMockMode() ? "cloud_off" : "cloud_sync"}
          </span>
          MODE: {isMockMode() ? "MOCK" : "API"}
        </button>

        {/* Search Bar */}
        <div className="search-bar w-64 flex items-center gap-2 bg-[#131519] border border-border-subtle rounded px-3 py-1.5 text-text-tertiary text-[12.5px] cursor-text hover:border-border-strong transition-colors">
          <span className="material-symbols-outlined text-[16px]">search</span>
          <span className="truncate">Search tracking, items...</span>
          <kbd className="ml-auto font-data-mono text-[9px] border border-border-strong px-1.5 py-0.5 rounded text-text-tertiary">
            ⌘K
          </kbd>
        </div>

        {/* Icon Controls */}
        <div className="flex items-center gap-3 text-text-secondary relative">
          {/* Notification Button + Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
              className="w-9 h-9 flex items-center justify-center rounded border border-transparent hover:bg-bg-elevated hover:border-border-subtle hover:text-text-primary transition-all relative"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unresolvedAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] flex items-center justify-center bg-[#FB6B6B] rounded-full text-[8px] font-bold text-white px-1 shadow-[0_0_4px_rgba(251,107,107,0.6)]">
                  {unresolvedAlerts.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-[380px] bg-[#131519] border border-border-subtle rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                  <h3 className="text-[13.5px] font-semibold text-text-primary">Notifications</h3>
                  <span className="text-[10px] font-data-mono text-text-tertiary bg-bg-elevated px-2 py-0.5 rounded">
                    {unresolvedAlerts.length} active
                  </span>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {recentAlerts.length === 0 ? (
                    <div className="py-8 text-center text-text-tertiary text-[12.5px] font-data-mono">
                      All clear. No active alerts.
                    </div>
                  ) : (
                    recentAlerts.map((alert) => (
                      <Link
                        key={alert.alertId}
                        to={`/shipments/${alert.shipmentId}`}
                        onClick={() => setShowNotifications(false)}
                        className={`flex gap-3 px-4 py-3 hover:bg-bg-elevated/60 transition-colors border-l-2 ${
                          alert.type === "DAMAGED"
                            ? "border-status-delayed"
                            : "border-primary"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[18px] mt-0.5 ${
                            alert.type === "DAMAGED"
                              ? "text-status-delayed"
                              : "text-primary"
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {alert.type === "DAMAGED" ? "error" : "warning"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-text-primary leading-snug line-clamp-2">
                            {alert.message}
                          </p>
                          <span className="text-[10px] text-text-tertiary font-data-mono mt-1 block">
                            {alert.shipmentId} ·{" "}
                            {new Date(alert.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                {unresolvedAlerts.length > 0 && (
                  <Link
                    to="/alerts"
                    onClick={() => setShowNotifications(false)}
                    className="block px-4 py-2.5 text-center text-[12px] text-secondary font-medium border-t border-border-subtle hover:bg-bg-elevated/40 transition-colors"
                  >
                    View all alerts
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Settings Button + Dropdown */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowNotifications(false);
              }}
              className="w-9 h-9 flex items-center justify-center rounded border border-transparent hover:bg-bg-elevated hover:border-border-subtle hover:text-text-primary transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-[260px] bg-[#131519] border border-border-subtle rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border-subtle">
                  <h3 className="text-[13.5px] font-semibold text-text-primary">Settings</h3>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      toggleApiMode();
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-text-secondary hover:text-text-primary hover:bg-bg-elevated/60 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isMockMode() ? "cloud_sync" : "cloud_off"}
                    </span>
                    {isMockMode() ? "Switch to Live API" : "Switch to Mock Mode"}
                  </button>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowSettings(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-text-secondary hover:text-text-primary hover:bg-bg-elevated/60 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    Dashboard
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      to="/users"
                      onClick={() => setShowSettings(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-text-secondary hover:text-text-primary hover:bg-bg-elevated/60 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">group</span>
                      Manage Users
                    </Link>
                  )}
                </div>
                <div className="border-t border-border-subtle py-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowSettings(false);
                      toast.info("Logged out of control center");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-status-delayed hover:bg-red-500/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="avatar w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center font-bold text-background text-[11px] cursor-pointer">
          {nameAbbreviation}
        </div>
      </div>
    </header>
  );
};
