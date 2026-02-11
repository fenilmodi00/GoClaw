import { notFound } from "next/navigation";
import { deploymentService } from "@/services";
import { AgentDetailClient } from "@/components/features/deployment/AgentDetailClient";
import type { DeploymentStatus } from "@/components/features/deployment/StatusTracker";

interface StatusPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StatusPage({ params }: StatusPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  let deployment;
  try {
    deployment = await deploymentService.getDeploymentById(id);
  } catch (error) {
    console.error("Error fetching deployment:", error);
    notFound();
  }

  if (!deployment) {
    notFound();
  }

  return (
    <AgentDetailClient
      deploymentId={id}
      initialStatus={deployment.status as DeploymentStatus}
      model={deployment.model}
      channel={deployment.channel}
    />
  );
}
