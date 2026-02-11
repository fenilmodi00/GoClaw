import { eq, and, sql } from 'drizzle-orm';
import { db } from '../index';
import { deployments, type Deployment, type NewDeployment } from '../schema';
import { v4 as uuidv4 } from 'uuid';

export type DeploymentStatus = 'pending' | 'deploying' | 'active' | 'failed';

export interface CreateDeploymentInput {
    id?: string;
    userId: string;
    email: string;
    model: string;
    channel: string;
    channelToken: string;
    channelApiKey?: string;
    stripeSessionId?: string;
    paymentProvider?: 'stripe' | 'polar';
    polarId?: string;
}

export interface UpdateDeploymentStatusInput {
    akashDeploymentId?: string;
    akashLeaseId?: string;
    providerUrl?: string;
    errorMessage?: string;
    stripePaymentIntentId?: string;
    paymentProvider?: 'stripe' | 'polar';
}

export class DeploymentRepository {
    /**
     * Creates a new deployment record
     */
    async create(input: CreateDeploymentInput): Promise<Deployment> {
        const id = input.id || uuidv4();
        const now = new Date();

        const newDeployment: NewDeployment = {
            id,
            ...input,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        };

        const results = await db.insert(deployments).values(newDeployment).returning();
        return results[0];
    }

    /**
     * Finds a deployment by its ID
     */
    async findById(id: string): Promise<Deployment | null> {
        const results = await db.select().from(deployments).where(eq(deployments.id, id)).limit(1);
        return results[0] || null;
    }

    /**
     * Finds a deployment by Stripe session ID
     */
    async findByStripeSession(sessionId: string): Promise<Deployment | null> {
        const results = await db
            .select()
            .from(deployments)
            .where(eq(deployments.stripeSessionId, sessionId))
            .limit(1);
        return results[0] || null;
    }

    /**
     * Gets all deployments for a specific user
     */
    async findByUserId(userId: string): Promise<Deployment[]> {
        return db
            .select()
            .from(deployments)
            .where(eq(deployments.userId, userId))
            .orderBy(sql`${deployments.createdAt} DESC`);
    }

    /**
     * Checks for a pending duplicate deployment
     */
    async findPendingDuplicate(
        userId: string,
        model: string,
        channel: string,
        channelToken: string
    ): Promise<Deployment | null> {
        const results = await db
            .select()
            .from(deployments)
            .where(
                and(
                    eq(deployments.userId, userId),
                    eq(deployments.model, model),
                    eq(deployments.channel, channel),
                    eq(deployments.channelToken, channelToken),
                    eq(deployments.status, 'pending')
                )
            )
            .limit(1);
        return results[0] || null;
    }

    /**
     * Updates the status and details of a deployment
     */
    async updateStatus(
        id: string,
        status: DeploymentStatus,
        details?: UpdateDeploymentStatusInput
    ): Promise<void> {
        await db
            .update(deployments)
            .set({
                status,
                ...details,
                updatedAt: new Date(),
            })
            .where(eq(deployments.id, id));
    }
}

/**
 * Singleton instance of the DeploymentRepository
 */
let _repository: DeploymentRepository | null = null;

export function getDeploymentRepository(): DeploymentRepository {
    if (!_repository) {
        _repository = new DeploymentRepository();
    }
    return _repository;
}
