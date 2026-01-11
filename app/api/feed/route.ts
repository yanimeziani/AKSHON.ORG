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
        const tag = searchParams.get('tag');

        // Build query
        let feedQuery = query(
            collection(db, 'research_feed'),
            orderBy('publishedAt', 'desc'),
            limit(limitParam)
        );

        // Add filters if provided
        if (category) {
            feedQuery = query(
                collection(db, 'research_feed'),
                where('category', '==', category),
                orderBy('publishedAt', 'desc'),
                limit(limitParam)
            );
        }

        if (tag) {
            feedQuery = query(
                collection(db, 'research_feed'),
                where('tags', 'array-contains', tag),
                orderBy('publishedAt', 'desc'),
                limit(limitParam)
            );
        }

        // Fetch data from Firestore
        const snapshot = await getDocs(feedQuery);

        const feed = snapshot.docs.map(doc => {
            const data = doc.data();

            // Determine type based on available fields
            let type = 'PDF';
            if (data.pdfUrl) {
                type = 'PDF';
            } else if (data.doi && !data.pdfUrl) {
                type = 'Article';
            }

            return {
                id: doc.id,
                title: data.title,
                type,
                timestamp: data.publishedAt?.toDate?.().toISOString() || new Date().toISOString(),
                size: formatFileSize(data.fileSize),
                tags: data.tags || [],
                authors: data.authors || [],
                abstract: data.abstract || data.summary || '',
                category: data.category,
                arxivId: data.arxivId,
                doi: data.doi,
                pdfUrl: data.pdfUrl,
                citationCount: data.citationCount || 0,
                relevanceScore: data.relevanceScore,
                featured: data.featured || false,
            };
        });

        return NextResponse.json({
            feed,
            count: feed.length,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Error fetching research feed from Firestore:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch research feed',
                message: error.message,
                feed: [] // Return empty array on error
            },
            { status: 500 }
        );
    }
}
