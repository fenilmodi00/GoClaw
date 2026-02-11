"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2, AlertCircle } from "lucide-react"

interface DeploymentLoadingProps {
  deploymentId: string // Database deployment ID
  onComplete?: (data: DeploymentData) => void
  onError?: (error: string) => void
}

interface DeploymentData {
  deploymentId: string
  status: string
  channel?: string
  channelLink?: string
  errorMessage?: string
}

interface DeploymentStep {
  id: string
  label: string
  status: "pending" | "loading" | "complete" | "error"
}

export function DeploymentLoading({ deploymentId, onComplete, onError }: DeploymentLoadingProps) {
  const [steps, setSteps] = useState<DeploymentStep[]>([
    { id: "payment", label: "Processing payment", status: "complete" },
    { id: "deployment", label: "Creating deployment on Akash Network", status: "loading" },
    { id: "bids", label: "Waiting for provider bids", status: "pending" },
    { id: "lease", label: "Creating lease with provider", status: "pending" },
    { id: "active", label: "Starting OpenClaw container", status: "pending" },
  ])

  const [currentStatus, setCurrentStatus] = useState<string>("Initializing deployment...")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [deploymentData, setDeploymentData] = useState<DeploymentData | null>(null)

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Poll our own status API for deployment updates
  useEffect(() => {
    const checkDeploymentStatus = async () => {
      try {
        const response = await fetch(`/api/status?id=${deploymentId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch deployment status: ${response.status}`)
        }

        const data = await response.json()
        const status = data.status

        // Update status message
        setCurrentStatus(getStatusMessage(status))

        // Update steps based on status
        if (status === "pending") {
          updateStep("payment", "complete")
          updateStep("deployment", "loading")
          setCurrentStatus("Payment confirmed, preparing deployment...")
        } else if (status === "deploying") {
          updateStep("payment", "complete")
          updateStep("deployment", "complete")
          updateStep("bids", "loading")
          setCurrentStatus("Deployment created, waiting for provider bids...")
          
          // Simulate progress through deployment stages
          if (elapsedTime > 10) {
            updateStep("bids", "complete")
            updateStep("lease", "loading")
            setCurrentStatus("Bids received, creating lease with provider...")
          }
          if (elapsedTime > 20) {
            updateStep("lease", "complete")
            updateStep("active", "loading")
            setCurrentStatus("Lease created, starting container...")
          }
        } else if (status === "active") {
          // Mark all steps as complete
          updateStep("payment", "complete")
          updateStep("deployment", "complete")
          updateStep("bids", "complete")
          updateStep("lease", "complete")
          updateStep("active", "complete")
          setCurrentStatus("Deployment active! Your bot is ready.")

          const completedData: DeploymentData = {
            deploymentId,
            status: "active",
            channel: data.channel,
            channelLink: data.channelLink,
          }

          setDeploymentData(completedData)

          if (onComplete) {
            setTimeout(() => {
              onComplete(completedData)
            }, 1500)
          }
        } else if (status === "failed") {
          const errorMsg = data.errorMessage || "Deployment failed"
          setError(errorMsg)
          
          // Mark current loading step as error
          setSteps((prevSteps) =>
            prevSteps.map((step) =>
              step.status === "loading" ? { ...step, status: "error" as const } : step
            )
          )

          if (onError) {
            onError(errorMsg)
          }
        }

      } catch (err) {
        console.error("Error checking deployment status:", err)
        const errorMsg = err instanceof Error ? err.message : "Failed to check deployment status"
        setError(errorMsg)
        
        // Mark current loading step as error
        setSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.status === "loading" ? { ...step, status: "error" as const } : step
          )
        )

        if (onError) {
          onError(errorMsg)
        }
      }
    }

    // Initial check
    checkDeploymentStatus()

    // Poll every 3 seconds
    const pollingInterval = setInterval(checkDeploymentStatus, 3000)

    return () => {
      clearInterval(pollingInterval)
    }
  }, [deploymentId, elapsedTime, onComplete, onError])

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case "pending":
        return "Payment confirmed, preparing deployment..."
      case "deploying":
        return "Deploying to Akash Network..."
      case "active":
        return "Deployment active! Your bot is ready."
      case "failed":
        return "Deployment failed"
      default:
        return "Checking deployment status..."
    }
  }

  const updateStep = (stepId: string, status: "pending" | "loading" | "complete" | "error") => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, status } : step
      )
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const completedSteps = steps.filter((s) => s.status === "complete").length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className={`border-orange-500/50 bg-black/60 backdrop-blur-sm ${error ? "border-red-500/50" : ""}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${error ? "text-red-400" : "text-orange-400"}`}>
            {error ? (
              <>
                <AlertCircle className="h-5 w-5" />
                Deployment Failed
              </>
            ) : deploymentData ? (
              <>
                <Check className="h-5 w-5" />
                Deployment Complete
              </>
            ) : (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Deploying to Akash
              </>
            )}
          </CardTitle>
          <CardDescription>
            {error ? error : currentStatus}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!error && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 text-right">
                Elapsed: {formatTime(elapsedTime)}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                  step.status === "loading"
                    ? "bg-orange-500/10 border border-orange-500/30"
                    : step.status === "complete"
                    ? "bg-green-500/5 border border-green-500/20"
                    : step.status === "error"
                    ? "bg-red-500/10 border border-red-500/30"
                    : "bg-gray-800/30 border border-gray-700/30"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {step.status === "complete" ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : step.status === "loading" ? (
                    <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
                  ) : step.status === "error" ? (
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <AlertCircle className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      step.status === "loading"
                        ? "text-orange-400"
                        : step.status === "complete"
                        ? "text-green-400"
                        : step.status === "error"
                        ? "text-red-400"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.status === "loading" && (
                    <p className="text-xs text-gray-400 mt-1">
                      In progress...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">Deployment ID</p>
            <code className="text-xs text-gray-400 break-all">{deploymentId}</code>
          </div>
        </CardContent>
      </Card>

      {!error && (
        <Card className="bg-black/40 backdrop-blur-sm border-gray-800">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>Fetching real-time status from Akash Network</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>This process typically takes 1-2 minutes</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>You&apos;ll receive your bot details once deployment is complete</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
