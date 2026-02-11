"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, RefreshCw, ArrowLeft, Bot, Calendar, Activity } from "lucide-react";
import Link from "next/link";

/**
 * Deployment type from API
 */
interface Deployment {
  id: string;
  model: string;
  channel: string;
  status: 'pending' | 'deploying' | 'active' | 'failed';
  akashDeploymentId: string | null;
  akashLeaseId: string | null;
  providerUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dashboard Page Component
 * 
 * Displays all deployments for the authenticated user
 */
export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to home if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, isLoaded, router]);

  // Fetch deployments
  const fetchDeployments = async () => {
    try {
      setError(null);
      const response = await fetch('/api/deployments');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch deployments');
      }

      const data = await response.json();
      setDeployments(data.deployments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchDeployments();
    }
  }, [isSignedIn]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDeployments();
  };

  // Get badge variant based on status
  const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
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

  // Get status display text
  const getStatusText = (status: string): string => {
    switch (status) {
      case "pending":
        return "Payment Pending";
      case "deploying":
        return "Deploying";
      case "active":
        return "Active";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  // Get channel display name
  const getChannelName = (channel: string): string => {
    switch (channel) {
      case "telegram":
        return "Telegram";
      case "discord":
        return "Discord";
      case "whatsapp":
        return "WhatsApp";
      default:
        return channel;
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Don't render until loaded
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-orange-500/20 bg-black/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-white">My Deployments</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-orange-500/30 hover:border-orange-500/50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <Card className="bg-black/60 backdrop-blur-sm border-red-500/50">
            <CardContent className="pt-6">
              <p className="text-red-500 text-center">{error}</p>
            </CardContent>
          </Card>
        ) : deployments.length === 0 ? (
          <Card className="bg-black/60 backdrop-blur-sm border-orange-500/30">
            <CardContent className="pt-6 text-center py-16">
              <Bot className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Deployments Yet</h3>
              <p className="text-gray-400 mb-6">
                You haven&apos;t deployed any bots yet. Get started by deploying your first bot!
              </p>
              <Link href="/#deploy">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-500/20">
                  Deploy Your First Bot
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-black/60 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-400">Total Deployments</CardDescription>
                  <CardTitle className="text-3xl text-white">{deployments.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-black/60 backdrop-blur-sm border-green-500/30 hover:border-green-500/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-400">Active</CardDescription>
                  <CardTitle className="text-3xl text-green-400">
                    {deployments.filter(d => d.status === 'active').length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-black/60 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-500/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-400">Deploying</CardDescription>
                  <CardTitle className="text-3xl text-yellow-400">
                    {deployments.filter(d => d.status === 'deploying' || d.status === 'pending').length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-black/60 backdrop-blur-sm border-red-500/30 hover:border-red-500/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-400">Failed</CardDescription>
                  <CardTitle className="text-3xl text-red-400">
                    {deployments.filter(d => d.status === 'failed').length}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Deployments List */}
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <Card
                  key={deployment.id}
                  className="bg-black/60 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg text-white">
                            {getChannelName(deployment.channel)} Bot
                          </CardTitle>
                          <Badge variant={getBadgeVariant(deployment.status)}>
                            {getStatusText(deployment.status)}
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-400">
                          Model: {deployment.model}
                        </CardDescription>
                      </div>
                      <Link href={`/status/${deployment.id}`}>
                        <Button variant="outline" size="sm" className="border-orange-500/30 hover:border-orange-500/50">
                          View Details
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="text-sm text-gray-300">{formatDate(deployment.createdAt)}</p>
                          </div>
                        </div>
                        {deployment.status === 'active' && deployment.akashDeploymentId && (
                          <div className="flex items-start gap-2">
                            <Activity className="h-4 w-4 text-green-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Akash Deployment ID</p>
                              <code className="text-xs text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                                {deployment.akashDeploymentId}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3">
                        {deployment.status === 'failed' && deployment.errorMessage && (
                          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30">
                            <p className="text-xs text-red-400 font-medium mb-1">Error:</p>
                            <p className="text-xs text-red-300">{deployment.errorMessage}</p>
                          </div>
                        )}
                        {deployment.status === 'active' && deployment.providerUrl && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Provider URL</p>
                            <a
                              href={deployment.providerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                            >
                              Open Akash Console
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {(deployment.status === 'deploying' || deployment.status === 'pending') && (
                          <div className="flex items-center gap-2 text-yellow-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <p className="text-sm">
                              {deployment.status === 'pending' ? 'Waiting for payment...' : 'Deploying to Akash...'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
