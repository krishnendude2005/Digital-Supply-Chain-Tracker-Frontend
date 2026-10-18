import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../lib/api-client";

export const ItemDetails: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();

  // Fetch Item details
  const { data: item, isLoading, error } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => apiService.getItem(itemId || ""),
    enabled: !!itemId,
  });

  // Fetch shipments to show shipment history for this item
  const { data: shipments = [] } = useQuery({
    queryKey: ["shipments"],
    queryFn: apiService.getShipments,
  });

  const itemShipments = shipments.filter((s) => s.item.itemId === itemId);

  if (isLoading) {
    return (
      <div className="page py-20 flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-text-secondary font-data-mono">Streaming catalog profile...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="page py-20 text-center text-status-delayed font-data-mono">
        Failed to resolve item record. Verify SKU ID.
      </div>
    );
  }

  return (
    <div className="page space-y-gutter">
      {/* Back button */}
      <div className="mb-4">
        <Link 
          to="/items"
          className="text-secondary text-[12.5px] font-medium hover:underline flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Catalog list
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Profile Card (1 Col) */}
        <div className="bg-[#131519] border border-border-subtle rounded-xl p-6 space-y-6 self-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/15 border border-secondary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[24px]">inventory_2</span>
            </div>
            <div>
              <h2 className="font-card-h2 text-[18px] text-text-primary leading-tight font-semibold">{item.name}</h2>
              <span className="font-data-mono text-[11px] text-text-tertiary mt-1 block">SKU: {item.itemId}</span>
            </div>
          </div>

          <div className="border-t border-border-subtle/50 pt-5 space-y-4 text-[13px]">
            <div>
              <span className="text-text-tertiary block font-label-eyebrow text-[10px] uppercase">Category</span>
              <span className="text-text-primary mt-1 block font-medium">{item.category}</span>
            </div>

            <div>
              <span className="text-text-tertiary block font-label-eyebrow text-[10px] uppercase">Supplier Org</span>
              <span className="text-text-primary mt-1 block font-medium">{item.supplierName}</span>
              <span className="text-text-secondary mt-0.5 block font-data-mono text-[11.5px]">{item.supplierEmail}</span>
            </div>

            <div>
              <span className="text-text-tertiary block font-label-eyebrow text-[10px] uppercase">Registered Date</span>
              <span className="text-text-primary mt-1 block font-data-mono">
                {new Date(item.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
          </div>
        </div>

        {/* History Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="panel bg-[#131519] border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <div className="panel-head px-6 py-4 border-b border-border-subtle bg-[#1b1b1f]/30">
              <h3 className="font-card-h2 text-[16px] text-text-primary">Related Logistics Shipments</h3>
              <p className="text-text-tertiary text-[12px]">All registered shipment logs tracking this catalog item SKU</p>
            </div>

            <div className="overflow-x-auto">
              {itemShipments.length === 0 ? (
                <div className="py-16 text-center text-text-tertiary font-data-mono text-[13px]">
                  No shipments registered containing this item SKU.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle font-label-eyebrow text-[10px]">
                      <th className="px-6 py-3.5">Shipment ID</th>
                      <th className="px-6 py-3.5">Origin → Destination</th>
                      <th className="px-6 py-3.5">Transporter</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/30">
                    {itemShipments.map((shipment) => (
                      <tr key={shipment.shipmentId} className="hover:bg-bg-elevated/40 transition-colors">
                        <td className="px-6 py-4">
                          <Link 
                            to={`/shipments/${shipment.shipmentId}`}
                            className="font-data-mono text-secondary hover:underline text-[13px]"
                          >
                            {shipment.shipmentId}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-[12.5px] text-text-secondary">
                          {shipment.fromLocation} → {shipment.toLocation}
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

      </div>
    </div>
  );
};
