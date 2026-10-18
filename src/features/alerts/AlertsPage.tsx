import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../../lib/api-client";
import { useAuth } from "../auth/AuthContext";
import { toast } from "sonner";
import type { AlertType } from "../../types";

export const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"ALL" | AlertType | "RESOLVED">("ALL");

  // Fetch Alerts Query
  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiService.getAlerts(),
  });

  // Resolve Alert Mutation
  const resolveMutation = useMutation({
    mutationFn: apiService.resolveAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alert resolved successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resolve alert");
    }
  });

  if (!user) return null;

  // Filter alerts based on selected tab
  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "ALL") return !alert.resolved;
    if (activeTab === "RESOLVED") return alert.resolved;
    return alert.type === activeTab && !alert.resolved;
  });

  const tabCount = (status: "ALL" | AlertType | "RESOLVED") => {
    if (status === "ALL") return alerts.filter(a => !a.resolved).length;
    if (status === "RESOLVED") return alerts.filter(a => a.resolved).length;
    return alerts.filter(a => a.type === status && !a.resolved).length;
  };

  return (
    <div className="page space-y-gutter">
      {/* Head */}
      <div className="page-head flex items-end justify-between mb-6">
        <div>
          <h1 className="font-page-h1 text-page-h1 text-text-primary font-semibold">Incident Alerts</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Real-time warnings, shipment latency, and transit damage alerts recorded on the grid.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle w-full mb-4">
        {(["ALL", "DELAYED", "DAMAGED", "RESOLVED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-all ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab === "ALL" ? "Active Alerts" : tab.replace("_", " ")}
            <span className="ml-1.5 text-[10.5px] font-data-mono opacity-60">
              ({tabCount(tab)})
            </span>
          </button>
        ))}
      </div>

      {/* Alerts Table Panel */}
      <div className="panel bg-[#131519] border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-status-delayed font-data-mono">
            Error loading incident logs stream.
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-20 text-center text-text-tertiary font-data-mono text-[13px]">
            No logged warnings found for this category. All clear.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle font-label-eyebrow text-[10px]">
                  <th className="px-6 py-4">Alert Details</th>
                  <th className="px-6 py-4">Warning Type</th>
                  <th className="px-6 py-4">Shipment Link</th>
                  <th className="px-6 py-4">Date Logged</th>
                  {user.role !== "TRANSPORTER" && (
                    <th className="px-6 py-4 text-right">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.alertId} className="hover:bg-bg-elevated/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[13.5px]">
                      <div className="flex items-start gap-3">
                        <span className={`material-symbols-outlined text-[20px] ${
                          alert.type === "DAMAGED" ? "text-status-delayed" : "text-primary"
                        }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                          {alert.type === "DAMAGED" ? "error" : "warning"}
                        </span>
                        <div>
                          <p className="text-text-primary leading-tight font-medium">{alert.message}</p>
                          <p className="text-[10px] text-text-tertiary font-data-mono mt-1">ID: {alert.alertId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wider font-data-mono ${
                        alert.type === "DAMAGED"
                          ? "bg-status-delayed/10 border-status-delayed/30 text-[#FB6B6B]"
                          : "bg-primary/10 border-primary/30 text-primary"
                      }`}>
                        {alert.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-data-mono text-[13px]">
                      <Link to={`/shipments/${alert.shipmentId}`} className="text-secondary hover:underline font-semibold">
                        {alert.shipmentId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-text-tertiary font-data-mono">
                      {new Date(alert.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    {!alert.resolved && user.role !== "TRANSPORTER" && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => resolveMutation.mutate(alert.alertId)}
                          className="btn btn-ghost border border-border-subtle text-[11px] px-3 py-1.5 rounded text-primary hover:text-text-primary hover:border-border-strong hover:bg-primary/5 transition-all uppercase tracking-wider font-bold"
                        >
                          Resolve
                        </button>
                      </td>
                    )}
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
