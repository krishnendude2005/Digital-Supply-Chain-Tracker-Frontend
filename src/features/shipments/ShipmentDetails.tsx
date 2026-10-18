import React from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../lib/api-client";
import { useAuth } from "../auth/AuthContext";
import { RouteBeacon } from "./RouteBeacon";
import type { ItemStatus } from "../../types";

interface ShellContext {
  openDrawer: (kind: "shipment" | "item" | "user" | "assign" | "status" | "checkpoint", dataId?: string) => void;
}

export const ShipmentDetails: React.FC = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const { user } = useAuth();
  const { openDrawer } = useOutletContext<ShellContext>();

  // Fetch Shipment Details
  const { data: shipment, isLoading: isLoadingShipment, error } = useQuery({
    queryKey: ["shipment", shipmentId],
    queryFn: () => {
      // Find single shipment from list
      return apiService.getShipments().then(list => {
        const found = list.find(s => s.shipmentId === shipmentId);
        if (!found) throw new Error("Shipment not found");
        return found;
      });
    },
    enabled: !!shipmentId,
  });

  // Fetch Checkpoints for this shipment
  const { data: checkpoints = [], isLoading: isLoadingCheckpoints } = useQuery({
    queryKey: ["checkpoints", shipmentId],
    queryFn: () => apiService.getShipmentCheckpoints(shipmentId || ""),
    enabled: !!shipmentId,
  });

  // Fetch Alerts for this shipment
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts", shipmentId],
    queryFn: () => apiService.getShipmentAlerts(shipmentId || ""),
    enabled: !!shipmentId,
  });

  if (isLoadingShipment) {
    return (
      <div className="page py-20 flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-text-secondary font-data-mono">Decrypting shipment signal...</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="page py-20 text-center text-status-delayed font-data-mono">
        Error: Could not resolve shipment tracking log for ID: {shipmentId}.
      </div>
    );
  }

  const checkpointStatusClasses: Record<ItemStatus, string> = {
    IN_TRANSIT: "text-secondary border-secondary/20 bg-secondary/5",
    DELIVERED: "text-status-delivered border-status-delivered/20 bg-status-delivered/5",
    RECEIVED: "text-status-delivered border-status-delivered/20 bg-status-delivered/5",
    DAMAGED: "text-status-delayed border-status-delayed/20 bg-status-delayed/5",
    MISSING: "text-status-delayed border-status-delayed/20 bg-status-delayed/5",
  };

  const checkpointIcons: Record<ItemStatus, string> = {
    IN_TRANSIT: "local_shipping",
    DELIVERED: "sports_score",
    RECEIVED: "verified",
    DAMAGED: "broken_image",
    MISSING: "event_busy",
  };

  return (
    <div className="page space-y-gutter">
      {/* Back navigation */}
      <div className="mb-4">
        <Link 
          to="/shipments"
          className="text-secondary text-[12.5px] font-medium hover:underline flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Shipments list
        </Link>
      </div>

      {/* Title block */}
      <div className="page-head flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-data-mono text-[22px] font-bold text-text-primary">{shipment.shipmentId}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border uppercase tracking-wider ${
              shipment.currentStatus === "DELIVERED"
                ? "bg-status-delivered/10 text-status-delivered border-status-delivered/20"
                : shipment.currentStatus === "DELAYED"
                ? "bg-status-delayed/10 text-[#FB6B6B] border-status-delayed/20"
                : "bg-secondary/10 text-secondary border-secondary/20"
            }`}>
              {shipment.currentStatus}
            </span>
          </div>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Origin: {shipment.fromLocation} → Destination: {shipment.toLocation}
          </p>
        </div>

        {/* Action Panel */}
        <div className="flex gap-2">
          {/* If unassigned and admin/manager */}
          {!shipment.transporterEmail && (user?.role === "ADMIN" || user?.role === "WAREHOUSE_MANAGER") && (
            <button
              onClick={() => openDrawer("assign", shipment.shipmentId)}
              className="btn btn-primary bg-primary text-[#1A1300] px-4 py-2 rounded text-button font-button shadow-[0_4px_12px_rgba(255,180,84,0.35)] hover:brightness-105 transition-all"
            >
              Assign Transporter
            </button>
          )}

          {/* Transporter controls */}
          {user?.role === "TRANSPORTER" && shipment.transporterEmail?.toLowerCase() === user.email.toLowerCase() && (
            <>
              <button
                onClick={() => openDrawer("status", shipment.shipmentId)}
                className="btn btn-ghost border border-border-subtle text-text-secondary px-4 py-2 rounded text-button font-button hover:text-text-primary hover:border-border-strong transition-all"
              >
                Set Status
              </button>
              <button
                onClick={() => openDrawer("checkpoint", shipment.shipmentId)}
                className="btn btn-primary bg-gradient-to-b from-[#FFC576] to-primary text-[#1A1300] px-4 py-2 rounded text-button font-button shadow-[0_4px_12px_rgba(255,180,84,0.35)] hover:brightness-105 transition-all"
              >
                + Log Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerts center if active */}
      {alerts.filter(a => !a.resolved).map((alert) => (
        <div 
          key={alert.alertId}
          className="bg-red-500/10 border border-red-500/30 text-status-delayed rounded-lg p-4 flex gap-3 items-start"
        >
          <span className="material-symbols-outlined text-[20px] mt-0.5">error</span>
          <div>
            <h4 className="font-semibold text-[13.5px]">Critical Alert: {alert.type} status reported</h4>
            <p className="text-[12.5px] text-text-secondary mt-1">{alert.message}</p>
          </div>
        </div>
      ))}

      {/* Signature Route Beacon */}
      <RouteBeacon shipment={shipment} checkpoints={checkpoints} />

      {/* Bottom Grid: Parameters & Checkpoint Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Shipment parameters card (4 Cols) */}
        <div className="lg:col-span-4 bg-[#131519] border border-border-subtle rounded-xl p-5 space-y-6 self-start">
          <h3 className="font-card-h2 text-[15.5px] text-text-primary font-semibold">Manifest Parameters</h3>
          
          <div className="space-y-4 text-[13px] border-t border-border-subtle/50 pt-5">
            <div>
              <span className="text-text-tertiary block font-label-eyebrow text-[10px] uppercase">Carried Goods SKU</span>
              <Link 
                to={`/items/${shipment.item.itemId}`}
                className="text-secondary hover:underline mt-1 block font-medium"
              >
                {shipment.item.name}
              </Link>
              <span className="text-text-secondary mt-0.5 block font-data-mono text-[11px]">SKU ID: {shipment.item.itemId}</span>
            </div>

            <div>
              <span className="text-text-tertiary block font-label-eyebrow text-[10px] uppercase">Transporter Assigned</span>
              {shipment.transporterName ? (
                <div className="mt-1">
                  <span className="text-text-primary block font-medium">{shipment.transporterName}</span>
                  <span className="text-text-secondary block font-data-mono text-[11px]">{shipment.transporterEmail}</span>
                </div>
              ) : (
                <span className="text-text-tertiary italic mt-1 block">Unassigned</span>
              )}
            </div>

            <div>
              <span className="text-text-tertiary block font-label-eyebrow text-[10px] uppercase">Route Schedule</span>
              <div className="grid grid-cols-2 gap-2 mt-2 font-data-mono text-[11.5px] text-text-secondary">
                <div>
                  <span className="text-text-tertiary block text-[9.5px] font-sans">DISPATCH</span>
                  {new Date(shipment.shipmentStartDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                </div>
                <div>
                  <span className="text-text-tertiary block text-[9.5px] font-sans">EST. DELIVERY</span>
                  {new Date(shipment.shipmentExpectedDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkpoint Timeline (8 Cols) */}
        <div className="lg:col-span-8 bg-[#131519] border border-border-subtle rounded-xl overflow-hidden shadow-sm">
          <div className="panel-head px-6 py-4 border-b border-border-subtle bg-[#1b1b1f]/30">
            <h3 className="font-card-h2 text-[15.5px] text-text-primary">Chronological Transit History</h3>
            <p className="text-text-tertiary text-[12px]">Physical log nodes synchronized from transporter telemetry</p>
          </div>

          <div className="p-6">
            {isLoadingCheckpoints ? (
              <div className="py-8 text-center">
                <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : checkpoints.length === 0 ? (
              <div className="py-8 text-center text-text-tertiary font-data-mono text-[12.5px]">
                No physical stop logs recorded on route.
              </div>
            ) : (
              <div className="relative border-l border-border-strong pl-6 ml-2 space-y-6">
                {checkpoints.map((cp) => (
                  <div key={cp.checkpointId} className="relative group">
                    {/* Circle Node Pin */}
                    <div className="absolute -left-[30px] top-1.5 w-4 h-4 bg-background border border-border-strong rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-bg-elevated/40 border border-border-subtle rounded-lg">
                      <div>
                        <h4 className="text-[13.5px] font-semibold text-text-primary">{cp.location}</h4>
                        <p className="text-[10px] text-text-tertiary font-data-mono mt-1">LOG ID: {cp.checkpointId}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium font-data-mono uppercase ${checkpointStatusClasses[cp.itemStatus] || ""}`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {checkpointIcons[cp.itemStatus] || "circle"}
                          </span>
                          {cp.itemStatus}
                        </span>

                        <span className="text-[11.5px] text-text-tertiary font-data-mono">
                          {new Date(cp.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
