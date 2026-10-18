import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { Login } from "../features/auth/Login";
import { Shell } from "../components/layout/Shell";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { ShipmentsPage } from "../features/shipments/ShipmentsPage";
import { ShipmentDetails } from "../features/shipments/ShipmentDetails";
import { ItemsPage } from "../features/items/ItemsPage";
import { ItemDetails } from "../features/items/ItemDetails";
import { AlertsPage } from "../features/alerts/AlertsPage";
import { UsersPage } from "../features/users/UsersPage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Shell />
          </ProtectedRoute>
        }
      >
        {/* Redirect Root path to Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Shared Dashboard Page (switches view based on role) */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Shipments Routes */}
        <Route path="shipments" element={<ShipmentsPage />} />
        <Route path="shipments/:shipmentId" element={<ShipmentDetails />} />

        {/* Catalog Items Routes (Not accessible by transporters) */}
        <Route
          path="items"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "WAREHOUSE_MANAGER", "SUPPLIER"]}>
              <ItemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="items/:itemId"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "WAREHOUSE_MANAGER", "SUPPLIER"]}>
              <ItemDetails />
            </ProtectedRoute>
          }
        />

        {/* Global Warnings/Alerts Page (Not accessible by transporters) */}
        <Route
          path="alerts"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "WAREHOUSE_MANAGER", "SUPPLIER"]}>
              <AlertsPage />
            </ProtectedRoute>
          }
        />

        {/* Administrative Users & Roles Page (Only accessible by admin) */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback wildcard Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
