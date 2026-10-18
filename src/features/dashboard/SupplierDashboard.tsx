import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../lib/api-client";
import { useAuth } from "../auth/AuthContext";

interface SupplierDashboardProps {
  onOpenDrawer: (kind: "shipment" | "item") => void;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ onOpenDrawer }) => {
  const { user } = useAuth();

  // Queries
  const { data: shipments = [], isLoading: isLoadingShipments } = useQuery({
    queryKey: ["shipments"],
    queryFn: apiService.getShipments,
  });

  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["items"],
    queryFn: apiService.getItems,
  });

  if (!user) return null;

  // Filter based on supplier email
  const supplierItems = items.filter(i => i.supplierEmail.toLowerCase() === user.email.toLowerCase());
  const supplierShipments = shipments.filter(s => s.item.supplierEmail.toLowerCase() === user.email.toLowerCase());

  const activeShipments = supplierShipments.filter(s => s.currentStatus === "IN_TRANSIT" || s.currentStatus === "CREATED").length;
  const delayedShipments = supplierShipments.filter(s => s.currentStatus === "DELAYED").length;
  const deliveredShipments = supplierShipments.filter(s => s.currentStatus === "DELIVERED").length;

  return (
    <div className="page space-y-gutter">
      {/* Page Title Header */}
      <div className="page-head flex items-end justify-between mb-6">
        <div>
          <h1 className="font-page-h1 text-page-h1 text-text-primary">Supplier Operations</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Supplier dispatch board · {supplierShipments.length} outgoing shipments logged
          </p>
        </div>
        <div className="head-actions flex gap-3">
          <button 
            onClick={() => onOpenDrawer("item")}
            className="btn btn-ghost border border-border-subtle bg-transparent px-4 py-2 rounded text-text-secondary hover:text-text-primary hover:border-border-strong text-button font-button transition-all"
          >
            + Create item catalog
          </button>
          <button 
            onClick={() => onOpenDrawer("shipment")}
            className="btn btn-primary bg-gradient-to-b from-[#FFC576] to-primary text-[#1A1300] px-4 py-2 rounded text-button font-button shadow-[0_4px_12px_rgba(255,180,84,0.35)] hover:brightness-105 transition-all"
          >
            + Dispatch Shipment
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-secondary/30 transition-colors" style={{ "--glow": "rgba(79,209,232,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">inventory_2</span>
            Our Catalog Items
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">
            {isLoadingItems ? "..." : supplierItems.length}
          </div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-text-tertiary">Registered catalog assets</div>
        </div>

        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-secondary/30 transition-colors" style={{ "--glow": "rgba(79,209,232,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">local_shipping</span>
            In Transit Dispatch
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">{activeShipments}</div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-status-delivered">Heading to destinations</div>
        </div>

        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-status-delayed/30 transition-colors" style={{ "--glow": "rgba(248,113,113,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-status-delayed">error_outline</span>
            Delayed Dispatch
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">{delayedShipments}</div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-[#FB6B6B]">Requires attention</div>
        </div>

        <div className="kpi-card bg-surface border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-status-delivered/30 transition-colors" style={{ "--glow": "rgba(52,211,153,0.12)" } as any}>
          <div className="label text-[12px] text-text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-status-delivered">check_circle</span>
            Delivered Fulfilled
          </div>
          <div className="value font-panel-h3 text-[30px] font-bold text-text-primary mt-2">{deliveredShipments}</div>
          <div className="delta text-[11.5px] mt-2 font-data-mono text-status-delivered">Successful handovers</div>
        </div>
      </div>

      {/* Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Outgoing Shipments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="panel bg-[#131519] border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <div className="panel-head px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-[#1b1b1f]/30">
              <div>
                <h3 className="font-card-h2 text-[16px] text-text-primary">Our Outgoing Shipments</h3>
                <p className="text-text-tertiary text-[12px]">Status of our items currently moving on the grid</p>
              </div>
              <Link to="/shipments" className="text-secondary text-[12.5px] font-medium hover:underline">
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              {isLoadingShipments ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : supplierShipments.length === 0 ? (
                <div className="py-12 text-center text-text-tertiary font-data-mono text-[13px]">
                  No shipments logged yet. Click "Dispatch Shipment" to begin tracking.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle font-label-eyebrow text-[10px]">
                      <th className="px-6 py-3.5">Shipment ID</th>
                      <th className="px-6 py-3.5">Destination</th>
                      <th className="px-6 py-3.5">Transporter</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/40">
                    {supplierShipments.map((shipment) => (
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
                          <div>{shipment.toLocation}</div>
                          <div className="text-[10px] text-text-tertiary mt-0.5">From: {shipment.fromLocation}</div>
                        </td>
                        <td className="px-6 py-4 text-[12.5px] text-text-secondary">
                          {shipment.transporterName || <span className="text-text-tertiary italic">Unassigned</span>}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Our Items Inventory Panel */}
        <div className="space-y-6">
          <div className="panel bg-[#131519] border border-border-subtle rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-card-h2 text-[16px] text-text-primary">Catalog Goods</h3>
              <Link to="/items" className="text-secondary text-[12.5px] font-medium hover:underline">
                Catalog →
              </Link>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {isLoadingItems ? (
                <div className="text-center py-4">
                  <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : supplierItems.length === 0 ? (
                <p className="text-[12px] text-text-tertiary italic">No catalog goods registered.</p>
              ) : (
                supplierItems.map((item) => (
                  <div key={item.itemId} className="p-3 bg-bg-elevated rounded border border-border-subtle/50 flex justify-between items-center">
                    <div>
                      <h4 className="text-[13px] font-semibold text-text-primary leading-tight">{item.name}</h4>
                      <p className="text-[11px] text-text-tertiary mt-1 font-data-mono">Category: {item.category}</p>
                    </div>
                    <span className="material-symbols-outlined text-text-tertiary text-[18px]">inventory</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick instructions widget */}
          <div className="bg-gradient-to-br from-surface to-surface-container-low border border-border-subtle rounded-xl p-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 blur-[40px] rounded-full"></div>
            <h4 className="font-label-eyebrow text-text-tertiary text-[10.5px] uppercase tracking-wider mb-2">Instructions</h4>
            <p className="text-[12.5px] text-text-secondary leading-relaxed">
              Dispatched shipments are monitored by active checkpoints. Assign transporters immediately to prevent shipping latency alerts.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
