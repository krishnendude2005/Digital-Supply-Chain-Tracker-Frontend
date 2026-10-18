import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../../lib/api-client";
import type { Role, ShipmentStatus, ItemStatus } from "../../types";
import { toast } from "sonner";

type DrawerKind = "shipment" | "item" | "user" | "assign" | "status" | "checkpoint";

interface OverlayDrawersProps {
  activeDrawer: DrawerKind | null;
  selectedDataId: string | null;
  onClose: () => void;
}

export const OverlayDrawers: React.FC<OverlayDrawersProps> = ({
  activeDrawer,
  selectedDataId,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // --- QUERY RESOURCES FOR SELECT DROPDOWNS ---
  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: apiService.getItems,
    enabled: activeDrawer === "shipment"
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: apiService.getUsers,
    enabled: activeDrawer === "assign" || activeDrawer === "user"
  });

  // Get item if we are editing an item
  const { data: itemToEdit } = useQuery({
    queryKey: ["item", selectedDataId],
    queryFn: () => apiService.getItem(selectedDataId || ""),
    enabled: activeDrawer === "item" && !!selectedDataId,
  });

  // --- STATE FOR FORMS ---
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Textiles");

  const [shipmentItemId, setShipmentItemId] = useState("");
  const [shipmentFrom, setShipmentFrom] = useState("");
  const [shipmentTo, setShipmentTo] = useState("");
  const [shipmentEndDate, setShipmentEndDate] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerRole, setRegisterRole] = useState<Role>("TRANSPORTER");

  const [transporterId, setTransporterId] = useState("");

  const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus>("IN_TRANSIT");

  const [checkpointLocation, setCheckpointLocation] = useState("");
  const [checkpointItemStatus, setCheckpointItemStatus] = useState<ItemStatus>("IN_TRANSIT");

  // Sync state with loaded item if editing
  useEffect(() => {
    if (activeDrawer === "item" && itemToEdit) {
      setItemName(itemToEdit.name);
      setItemCategory(itemToEdit.category);
    } else {
      setItemName("");
      setItemCategory("Textiles");
    }
  }, [activeDrawer, itemToEdit]);

  // Set default values when drawers open
  useEffect(() => {
    if (activeDrawer === "shipment") {
      if (items.length > 0) setShipmentItemId(items[0].itemId);
      setShipmentFrom("Chennai Port, TN");
      setShipmentTo("Pune DC, MH");
      // Set to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      setShipmentEndDate(tomorrow.toISOString().split("T")[0]);
    } else if (activeDrawer === "assign") {
      const transporters = users.filter(u => u.role === "TRANSPORTER");
      if (transporters.length > 0) setTransporterId(transporters[0].userId);
    }
  }, [activeDrawer, items, users]);

  // --- MUTATIONS ---
  const createItemMutation = useMutation({
    mutationFn: apiService.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Catalog item registered successfully");
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to create item")
  });

  const updateItemMutation = useMutation({
    mutationFn: (data: { name: string; category: string; supplierEmail: string }) =>
      apiService.updateItem(selectedDataId || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item", selectedDataId] });
      toast.success("Catalog item updated successfully");
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to update item")
  });

  const createShipmentMutation = useMutation({
    mutationFn: apiService.createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      toast.success("Shipment dispatched onto routing grid");
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to dispatch shipment")
  });

  const registerUserMutation = useMutation({
    mutationFn: apiService.registerUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`User ${data.name} registered under ${data.role}`);
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to register user")
  });

  const changeRoleMutation = useMutation({
    mutationFn: apiService.changeUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role modified");
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to update user role")
  });

  const assignTransporterMutation = useMutation({
    mutationFn: (req: { transporterId: string }) =>
      apiService.assignTransporter(selectedDataId || "", req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment", selectedDataId] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Carrier assigned to route");
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to assign carrier")
  });

  const updateStatusMutation = useMutation({
    mutationFn: (req: { status: ShipmentStatus }) =>
      apiService.updateShipmentStatus(selectedDataId || "", req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment", selectedDataId] });
      queryClient.invalidateQueries({ queryKey: ["checkpoints", selectedDataId] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Shipment status updated on manifest");
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to update status")
  });

  const createCheckpointMutation = useMutation({
    mutationFn: apiService.createCheckpoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkpoints", selectedDataId] });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment", selectedDataId] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Physical stopping log logged");
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to record stop checkpoint")
  });

  if (!activeDrawer) return null;

  // Form submit router
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeDrawer === "item") {
      if (selectedDataId) {
        // Editing
        const email = itemToEdit?.supplierEmail || "supply@anandtex.in";
        updateItemMutation.mutate({ name: itemName, category: itemCategory, supplierEmail: email });
      } else {
        // Creating
        createItemMutation.mutate({ name: itemName, category: itemCategory });
      }
    } else if (activeDrawer === "shipment") {
      createShipmentMutation.mutate({
        itemId: shipmentItemId,
        fromLocation: shipmentFrom,
        toLocation: shipmentTo,
        endDate: `${shipmentEndDate}T00:00:00`
      });
    } else if (activeDrawer === "user") {
      // Register
      registerUserMutation.mutate({
        name: registerName,
        email: registerEmail,
        role: registerRole
      });
    } else if (activeDrawer === "assign") {
      if (selectedDataId && selectedDataId.includes("@")) {
        // We are editing a user role actually (since we passed email as data ID)
        changeRoleMutation.mutate({ email: selectedDataId, role: registerRole });
      } else {
        // Assigning transporter
        assignTransporterMutation.mutate({ transporterId });
      }
    } else if (activeDrawer === "status") {
      updateStatusMutation.mutate({ status: shipmentStatus });
    } else if (activeDrawer === "checkpoint") {
      createCheckpointMutation.mutate({
        shipmentId: selectedDataId || "",
        location: checkpointLocation,
        itemStatus: checkpointItemStatus
      });
    }
  };

  const getDrawerTitle = () => {
    switch (activeDrawer) {
      case "item": return selectedDataId ? "Edit Catalog Item" : "Register Catalog Item";
      case "shipment": return "Create Transit Shipment";
      case "user": return "Register Platform User";
      case "assign": return selectedDataId && selectedDataId.includes("@") ? "Modify User Role" : "Assign Cargo Carrier";
      case "status": return "Modify Shipment Status";
      case "checkpoint": return "Log Stop Checkpoint";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Background Overlay Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Sliding Drawer Container */}
      <div className="relative w-full max-w-[460px] h-full bg-[#131519]/95 border-l border-border-subtle shadow-2xl flex flex-col p-8 z-10 glass-panel animate-[slideIn_0.25s_ease-out]">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}} />
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border-subtle/50 pb-5 mb-6">
          <h2 className="font-card-h2 text-[18px] text-text-primary font-semibold">{getDrawerTitle()}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-strong transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto space-y-6 pr-1">
          
          {/* Form Fields */}
          <div className="space-y-4 flex-1">
            {/* ITEM CREATE/EDIT DRAWER */}
            {activeDrawer === "item" && (
              <>
                <div className="space-y-1">
                  <label className="block text-[12.5px] text-text-secondary font-medium">Item Label Name</label>
                  <input 
                    type="text" 
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Precision gears, Cotton rolls"
                    className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[12.5px] text-text-secondary font-medium">Industry Category</label>
                  <select 
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                  >
                    <option value="Textiles">Textiles</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Machine parts">Machine parts</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Chemicals">Chemicals</option>
                  </select>
                </div>
              </>
            )}

            {/* SHIPMENT CREATE DRAWER */}
            {activeDrawer === "shipment" && (
              <>
                <div className="space-y-1">
                  <label className="block text-[12.5px] text-text-secondary font-medium">Choose Inventory Item</label>
                  {items.length === 0 ? (
                    <div className="text-[12.5px] text-status-delayed">
                      No catalog items available. Create an item first.
                    </div>
                  ) : (
                    <select 
                      value={shipmentItemId}
                      onChange={(e) => setShipmentItemId(e.target.value)}
                      className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                    >
                      {items.map((i) => (
                        <option key={i.itemId} value={i.itemId}>
                          {i.name} (SKU: {i.itemId})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[12.5px] text-text-secondary font-medium">Origin Site</label>
                  <input 
                    type="text" 
                    required
                    value={shipmentFrom}
                    onChange={(e) => setShipmentFrom(e.target.value)}
                    placeholder="e.g. Chennai Port, TN"
                    className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[12.5px] text-text-secondary font-medium">Destination Hub</label>
                  <input 
                    type="text" 
                    required
                    value={shipmentTo}
                    onChange={(e) => setShipmentTo(e.target.value)}
                    placeholder="e.g. Pune Distribution Center"
                    className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[12.5px] text-text-secondary font-medium">Estimated Delivery Target Date</label>
                  <input 
                    type="date" 
                    required
                    value={shipmentEndDate}
                    onChange={(e) => setShipmentEndDate(e.target.value)}
                    className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                  />
                </div>
              </>
            )}

            {/* REGISTER USER DRAWER */}
            {activeDrawer === "user" && (
              <>
                <div className="space-y-1">
                  <label className="block text-[12.5px] text-text-secondary font-medium">Platform User Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="e.g. Suresh Logistics Operations"
                    className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[12.5px] text-text-secondary font-medium">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="e.g. ops@sureshlog.com"
                    className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[12.5px] text-text-secondary font-medium">Authorized Role System</label>
                  <select 
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value as Role)}
                    className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="WAREHOUSE_MANAGER">WAREHOUSE MANAGER</option>
                    <option value="SUPPLIER">SUPPLIER</option>
                    <option value="TRANSPORTER">TRANSPORTER</option>
                  </select>
                </div>
              </>
            )}

            {/* ASSIGN TRANSPORTER DRAWER (AND MODIFY ROLE DRAWER OVERLOAD) */}
            {activeDrawer === "assign" && (
              <>
                {selectedDataId && selectedDataId.includes("@") ? (
                  // Modify Role mode
                  <div className="space-y-1">
                    <label className="block text-[12.5px] text-text-secondary font-medium">Modify Role for: {selectedDataId}</label>
                    <select 
                      value={registerRole}
                      onChange={(e) => setRegisterRole(e.target.value as Role)}
                      className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="WAREHOUSE_MANAGER">WAREHOUSE MANAGER</option>
                      <option value="SUPPLIER">SUPPLIER</option>
                      <option value="TRANSPORTER">TRANSPORTER</option>
                    </select>
                  </div>
                ) : (
                  // Assign Transporter mode
                  <div className="space-y-1">
                    <label className="block text-[12.5px] text-text-secondary font-medium">Select Logistics Transporter</label>
                    {users.filter(u => u.role === "TRANSPORTER").length === 0 ? (
                      <div className="text-[12.5px] text-status-delayed">
                        No active transporter accounts found. Add a transporter account first.
                      </div>
                    ) : (
                      <select 
                        value={transporterId}
                        onChange={(e) => setTransporterId(e.target.value)}
                        className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                      >
                        {users
                          .filter((u) => u.role === "TRANSPORTER")
                          .map((u) => (
                            <option key={u.userId} value={u.userId}>
                              {u.name} ({u.email})
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                )}
              </>
            )}

            {/* MODIFY SHIPMENT STATUS DRAWER */}
            {activeDrawer === "status" && (
              <div className="space-y-1">
                <label className="block text-[12.5px] text-text-secondary font-medium">Shipment Transit State</label>
                <select 
                  value={shipmentStatus}
                  onChange={(e) => setShipmentStatus(e.target.value as ShipmentStatus)}
                  className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                >
                  <option value="CREATED">CREATED (PICKUP DOCK)</option>
                  <option value="IN_TRANSIT">IN TRANSIT</option>
                  <option value="DELAYED">DELAYED (INCIDENT REPORT)</option>
                  <option value="DELIVERED">DELIVERED (TERMINAL REACHED)</option>
                </select>
              </div>
            )}

            {/* LOG STOP CHECKPOINT DRAWER */}
            {activeDrawer === "checkpoint" && (
              <>
                <div className="space-y-1">
                  <label className="block text-[12.5px] text-text-secondary font-medium">Checkpoint Stopping Location</label>
                  <input 
                    type="text" 
                    required
                    value={checkpointLocation}
                    onChange={(e) => setCheckpointLocation(e.target.value)}
                    placeholder="e.g. Hyderabad Cross-Dock"
                    className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[12.5px] text-text-secondary font-medium">Carried Item Unit Condition</label>
                  <select 
                    value={checkpointItemStatus}
                    onChange={(e) => setCheckpointItemStatus(e.target.value as ItemStatus)}
                    className="w-full bg-[#1b1b1f] border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[13.5px] focus:border-secondary outline-none transition-colors"
                  >
                    <option value="IN_TRANSIT">IN TRANSIT (HEALTHY)</option>
                    <option value="RECEIVED">RECEIVED AT HUB</option>
                    <option value="DELIVERED">DELIVERED (COMPLETED)</option>
                    <option value="DAMAGED">DAMAGED REPORTED</option>
                    <option value="MISSING">MISSING REPORTED</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="flex gap-4 border-t border-border-subtle/50 pt-5 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent hover:bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary text-button font-button py-3 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                createItemMutation.isPending || 
                updateItemMutation.isPending || 
                createShipmentMutation.isPending || 
                registerUserMutation.isPending ||
                changeRoleMutation.isPending ||
                assignTransporterMutation.isPending ||
                updateStatusMutation.isPending ||
                createCheckpointMutation.isPending
              }
              className="flex-1 bg-gradient-to-b from-[#FFC576] to-primary text-[#1A1300] font-bold text-button font-button py-3 rounded shadow-[0_4px_12px_rgba(255,180,84,0.35)] hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
            >
              {(createItemMutation.isPending || 
                updateItemMutation.isPending || 
                createShipmentMutation.isPending || 
                registerUserMutation.isPending ||
                changeRoleMutation.isPending ||
                assignTransporterMutation.isPending ||
                updateStatusMutation.isPending ||
                createCheckpointMutation.isPending) ? (
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Save changes"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
