import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { deploymentService, stripeService, userService } from "@/services";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, ShoppingBag } from "lucide-react";
import Link from "next/link";


export const metadata = {
    title: "My Purchases - GoClaw",
    description: "View your payment history and download invoices",
};

interface Purchase {
    id: string;
    date: Date;
    description: string;
    amount: number;
    currency: string;
    status: string;
    invoiceUrl: string | null;
    deploymentId: string;
}

export default async function PurchasesPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Resolve internal user ID from Clerk ID
    const dbUser = await userService.getUserByClerkId(user.id);

    if (!dbUser) {
        // Handle edge case where user is in Clerk but not in DB yet (shouldn't happen if they have deployments)
        return (
            <div className="max-w-6xl mx-auto py-12 text-center text-gray-400">
                <p>User account not found.</p>
            </div>
        );
    }

    // Fetch all deployments for the internal user ID
    const deployments = await deploymentService.getUserDeployments(dbUser.id);

    // Filter for deployments that have a Stripe session ID
    const paidDeployments = deployments.filter((d) => d.stripeSessionId);

    if (paidDeployments.length > 0) {
        // console.log(`[Purchases] Sample Session ID: ${paidDeployments[0].stripeSessionId}`);
    }

    // Fetch Stripe details for each deployment
    const purchases: Purchase[] = await Promise.all(
        paidDeployments.map(async (deployment) => {
            try {
                // Retrieve session and expand invoice
                const session = await stripeService.stripe.checkout.sessions.retrieve(
                    deployment.stripeSessionId,
                    {
                        expand: ["invoice"],
                    }
                );

                // Extract invoice URL
                let invoiceUrl: string | null = null;
                if (session.invoice) {
                    if (typeof session.invoice === "object") {
                        invoiceUrl = session.invoice.hosted_invoice_url || session.invoice.invoice_pdf;
                    }
                }

                // Determine status
                const status = session.payment_status; // 'paid', 'unpaid', 'no_payment_required'

                return {
                    id: session.id,
                    date: new Date(session.created * 1000),
                    description: `OpenClaw Deployment (${deployment.model})`,
                    amount: session.amount_total ? session.amount_total / 100 : 0,
                    currency: session.currency?.toUpperCase() || "USD",
                    status: status,
                    invoiceUrl,
                    deploymentId: deployment.id,
                };
            } catch (error) {
                console.error(
                    `[Purchases] Failed to fetch Stripe session for deployment ${deployment.id}:`,
                    error
                );
                // Return a partial record or null (and filter later)
                return {
                    id: deployment.stripeSessionId,
                    date: deployment.createdAt,
                    description: `OpenClaw Deployment (${deployment.model})`,
                    amount: 29.0, // Fallback
                    currency: "USD",
                    status: "unknown",
                    invoiceUrl: null,
                    deploymentId: deployment.id,
                };
            }
        })
    );

    // Sort by date desc
    purchases.sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Purchases</h1>
                <p className="text-gray-400">
                    View your payment history and download invoices
                </p>
            </div>

            <Card className="border-white/[0.06] bg-[#0e0f11]">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-medium text-white">
                                Payment History
                            </CardTitle>
                            <CardDescription className="text-gray-500">
                                All transactions associated with your account
                            </CardDescription>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-orange-500" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {purchases.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03] mb-4">
                                <FileText className="h-6 w-6 text-gray-500" />
                            </div>
                            <h3 className="text-sm font-medium text-white mb-1">
                                No purchases found
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                You haven&apos;t made any purchases yet.
                            </p>
                            <Link href="/deploy">
                                <Button>
                                    Create Deployment
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="rounded-md border border-white/[0.06] overflow-hidden">
                            <Table>
                                <TableHeader className="bg-white/[0.02]">
                                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                                        <TableHead className="text-gray-400">Item</TableHead>
                                        <TableHead className="text-gray-400">Date</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400 text-right">Amount</TableHead>
                                        <TableHead className="text-gray-400 text-right">Invoice</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchases.map((purchase) => (
                                        <TableRow key={purchase.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                                            <TableCell className="font-medium text-white">
                                                <div className="flex flex-col">
                                                    <span>{purchase.description}</span>
                                                    <span className="text-xs text-gray-500 font-normal">ID: {purchase.deploymentId.substring(0, 8)}...</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-400">
                                                {format(purchase.date, "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`
                            ${purchase.status === "paid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : ""}
                            ${purchase.status === "unpaid" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : ""}
                            ${purchase.status === "unknown" ? "bg-gray-500/10 text-gray-400 border-gray-500/20" : ""}
                          `}
                                                >
                                                    {purchase.status === "paid" ? "Paid" : purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-white">
                                                {new Intl.NumberFormat("en-US", {
                                                    style: "currency",
                                                    currency: purchase.currency,
                                                }).format(purchase.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {purchase.invoiceUrl ? (
                                                    <a
                                                        href={purchase.invoiceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Invoice
                                                        </Button>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-500">Not available</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
