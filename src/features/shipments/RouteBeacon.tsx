import React from "react";
import type { CheckpointLogResponse, ShipmentResponse } from "../../types";

interface RouteBeaconProps {
  shipment: ShipmentResponse;
  checkpoints: CheckpointLogResponse[];
}

export const RouteBeacon: React.FC<RouteBeaconProps> = ({ shipment, checkpoints }) => {
  // Construct the logical route stops: Origin, Checkpoint Stops, and Destination.
  const stops = [
    { label: shipment.fromLocation, isTerminal: true, key: "origin" },
    ...checkpoints
      .filter((c) => c.location !== shipment.fromLocation && c.location !== shipment.toLocation)
      .map((c, index) => ({ label: c.location, isTerminal: false, key: `stop-${index}` })),
    { label: shipment.toLocation, isTerminal: true, key: "destination" }
  ];

  // Find the index of the active stop (which is the last recorded checkpoint location)
  let activeIndex = 0;
  if (checkpoints.length > 0) {
    const lastCheckpoint = checkpoints[checkpoints.length - 1];
    const index = stops.findIndex(
      (s) => s.label.toLowerCase() === lastCheckpoint.location.toLowerCase()
    );
    if (index !== -1) {
      activeIndex = index;
    } else {
      activeIndex = Math.max(0, stops.length - 2); // default to second last if not matched exactly
    }
  }

  // If shipment is delivered, active stop is the destination (last stop)
  if (shipment.currentStatus === "DELIVERED") {
    activeIndex = stops.length - 1;
  }

  // Calculate progress percent along the line
  const progressPercent = stops.length > 1 ? (activeIndex / (stops.length - 1)) * 100 : 0;

  return (
    <div className="py-8 px-4 bg-[#131519]/50 border border-border-subtle rounded-xl backdrop-blur-sm relative">
      <div className="font-label-eyebrow text-label-eyebrow text-text-tertiary mb-6 tracking-widest uppercase">
        Live Telemetry Routing Beacon
      </div>

      <div className="relative flex items-center justify-between w-full mt-4">
        {/* Track Line Background */}
        <div className="absolute left-0 right-0 h-0.5 bg-border-strong z-0"></div>

        {/* Completed Progress Line Fill */}
        <div 
          className="absolute left-0 h-0.5 bg-gradient-to-r from-secondary to-primary z-0 transition-all duration-700 ease-in-out"
          style={{ width: `${progressPercent}%` }}
        ></div>

        {/* Stop Nodes */}
        {stops.map((stop, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;

          let nodeClass = "";
          let labelClass = "";

          if (isCompleted) {
            // Completed node: Solid Cyan
            nodeClass = "bg-secondary border border-secondary shadow-[0_0_8px_rgba(86,215,238,0.4)]";
            labelClass = "text-text-secondary font-medium";
          } else if (isActive) {
            // Active node: Pulsing Amber
            nodeClass = "bg-primary border border-primary beacon-pulse-large z-10 w-4 h-4";
            labelClass = "text-primary font-bold";
          } else {
            // Future node: Muted Border
            nodeClass = "bg-[#121316] border-2 border-border-strong";
            labelClass = "text-text-tertiary";
          }

          return (
            <div 
              key={stop.key} 
              className="flex flex-col items-center relative z-10 group"
              style={{ width: `${100 / stops.length}%` }}
            >
              {/* Node Dot */}
              <div 
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300 ${nodeClass}`}
              >
                {isCompleted && (
                  <span className="material-symbols-outlined text-background text-[9px] font-bold">check</span>
                )}
              </div>

              {/* Node Title */}
              <div className="absolute top-6 flex flex-col items-center text-center w-36 pointer-events-none">
                <span className={`text-[12px] leading-tight select-none mt-1 truncate max-w-full ${labelClass}`}>
                  {stop.label}
                </span>
                
                {/* Node Metadata (If completed/active) */}
                {isActive && (
                  <span className="text-[9.5px] font-data-mono text-primary mt-1 uppercase tracking-wider bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded animate-pulse">
                    Current Node
                  </span>
                )}
                {isCompleted && (
                  <span className="text-[9px] font-data-mono text-text-tertiary mt-1">
                    Passed stop
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Spacer to buffer the bottom labels absolute positioning */}
      <div className="h-10 mt-2"></div>
    </div>
  );
};
