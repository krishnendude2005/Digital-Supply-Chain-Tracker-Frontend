import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { OverlayDrawers } from "./OverlayDrawers";

type DrawerKind = "shipment" | "item" | "user" | "assign" | "status" | "checkpoint";

export const Shell: React.FC = () => {
  const [activeDrawer, setActiveDrawer] = useState<DrawerKind | null>(null);
  const [selectedDataId, setSelectedDataId] = useState<string | null>(null);

  const openDrawer = (kind: DrawerKind, dataId?: string) => {
    setActiveDrawer(kind);
    if (dataId) {
      setSelectedDataId(dataId);
    } else {
      setSelectedDataId(null);
    }
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
    setSelectedDataId(null);
  };

  return (
    <div className="min-h-screen flex bg-background text-text-primary">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main workspace */}
      <div className="flex-1 flex flex-col pl-[248px] min-h-screen relative">
        {/* Topbar navigation */}
        <Topbar />

        {/* Dynamic page content */}
        <main className="flex-grow pt-16 min-h-screen">
          <Outlet context={{ openDrawer, selectedDataId }} />
        </main>
      </div>

      {/* Side panel slide-out drawers */}
      <OverlayDrawers 
        activeDrawer={activeDrawer}
        selectedDataId={selectedDataId}
        onClose={closeDrawer}
      />
    </div>
  );
};

