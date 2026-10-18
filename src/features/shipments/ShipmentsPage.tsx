import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../lib/api-client";
import { useAuth } from "../auth/AuthContext";
import type { ShipmentStatus } from "../../types";

type DrawerKind = "shipment" | "item" | "user" | "assign" | "status" | "checkpoint";

interface ShellContext {
  openDrawer: (kind: DrawerKind, shipmentId?: string) => void;
}

export const ShipmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { openDrawer } = useOutletContext<ShellContext>();

  const [activeTab, setActiveTab] = useState<"ALL" | ShipmentStatus>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Shipments
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: apiService.getShipments,
  });

  if (!user) return null;

  // Filter based on role: Transporters only see their assigned shipments
  const viewableShipments = user.role === "TRANSPORTER"
    ? shipments.filter(s => s.transporterEmail?.toLowerCase() === user.email.toLowerCase())
    : shipments;

  // Filter based on tab and search
  const filteredShipments = viewableShipments.filter((s) => {
    const matchesTab = activeTab === "ALL" || s.currentStatus === activeTab;
    const matchesSearch = s.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabLabelCount = (status: "ALL" | ShipmentStatus) => {
    if (status === "ALL") return viewableShipments.length;
    return viewableShipments.filter((s) => s.currentStatus === status).length;
  };

  return (
    <div className="page space-y-gutter">
      {/* Head */}
      <div className="page-head flex items-end justify-between mb-6">
        <div>
          <h1 className="font-page-h1 text-page-h1 text-text-primary font-semibold">Shipment Records</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Logistics manifest tracking cargo items, vehicle logs, and physical stopping nodes.
          </p>
        </div>
        {(user.role === "SUPPLIER" || user.role === "ADMIN") && (
          <button
            onClick={() => openDrawer("shipment")}
            className="btn btn-primary bg-gradient-to-b from-[#FFC576] to-primary text-[#1A1300] px-4 py-2 rounded text-button font-button shadow-[0_4px_12px_rgba(255,180,84,0.35)] hover:brightness-105 transition-all"
          >
            + Create Shipment
          </button>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
        {/* Tabs */}
        <div className="flex border-b border-border-subtle w-full md:w-auto">
          {(["ALL", "CREATED", "IN_TRANSIT", "DELAYED", "DELIVERED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-all relative ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.replace("_", " ")}
              <span className="ml-1.5 text-[10.5px] font-data-mono opacity-60">
                ({tabLabelCount(tab)})
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="search-bar max-w-[280px] w-full flex items-center gap-2 bg-[#131519] border border-border-subtle rounded px-3 py-1.5 text-text-tertiary text-[12.5px]">
          <span className="material-symbols-outlined text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by ID, item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-text-primary text-[13px] w-full placeholder-text-tertiary"
          />
        </div>
      </div>

      {/* Table Panel */}
      <div className="panel bg-[#131519] border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="py-20 text-center text-text-tertiary font-data-mono">
            No shipment logs found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle font-label-eyebrow text-[10px]">
                  <th className="px-6 py-4">Shipment ID</th>
                  <th className="px-6 py-4">Item SKU Details</th>
                  <th className="px-6 py-4">Route Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Transporter</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {filteredShipments.map((shipment) => {
                  const statusClasses: Record<string, string> = {
                    CREATED: "bg-surface-variant/20 text-text-secondary border-border-subtle/50",
                    IN_TRANSIT: "bg-secondary/10 text-secondary border-secondary/20",
                    DELAYED: "bg-status-delayed/10 text-[#FB6B6B] border-status-delayed/20",
                    DELIVERED: "bg-status-delivered/10 text-status-delivered border-status-delivered/20"
                  };

                  return (
                    <tr key={shipment.shipmentId} className="hover:bg-bg-elevated/40 transition-colors">
                      <td className="px-6 py-4 font-semibold">
                        <Link 
                          to={`/shipments/${shipment.shipmentId}`}
                          className="font-data-mono text-text-primary hover:text-secondary hover:underline text-[13.5px]"
                        >
                          {shipment.shipmentId}
                        </Link>
                        <span className="text-[10px] text-text-tertiary font-data-mono block mt-1">
                          Ref: {shipment.item.itemId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-text-secondary">
                        <div className="font-semibold text-text-primary">{shipment.item.name}</div>
                        <div className="text-[10.5px] text-text-tertiary mt-0.5">Cat: {shipment.item.category}</div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-text-secondary">
                        <div className="truncate max-w-[200px]">
                          {shipment.fromLocation} <span className="text-text-tertiary">→</span> {shipment.toLocation}
                        </div>
                        <div className="text-[10.5px] text-text-tertiary mt-0.5">
                          ETA: {new Date(shipment.shipmentExpectedDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border uppercase tracking-wider ${statusClasses[shipment.currentStatus] || ""}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                          {shipment.currentStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13.5px] text-text-secondary font-medium">
                        {shipment.transporterName ? (
                          <div>
                            <div>{shipment.transporterName}</div>
                            <div className="text-[10px] text-text-tertiary font-data-mono mt-0.5">{shipment.transporterEmail}</div>
                          </div>
                        ) : (
                          <span className="text-text-tertiary italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/shipments/${shipment.shipmentId}`}
                            className="btn btn-ghost border border-border-subtle text-[11px] px-2.5 py-1.5 rounded hover:text-text-primary hover:border-border-strong transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            Track
                          </Link>

                          {/* Quick assign button for admin/warehouse manager if shipment unassigned */}
                          {!shipment.transporterEmail && (user.role === "ADMIN" || user.role === "WAREHOUSE_MANAGER") && (
                            <button
                              onClick={() => openDrawer("assign", shipment.shipmentId)}
                              className="btn btn-primary bg-primary/10 border border-primary/20 text-primary text-[11px] px-2.5 py-1.5 rounded hover:bg-primary/20 transition-all"
                            >
                              Assign
                            </button>
                          )}

                          {/* Quick status update button for assigned transporter */}
                          {shipment.transporterEmail && user.role === "TRANSPORTER" && (
                            <button
                              onClick={() => openDrawer("status", shipment.shipmentId)}
                              className="btn btn-ghost border border-secondary/20 text-secondary text-[11px] px-2.5 py-1.5 rounded hover:bg-secondary/15 transition-all"
                            >
                              Update Status
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
