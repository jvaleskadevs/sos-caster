'use client';

import { Status, StatusIndicator, StatusLabel } from '@/components/ui/status';

export const ServiceStatus = ({ service, status }: { 
  service: string, 
  status: "online" | "offline" | "maintenance" | "degraded" 
}) => (
  <div className="flex gap-1 sm:gap-2 text-xs sm:text-sm md:text-md">
    <p>{service}</p>
    <Status status={status || "offline"}>
      <StatusIndicator />
      <StatusLabel />
    </Status>
  </div>
);
