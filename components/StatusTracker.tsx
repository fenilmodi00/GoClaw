"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { SuccessDisplay } from "@/components/SuccessDisplay";
import { DeploymentLoading } from "@/components/DeploymentLoading";

/**
 * Deployment status type
 * Represents the current state of a deployment
 */
export type DeploymentStatus = "pending" | "deploying" | "active" | "failed";

/**
 * Status response from the API
 */
interface StatusResponse {
  status: DeploymentStatus;
  channel?: string;
  deploymentId?: string;
  leaseId?: string;
  providerUrl?: string;
  errorMessage?: string;
  channelLink?: string;
}

/**
 * Props for the StatusTracker component
 */
interface StatusTrackerProps {
  deploymentId: string;
  initialStatus: DeploymentStatus;
}

/**
 * StatusTracker Component
 * 
 * Displays real-time deployment status with polling.
 * For "deploying" status, shows DeploymentLoading component.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 11.2, 11.4
 */
export function StatusTracker({ deploymentId, initialStatus }: StatusTrackerProps) {
  const [status, setStatus] = useState<DeploymentStatus>(initialStatus);
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch status from API
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/status?id=${deploymentId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch deployment status");
        }

        const data: StatusResponse = await response.json();
        setStatus(data.status);
        setStatusData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    };

    // Fetch status immediately
    fetchStatus();

    // Set up polling interval (3 seconds)
    const intervalId = setInterval(() => {
      // Only fetch if status is not terminal
      if (status !== "active" && status !== "failed") {
        fetchStatus();
      }
    }, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [deploymentId, status]);

  /**
   * Get badge variant based on status
   */
  const getBadgeVariant = (status: DeploymentStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default";
      case "failed":
        return "destructive";
      case "deploying":
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  /**
   * Get status display text
   */
  const getStatusText = (status: DeploymentStatus): string => {
    switch (status) {
      case "pending":
        return "Payment Pending";
      case "deploying":
        return "Deploying to Akash";
      case "active":
        return "Deployment Active";
      case "failed":
        return "Deployment Failed";
      default:
        return "Unknown Status";
    }
  };

  /**
   * Get status description
   */
  const getStatusDescription = (status: DeploymentStatus): string => {
    switch (status) {
      case "pending":
        return "Waiting for payment confirmation...";
      case "deploying":
        return "Creating deployment on Akash Network. This may take a few minutes...";
      case "active":
        return "Your OpenClaw bot is now running!";
      case "failed":
        return "The deployment encountered an error.";
      default:
        return "";
    }
  };

  // Show DeploymentLoading for deploying status
  if (status === "deploying") {
    return (
      <DeploymentLoading
        deploymentId={deploymentId}
        onComplete={(data) => {
          console.log("Deployment complete:", data);
          setStatus("active");
        }}
        onError={(errorMsg) => {
          console.error("Deployment error:", errorMsg);
          setError(errorMsg);
          setStatus("failed");
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Show SuccessDisplay when deployment is active */}
      {status === "active" && statusData && statusData.channel && statusData.channelLink && statusData.providerUrl && statusData.deploymentId && statusData.leaseId ? (
        <SuccessDisplay
          channel={statusData.channel}
          channelLink={statusData.channelLink}
          providerUrl={statusData.providerUrl}
          deploymentId={statusData.deploymentId}
          leaseId={statusData.leaseId}
          gatewayToken="2002"
          showLoading={false}
        />
      ) : (
        <>
          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Deployment Status</CardTitle>
                <Badge variant={getBadgeVariant(status)}>
                  {getStatusText(status)}
                </Badge>
              </div>
              <CardDescription>{getStatusDescription(status)}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Loading indicator for pending/deploying states */}
              {status === "pending" && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              )}

              {/* Error message for failed state */}
              {status === "failed" && statusData?.errorMessage && (
                <div className="p-4 rounded-md bg-red-500/10 border border-red-500/50">
                  <p className="text-sm text-red-400 font-medium mb-1">Error Details:</p>
                  <p className="text-sm text-red-300">{statusData.errorMessage}</p>
                </div>
              )}

              {/* General error display */}
              {error && status !== "failed" && (
                <div className="p-4 rounded-md bg-red-500/10 border border-red-500/50">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deployment ID Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deployment ID</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-black/40 border border-orange-500/20 p-2 rounded block break-all text-gray-300">
                {deploymentId}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Save this ID to check your deployment status later
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
