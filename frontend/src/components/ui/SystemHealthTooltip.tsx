"use client";

import { useEffect, useState } from "react";
import {
  LucideActivity,
  LucideCheckCircle,
  LucideAlertTriangle,
  LucideXCircle,
} from "lucide-react";

// --- Strict Types to resolve ESLint '@typescript-eslint/no-explicit-any' ---

interface ServiceLeaf {
  status: string;
  provider?: string;
  last_checked?: string | null;
  last_updated?: string | null;
}

interface ServiceNode {
  [key: string]: ServiceLeaf | ServiceNode;
}

interface HealthResponse {
  ok?: boolean;
  status: string;
  service?: string;
  environment?: string;
  uptime?: string;
  timestamp?: string;
  services?: ServiceNode;
  backend?: {
    reachable: boolean;
    statusCode?: number;
  };
}

type HealthStatus = "loading" | "healthy" | "degraded" | "down" | "up";

export default function SystemHealthTooltip() {
  const [status, setStatus] = useState<HealthStatus>("loading");
  // Fixed: Replaced 'any' with 'HealthResponse' interface
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [services, setServices] = useState<ServiceNode>({});

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok) {
          setStatus("down");
          return;
        }

        const data: HealthResponse = await res.json();
        setHealthData(data);
        setServices(data.services || {});

        // Preserved original logic
        if (data.status === "degraded") {
          setStatus("degraded");
        } else if (data.ok || data.status === "up") {
          setStatus("healthy");
        } else {
          setStatus("down");
        }
      } catch {
        setStatus("down");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Helper to render nested services (like pipelines -> ingestion)
  const renderServiceRows = (obj: ServiceNode) => {
    return Object.entries(obj).map(([name, details]) => {
      // Logic to detect if the item is a nested group or a single service
      const isNested =
        details && typeof details === "object" && !("status" in details);

      if (isNested) {
        return (
          <div
            key={name}
            className="mt-2 border-t border-black/5 pt-1">
            <span className="text-[9px] font-black opacity-40 uppercase tracking-tighter">
              {name}
            </span>
            <div className="pl-2 border-l border-black/5">
              {renderServiceRows(details as ServiceNode)}
            </div>
          </div>
        );
      }

      const leaf = details as ServiceLeaf;
      const state = leaf?.status || "unknown";

      return (
        <li
          key={name}
          className="flex items-center justify-between font-bold text-[11px] py-0.5">
          <span className="uppercase text-black/70">
            {name.replace("_", " ")}
          </span>
          <span
            className={state === "up" ? "text-green-600" : "text-amber-500"}>
            {state}
          </span>
        </li>
      );
    });
  };

  const config = {
    loading: {
      label: "Checking systems",
      icon: LucideActivity,
      color: "bg-gray-200",
    },
    healthy: {
      label: "All systems operational",
      icon: LucideCheckCircle,
      color: "bg-[#cfe9ff]",
    },
    up: {
      label: "All systems operational",
      icon: LucideCheckCircle,
      color: "bg-[#cfe9ff]",
    },
    degraded: {
      label: "Partial outage",
      icon: LucideAlertTriangle,
      color: "bg-[#ffde59]",
    },
    down: { label: "System down", icon: LucideXCircle, color: "bg-red-300" },
  }[status] || {
    label: "System down",
    icon: LucideXCircle,
    color: "bg-red-300",
  };

  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <div
        className={`flex items-center gap-2 px-4 py-2 border-[3px] border-black rounded-full shadow-[4px_4px_0px_black] font-black uppercase text-xs cursor-default transition-colors ${config.color}`}>
        <Icon
          size={16}
          strokeWidth={3}
          className={status === "loading" ? "animate-spin" : ""}
        />
        {status === "healthy" ? "UP" : status}
      </div>

      <div className="absolute bottom-full right-0 mb-4 w-72 bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_black] p-4 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none">
        <div className="flex items-center gap-2 mb-3">
          <Icon
            size={20}
            strokeWidth={3}
          />
          <span className="font-black uppercase text-sm">{config.label}</span>
        </div>

        <ul className="space-y-1">{renderServiceRows(services)}</ul>

        {healthData && (
          <div className="mt-4 pt-2 border-t-[3px] border-black flex justify-between items-center text-[10px] font-black uppercase opacity-60">
            <span>Uptime: {healthData.uptime || "0s"}</span>
            <span className="bg-black text-white px-1 leading-none py-0.5">
              {healthData.environment}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
