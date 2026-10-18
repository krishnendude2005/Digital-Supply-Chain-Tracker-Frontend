import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../lib/api-client";
import { useAuth } from "../auth/AuthContext";

interface TransporterDashboardProps {
  onOpenDrawer: (kind: "status" | "checkpoint") => void;
}

export const TransporterDashboard: React.FC<TransporterDashboardProps> = ({ onOpenDrawer }) => {
  const { user } = useAuth();

  // Queries
  const { data: shipments = [], isLoading: isLoadingShipments } = useQuery({
    queryKey: ["shipments"],
    queryFn: apiService.getShipments,
  });

  if (!user) return null;

  // Filter based on transporter email
  const transporterShipments = shipments.filter(
    s => s.transporterEmail?.toLowerCase() === user.email.toLowerCase()
  );

  const activeShipments = transporterShipments.filter(s => s.currentStatus === "IN_TRANSIT" || s.currentStatus === "CREATED").length;
  const delayedShipments = transporterShipments.filter(s => s.currentStatus === "DELAYED").length;
  const deliveredShipments = transporterShipments.filter(s => s.currentStatus === "DELIVERED").length;

  return (
    <div className="page space-y-gutter">
      {/* Page Title Header */}
      <div className="page-head flex items-end justify-between mb-6">
        <div>
          <h1 className="font-page-h1 text-page-h1 text-text-primary">Execution Center</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Dispatch execution console · {transporterShipments.length} assigned routes in our manifest
          </p>
        </div>
        <div className="head-actions flex gap-3">
          <button 
            onClick={() => onOpenDrawer("status")}
            className="btn btn-ghost border border-border-subtle bg-transparent px-4 py-2 rounded text-text-secondary hover:text-text-primary hover:border-border-strong text-button font-button transition-all"
          >
            Update shipment status
          </button>
          <button 
            onClick={() => onOpenDrawer("checkpoint")}
            className="btn btn-primary bg-gradient-to-b from-[#FFC576] to-primary text-[#1A1300] px-4 py-2 rounded text-button font-button shadow-[0_4px_12px_rgba(255,180,84,0.35)] hover:brightness-105 transition-all"
          >
            + Log Checkpoint
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-secondary/30 transition-colors" style={{ "--glow": "rgba(79,209,232,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">assignment_ind</span>
            Total Assigned Manifest
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">{transporterShipments.length}</div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-text-tertiary">Incoming + active cargo routes</div>
        </div>

        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-secondary/30 transition-colors" style={{ "--glow": "rgba(79,209,232,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">local_shipping</span>
            Active Logged Routes
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">{activeShipments}</div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-status-delivered">Currently moving on road</div>
        </div>

        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-status-delayed/30 transition-colors" style={{ "--glow": "rgba(248,113,113,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-status-delayed">warning</span>
            Active Delays
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">{delayedShipments}</div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-[#FB6B6B]">Requiring re-routing</div>
        </div>

        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-status-delivered/30 transition-colors" style={{ "--glow": "rgba(52,211,153,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-status-delivered">task_alt</span>
            Delivered Handovers
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">{deliveredShipments}</div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-status-delivered">Confirmed handovers</div>
        </div>
      </div>

      {/* Manifest Tables */}
      <div className="grid grid-cols-1 gap-gutter">
        <div className="panel bg-[#131519] border border-border-subtle rounded-xl shadow-sm overflow-hidden">
          <div className="panel-head px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-[#1b1b1f]/30">
            <div>
              <h3 className="font-card-h2 text-[16px] text-text-primary">Our Dispatch Manifest</h3>
              <p className="text-text-tertiary text-[12px]">Cargo units specifically assigned to our operations team</p>
            </div>
            <Link to="/shipments" className="text-secondary text-[12.5px] font-medium hover:underline">
              Shipments Manifest →
            </Link>
          </div>

          <div className="overflow-x-auto">
            {isLoadingShipments ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : transporterShipments.length === 0 ? (
              <div className="py-12 text-center text-text-tertiary font-data-mono text-[13px]">
                No cargo routes assigned to your account in current manifest.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle font-label-eyebrow text-[10px]">
                    <th className="px-6 py-3.5">Shipment ID</th>
                    <th className="px-6 py-3.5">Origin → Destination</th>
                    <th className="px-6 py-3.5">Expected Delivery Date</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40">
                  {transporterShipments.map((shipment) => (
                    <tr 
                      key={shipment.shipmentId}
                      className="hover:bg-bg-elevated/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link to={`/shipments/${shipment.shipmentId}`} className="font-data-mono text-text-primary hover:text-secondary hover:underline">
                          {shipment.shipmentId}
                        </Link>
                        <div className="text-[11px] text-text-tertiary mt-0.5">{shipment.item.name}</div>
                      </td>
                      <td className="px-6 py-4 text-[12.5px] text-text-secondary">
                        {shipment.fromLocation} <span className="text-text-tertiary">→</span> {shipment.toLocation}
                      </td>
                      <td className="px-6 py-4 font-data-mono text-[12.5px] text-text-secondary">
                        {new Date(shipment.shipmentExpectedDate).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          shipment.currentStatus === "DELIVERED"
                            ? "bg-status-delivered/10 text-status-delivered border-status-delivered/20"
                            : shipment.currentStatus === "DELAYED"
                            ? "bg-status-delayed/10 text-[#FB6B6B] border-status-delayed/20"
                            : "bg-secondary/10 text-secondary border-secondary/20"
                        }`}>
                          {shipment.currentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/shipments/${shipment.shipmentId}`} className="btn btn-ghost border border-border-subtle text-[11.5px] px-3 py-1 rounded hover:text-text-primary transition-all">
                          Manage Route
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
