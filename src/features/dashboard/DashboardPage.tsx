import React from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AdminDashboard } from "./AdminDashboard";
import { SupplierDashboard } from "./SupplierDashboard";
import { TransporterDashboard } from "./TransporterDashboard";

type DrawerKind = "shipment" | "item" | "user" | "assign" | "status" | "checkpoint";

interface ShellContext {
  openDrawer: (kind: DrawerKind, shipmentId?: string) => void;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { openDrawer } = useOutletContext<ShellContext>();

  if (!user) return null;

  switch (user.role) {
    case "ADMIN":
    case "WAREHOUSE_MANAGER":
      // Warehouse managers get a high-level operational overview similar to admin
      return <AdminDashboard onOpenDrawer={openDrawer} />;
    case "SUPPLIER":
      return <SupplierDashboard onOpenDrawer={openDrawer} />;
    case "TRANSPORTER":
      return <TransporterDashboard onOpenDrawer={openDrawer} />;
    default:
      return (
        <div className="page text-center py-12 font-data-mono">
          Unexpected role credential: {user.role}.
        </div>
      );
  }
};
