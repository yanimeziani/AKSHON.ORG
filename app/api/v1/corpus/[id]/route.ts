import { NextRequest, NextResponse } from 'next/server';
import { withAPIAuth, apiResponse, apiError } from '@/lib/api-middleware';
import { Storage } from '@google-cloud/storage';
import { recordDownload } from '@/lib/usage';
import { TIERS } from '@/lib/stripe';

const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
});
const bucketName = process.env.GCP_BUCKET_NAME || '';

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/corpus/[id]
 * Get metadata for a specific paper
 */
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    return withAPIAuth(request, async (keyData, usage) => {
        try {
            const params = await context.params;
            const paperId = decodeURIComponent(params.id);

            if (!bucketName) {
                return apiError('Corpus storage not configured', 503);
            }

            const file = storage.bucket(bucketName).file(paperId);
            const [exists] = await file.exists();

            if (!exists) {
                return apiError('Paper not found', 404);
            }

            const [metadata] = await file.getMetadata();

            return apiResponse({
                id: paperId,
                name: paperId.split('/').pop()?.replace('.pdf', '') || paperId,
                size: parseInt(metadata.size as string || '0'),
                contentType: metadata.contentType,
                created: metadata.timeCreated,
                updated: metadata.updated,
                customMetadata: metadata.metadata,
            });
        } catch (error: any) {
            console.error('Get paper error:', error);
            return apiError(error.message || 'Failed to fetch paper', 500);
        }
    });
}

/**
 * POST /api/v1/corpus/[id]/download
 * Get a signed download URL for a paper
 */
export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    return withAPIAuth(request, async (keyData, usage) => {
        try {
            const params = await context.params;
            const paperId = decodeURIComponent(params.id);

            // Check download limits
            const tierConfig = TIERS[usage.tier as keyof typeof TIERS];
            if (tierConfig.downloadLimit !== -1 && usage.downloadsThisMonth >= tierConfig.downloadLimit) {
                return apiError(
                    `Download limit reached (${tierConfig.downloadLimit}/month). Upgrade for more downloads.`,
                    429
                );
            }

            if (!bucketName) {
                return apiError('Corpus storage not configured', 503);
            }

            const file = storage.bucket(bucketName).file(paperId);
            const [exists] = await file.exists();

            if (!exists) {
                return apiError('Paper not found', 404);
            }

            // Generate signed URL (valid for 1 hour)
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 60 * 60 * 1000, // 1 hour
            });

            // Record the download
            await recordDownload(keyData.userId);

            return apiResponse({
                downloadUrl: signedUrl,
                expiresIn: '1 hour',
                remainingDownloads: tierConfig.downloadLimit === -1
                    ? 'unlimited'
                    : tierConfig.downloadLimit - usage.downloadsThisMonth - 1,
            });
        } catch (error: any) {
            console.error('Download paper error:', error);
            return apiError(error.message || 'Failed to generate download URL', 500);
        }
    });
}
