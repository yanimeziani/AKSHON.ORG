import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

// Helper function to format file size
function formatFileSize(bytes?: number): string {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    const gb = bytes / (1024 * 1024 * 1024);

    if (gb >= 1) {
        return `${gb.toFixed(1)} GB`;
    } else if (mb >= 1) {
        return `${mb.toFixed(1)} MB`;
    } else {
        return `${(bytes / 1024).toFixed(0)} KB`;
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limitParam = parseInt(searchParams.get('limit') || '20', 10);
        const category = searchParams.get('category');
        const tier = searchParams.get('tier');
        const featured = searchParams.get('featured');

        // Build query
        let datasetsQuery = query(
            collection(db, 'dataset_packs'),
            orderBy('lastUpdated', 'desc'),
            limit(limitParam)
        );

        // Add filters if provided
        if (category) {
            datasetsQuery = query(
                collection(db, 'dataset_packs'),
                where('category', '==', category),
                orderBy('lastUpdated', 'desc'),
                limit(limitParam)
            );
        }

        if (tier) {
            datasetsQuery = query(
                collection(db, 'dataset_packs'),
                where('tier', '==', tier),
                orderBy('lastUpdated', 'desc'),
                limit(limitParam)
            );
        }

        if (featured === 'true') {
            datasetsQuery = query(
                collection(db, 'dataset_packs'),
                where('featured', '==', true),
                orderBy('lastUpdated', 'desc'),
                limit(limitParam)
            );
        }

        // Fetch data from Firestore
        const snapshot = await getDocs(datasetsQuery);

        const datasets = snapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                title: data.name,
                description: data.description,
                size: formatFileSize(data.totalSize),
                items: `${data.fileCount?.toLocaleString() || 'N/A'} Files`,
                tags: data.tags || [],
                mcpId: `mcp://akshon.org/d/${doc.id}`,
                category: data.category,
                tier: data.tier,
                downloadUrl: data.downloadUrl,
                gcpPath: data.gcpPath,
                format: data.format || [],
                lastUpdated: data.lastUpdated?.toDate?.().toISOString() || new Date().toISOString(),
                featured: data.featured || false,
                schemaUrl: data.schemaUrl,
                sampleDataUrl: data.sampleDataUrl,
                documentation: data.documentation,
            };
        });

        return NextResponse.json({
            datasets,
            count: datasets.length,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Error fetching datasets from Firestore:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch datasets',
                message: error.message,
                datasets: [] // Return empty array on error
            },
            { status: 500 }
        );
    }
}
