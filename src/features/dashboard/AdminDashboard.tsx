import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../../lib/api-client";
import { toast } from "sonner";

interface AdminDashboardProps {
  onOpenDrawer: (kind: "shipment" | "item" | "user" | "assign" | "status" | "checkpoint") => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenDrawer }) => {
  const queryClient = useQueryClient();

  // Queries
  const { data: shipments = [], isLoading: isLoadingShipments } = useQuery({
    queryKey: ["shipments"],
    queryFn: apiService.getShipments,
  });

  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiService.getAlerts(),
  });

  // Mutations
  const resolveAlertMutation = useMutation({
    mutationFn: apiService.resolveAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alert marked as resolved");
    },
  });

  // Calculations
  const activeShipments = shipments.filter(s => s.currentStatus === "IN_TRANSIT" || s.currentStatus === "CREATED").length;
  const delayedShipments = shipments.filter(s => s.currentStatus === "DELAYED").length;
  const deliveredShipments = shipments.filter(s => s.currentStatus === "DELIVERED").length;
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="page space-y-gutter">
      {/* Page Title Header */}
      <div className="page-head flex items-end justify-between mb-6">
        <div>
          <h1 className="font-page-h1 text-page-h1 text-text-primary">Control Center</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Global tracking overview · {shipments.length} logged nodes across 4 supply lines
          </p>
        </div>
        <div className="head-actions flex gap-3">
          <button 
            onClick={() => onOpenDrawer("assign")}
            className="btn btn-ghost border border-border-subtle bg-transparent px-4 py-2 rounded text-text-secondary hover:text-text-primary hover:border-border-strong text-button font-button transition-all"
          >
            Assign transporter
          </button>
          <button 
            onClick={() => onOpenDrawer("user")}
            className="btn btn-primary bg-gradient-to-b from-[#FFC576] to-primary text-[#1A1300] px-4 py-2 rounded text-button font-button shadow-[0_4px_12px_rgba(255,180,84,0.35)] hover:brightness-105 transition-all"
          >
            + Register user
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-secondary/30 transition-colors" style={{ "--glow": "rgba(79,209,232,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">local_shipping</span>
            Active Shipments
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">{activeShipments}</div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-status-delivered">▲ 12% vs last week</div>
        </div>

        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-status-delayed/30 transition-colors" style={{ "--glow": "rgba(248,113,113,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-status-delayed">schedule</span>
            Delayed Segments
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">{delayedShipments}</div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-[#FB6B6B]">▲ 3 unresolved today</div>
        </div>

        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-status-delivered/30 transition-colors" style={{ "--glow": "rgba(52,211,153,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-status-delivered">task_alt</span>
            Delivered (Total)
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">{deliveredShipments}</div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-status-delivered">▲ 6.2% month-over-month</div>
        </div>

        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors" style={{ "--glow": "rgba(255,180,84,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">warning</span>
            Active Alerts
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">{unresolvedAlerts.length}</div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-primary">{alerts.filter(a => a.type === "DAMAGED" && !a.resolved).length} critical reports</div>
        </div>
      </div>

      {/* Main Grid: Left (Tables) & Right (Sidebar widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* LEFT COLUMN: Recent Activity Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="panel bg-[#131519] border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <div className="panel-head px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-[#1b1b1f]/30">
              <div>
                <h3 className="font-card-h2 text-[16px] text-text-primary">Recent Shipment Activity</h3>
                <p className="text-text-tertiary text-[12px]">Real-time status of priority logistics nodes</p>
              </div>
              <Link to="/shipments" className="text-secondary text-[12.5px] font-medium hover:underline flex items-center gap-1">
                View all <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              {isLoadingShipments ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : shipments.length === 0 ? (
                <div className="py-12 text-center text-text-tertiary font-data-mono">
                  No active shipment records found.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle font-label-eyebrow text-[10px]">
                      <th className="px-6 py-3.5">Shipment ID</th>
                      <th className="px-6 py-3.5">Route</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Route Beacon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/40">
                    {shipments.slice(0, 4).map((shipment) => {
                      // Determine progress percentage
                      let progress = 0;
                      if (shipment.currentStatus === "DELIVERED") progress = 100;
                      else if (shipment.currentStatus === "IN_TRANSIT") progress = 62;
                      else if (shipment.currentStatus === "DELAYED") progress = 34;

                      const statusClasses: Record<string, string> = {
                        CREATED: "bg-surface-variant/20 text-text-secondary border-border-subtle/50",
                        IN_TRANSIT: "bg-secondary/10 text-secondary border-secondary/20",
                        DELAYED: "bg-status-delayed/10 text-[#FB6B6B] border-status-delayed/20",
                        DELIVERED: "bg-status-delivered/10 text-status-delivered border-status-delivered/20"
                      };

                      return (
                        <tr 
                          key={shipment.shipmentId}
                          className="hover:bg-bg-elevated/40 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <Link to={`/shipments/${shipment.shipmentId}`} className="block">
                              <span className="font-data-mono text-text-primary hover:text-secondary hover:underline">
                                {shipment.shipmentId}
                              </span>
                              <div className="text-[11px] text-text-tertiary mt-0.5 truncate max-w-[150px]">
                                {shipment.item.name}
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-[12.5px] text-text-secondary">
                            <div className="truncate max-w-[180px]">
                              {shipment.fromLocation} <span className="text-text-tertiary">→</span> {shipment.toLocation}
                            </div>
                            <div className="text-[10px] text-text-tertiary font-data-mono mt-0.5">
                              Carrier: {shipment.transporterName || "Unassigned"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusClasses[shipment.currentStatus] || ""}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                              {shipment.currentStatus.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 min-w-[140px]">
                            <div className="route-mini flex items-center gap-2">
                              <div className="track flex-1 h-1 bg-border-subtle rounded relative">
                                <div 
                                  className={`fill absolute left-0 top-0 h-full rounded bg-gradient-to-r ${
                                    shipment.currentStatus === "DELAYED"
                                      ? "from-status-delayed to-primary"
                                      : "from-secondary to-primary"
                                  }`} 
                                  style={{ width: `${progress}%` }}
                                ></div>
                                {progress > 0 && progress < 100 && (
                                  <div 
                                    className={`node absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                                      shipment.currentStatus === "DELAYED" ? "bg-status-delayed" : "bg-primary"
                                    } shadow-[0_0_8px_1px_rgba(255,180,84,0.7)]`} 
                                    style={{ left: `${progress}%` }}
                                  ></div>
                                )}
                              </div>
                              <span className="pct font-data-mono text-[11px] text-text-tertiary w-8 text-right">{progress}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Expanded Route Coverage Indicator */}
          <div className="h-[200px] rounded-xl border border-border-subtle overflow-hidden relative group">
            <div className="absolute inset-0 bg-[#131519]/40 z-10 flex flex-col justify-end p-6">
              <div className="max-w-[360px]">
                <h4 className="font-panel-h3 text-text-primary text-[14.5px] font-semibold mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">hub</span> Route Coverage
                </h4>
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  Consolidated digital logistics streams map. Live nodes are synchronizing data packets at {shipments.length} telemetry sites.
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="bg-secondary/15 text-secondary text-[10px] px-2 py-0.5 rounded font-data-mono">LAT: 13.0827</span>
                <span className="bg-secondary/15 text-secondary text-[10px] px-2 py-0.5 rounded font-data-mono">LNG: 80.2707</span>
              </div>
            </div>
            {/* Mock World Map Graphic Background */}
            <div className="absolute inset-0 z-0 bg-[#0a0b0e] flex items-center justify-center opacity-40">
              <span className="material-symbols-outlined text-[120px] text-border-strong animate-pulse">language</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Widgets (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <div className="bg-[#131519] border border-border-subtle rounded-xl p-5">
            <h3 className="font-card-h2 text-[16px] text-text-primary mb-4">Quick Operations</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onOpenDrawer("shipment")}
                className="flex flex-col items-center justify-center p-3.5 bg-bg-elevated rounded-lg border border-border-subtle hover:border-secondary transition-all group"
              >
                <span className="material-symbols-outlined text-secondary mb-1.5 group-hover:scale-105 transition-transform text-[20px]">add_box</span>
                <span className="text-[11.5px] font-medium">New Order</span>
              </button>
              <button 
                onClick={() => onOpenDrawer("item")}
                className="flex flex-col items-center justify-center p-3.5 bg-bg-elevated rounded-lg border border-border-subtle hover:border-secondary transition-all group"
              >
                <span className="material-symbols-outlined text-secondary mb-1.5 group-hover:scale-105 transition-transform text-[20px]">inventory</span>
                <span className="text-[11.5px] font-medium">+ Add Item</span>
              </button>
              <button 
                onClick={() => onOpenDrawer("checkpoint")}
                className="flex flex-col items-center justify-center p-3.5 bg-bg-elevated rounded-lg border border-border-subtle hover:border-secondary transition-all group"
              >
                <span className="material-symbols-outlined text-secondary mb-1.5 group-hover:scale-105 transition-transform text-[20px]">location_on</span>
                <span className="text-[11.5px] font-medium">+ Checkpoint</span>
              </button>
              <button 
                onClick={() => onOpenDrawer("status")}
                className="flex flex-col items-center justify-center p-3.5 bg-bg-elevated rounded-lg border border-border-subtle hover:border-secondary transition-all group"
              >
                <span className="material-symbols-outlined text-secondary mb-1.5 group-hover:scale-105 transition-transform text-[20px]">edit_note</span>
                <span className="text-[11.5px] font-medium">Set Status</span>
              </button>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-[#131519] border border-border-subtle rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border-subtle flex justify-between items-center">
              <h3 className="font-card-h2 text-[16px] text-text-primary">System Alerts</h3>
              <span className="bg-red-500/10 text-[#FB6B6B] text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 font-bold font-data-mono">
                {unresolvedAlerts.length} Active
              </span>
            </div>
            
            <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
              {isLoadingAlerts ? (
                <div className="p-4 text-center">
                  <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : unresolvedAlerts.length === 0 ? (
                <div className="py-6 text-center text-text-tertiary text-[12px] font-data-mono">
                  All systems operational.
                </div>
              ) : (
                unresolvedAlerts.map((alert) => (
                  <div 
                    key={alert.alertId}
                    className={`flex gap-3 p-3 hover:bg-bg-elevated rounded-lg transition-colors border-l-2 ${
                      alert.type === "DAMAGED" ? "border-status-delayed" : "border-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-status-delayed mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {alert.type === "DAMAGED" ? "error" : "warning"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12.5px] font-semibold text-text-primary truncate">
                        {alert.type === "DAMAGED" ? "Item Damaged Logged" : "Shipment Delay Warning"}
                      </h4>
                      <p className="text-[11px] text-text-tertiary mt-0.5 leading-normal">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => resolveAlertMutation.mutate(alert.alertId)}
                          className="text-primary text-[10px] font-bold tracking-wider hover:underline uppercase"
                        >
                          Resolve Issue
                        </button>
                        <span className="text-[10px] text-text-tertiary font-data-mono">
                          {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Node Performance indicators */}
          <div className="bg-[#131519] border border-border-subtle rounded-xl p-5">
            <h3 className="font-label-eyebrow text-text-tertiary text-[10.5px] uppercase tracking-wider mb-4">Asset Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-text-secondary">Network Saturation</span>
                  <span className="text-secondary font-data-mono">82%</span>
                </div>
                <div className="h-1.5 w-full bg-border-strong rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[82%] shadow-[0_0_8px_rgba(86,215,238,0.5)]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-text-secondary">IoT Sensor Uptime</span>
                  <span className="text-status-delivered font-data-mono">99.9%</span>
                </div>
                <div className="h-1.5 w-full bg-border-strong rounded-full overflow-hidden">
                  <div className="h-full bg-status-delivered w-[99.9%]"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border-strong/50 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-text-tertiary uppercase">Active Log Nodes</p>
                <p className="text-text-primary font-panel-h3 text-[18px] font-bold mt-0.5">{shipments.length * 3}</p>
              </div>
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary beacon-pulse rounded-full text-[18px]">wifi_tethering</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
