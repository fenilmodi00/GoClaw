import { notFound } from "next/navigation";
import { StatusTracker } from "@/components/StatusTracker";
import { deploymentService } from "@/services/deployment/deployment-service";
import type { DeploymentStatus } from "@/components/StatusTracker";

/**
 * Status Page
 * 
 * Dynamic route that displays deployment status for a given deployment ID.
 * Fetches initial status from the database and renders the StatusTracker component
 * which handles real-time polling and status updates.
 * 
 * Route: /status/[id]
 * 
 * Requirements: 5.1, 5.2
 */

interface StatusPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Server component that fetches initial deployment status
 * and renders the StatusTracker client component
 */
export default async function StatusPage({ params }: StatusPageProps) {
  // Extract deployment ID from URL params
  const { id } = await params;

  // Validate that ID exists
  if (!id) {
    notFound();
  }

  // Fetch initial deployment status from database
  let deployment;
  try {
    deployment = await deploymentService.getDeploymentById(id);
  } catch (error) {
    console.error("Error fetching deployment:", error);
    // If there's a database error, show 404 rather than exposing internal errors
    notFound();
  }

  // Handle deployment not found (404)
  if (!deployment) {
    notFound();
  }

  // Extract initial status
  const initialStatus = deployment.status as DeploymentStatus;

  return (
    <main className="min-h-screen p-8 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Deployment Status</h1>
          <p className="text-lg text-muted-foreground">
            Track your OpenClaw bot deployment progress
          </p>
        </div>

        {/* StatusTracker Component */}
        <StatusTracker
          deploymentId={id}
          initialStatus={initialStatus}
        />
      </div>
    </main>
  );
}
