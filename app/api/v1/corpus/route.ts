import { NextRequest, NextResponse } from 'next/server';
import { withAPIAuth, apiResponse, apiError } from '@/lib/api-middleware';
import { Storage } from '@google-cloud/storage';

// Initialize GCP Storage
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
});
const bucketName = process.env.GCP_BUCKET_NAME || '';

/**
 * GET /api/v1/corpus
 * List available research papers in the corpus
 * 
 * Query params:
 * - limit: number (default 20, max 100)
 * - offset: number (default 0)
 * - category: string (filter by category)
 * - search: string (search in titles)
 */
export async function GET(request: NextRequest) {
    return withAPIAuth(request, async (keyData, usage) => {
        try {
            const { searchParams } = new URL(request.url);
            const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
            const offset = parseInt(searchParams.get('offset') || '0');
            const category = searchParams.get('category');
            const search = searchParams.get('search')?.toLowerCase();

            if (!bucketName) {
                return apiError('Corpus storage not configured', 503);
            }

            // List files from GCP bucket
            const [files] = await storage.bucket(bucketName).getFiles({
                prefix: 'corpus/',
                maxResults: 500, // Fetch more for filtering
            });

            // Transform and filter files
            let papers = files.map(file => {
                const metadata = file.metadata;
                return {
                    id: file.name,
                    name: file.name.split('/').pop()?.replace('.pdf', '') || file.name,
                    category: metadata?.metadata?.category || 'uncategorized',
                    size: parseInt(metadata.size as string || '0'),
                    contentType: metadata.contentType,
                    created: metadata.timeCreated,
                    updated: metadata.updated,
                };
            });

            // Apply filters
            if (category) {
                papers = papers.filter(p => p.category === category);
            }
            if (search) {
                papers = papers.filter(p => p.name.toLowerCase().includes(search));
            }

            // Apply pagination
            const total = papers.length;
            const paginatedPapers = papers.slice(offset, offset + limit);

            return apiResponse({
                papers: paginatedPapers,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total,
                },
                tier: usage.tier,
            });
        } catch (error: any) {
            console.error('Corpus list error:', error);
            return apiError(error.message || 'Failed to fetch corpus', 500);
        }
    });
}

/**
 * POST /api/v1/corpus
 * Upload a new research paper (requires write scope)
 */
export async function POST(request: NextRequest) {
    return withAPIAuth(request, async (keyData, usage) => {
        // Check for write scope
        if (!keyData.scopes.includes('write')) {
            return apiError('Write access required. Generate an API key with "write" scope.', 403);
        }

        // Check tier for upload permissions
        if (usage.tier === 'FREE') {
            return apiError('Corpus uploads require a paid subscription', 403);
        }

        try {
            const formData = await request.formData();
            const file = formData.get('file') as File;
            const category = formData.get('category') as string || 'user-uploads';

            if (!file) {
                return apiError('No file provided', 400);
            }

            if (file.type !== 'application/pdf') {
                return apiError('Only PDF files are supported', 400);
            }

            const maxSize = 50 * 1024 * 1024; // 50MB
            if (file.size > maxSize) {
                return apiError('File too large. Maximum size is 50MB', 400);
            }

            // Upload to GCP
            const filename = `corpus/${category}/${Date.now()}-${file.name}`;
            const bucket = storage.bucket(bucketName);
            const blob = bucket.file(filename);

            const buffer = Buffer.from(await file.arrayBuffer());
            await blob.save(buffer, {
                metadata: {
                    contentType: 'application/pdf',
                    metadata: {
                        category,
                        uploadedBy: keyData.userId,
                        uploadedAt: new Date().toISOString(),
                    },
                },
            });

            return apiResponse({
                success: true,
                file: {
                    id: filename,
                    name: file.name,
                    category,
                    size: file.size,
                },
                message: 'Paper uploaded successfully',
            }, 201);
        } catch (error: any) {
            console.error('Corpus upload error:', error);
            return apiError(error.message || 'Failed to upload paper', 500);
        }
    });
}
