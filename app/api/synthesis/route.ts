import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limitParam = parseInt(searchParams.get('limit') || '10', 10);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');

        // Build query
        let insightsQuery = query(
            collection(db, 'insights'),
            orderBy('publishedAt', 'desc'),
            limit(limitParam)
        );

        // Add filters if provided
        if (category) {
            insightsQuery = query(
                collection(db, 'insights'),
                where('category', '==', category),
                orderBy('publishedAt', 'desc'),
                limit(limitParam)
            );
        }

        if (featured === 'true') {
            insightsQuery = query(
                collection(db, 'insights'),
                where('featured', '==', true),
                orderBy('publishedAt', 'desc'),
                limit(limitParam)
            );
        }

        // Fetch data from Firestore
        const snapshot = await getDocs(insightsQuery);

        const insights = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                summary: data.description,
                confidence: `${data.confidence}%`,
                source: data.sources?.[0]?.title || 'Research Synthesis',
                timestamp: data.publishedAt?.toDate?.().toISOString() || new Date().toISOString(),
                category: data.category,
                tags: data.tags || [],
                impact: data.impact,
                featured: data.featured || false,
            };
        });

        return NextResponse.json({
            insights,
            count: insights.length,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Error fetching insights from Firestore:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch insights',
                message: error.message,
                insights: [] // Return empty array on error
            },
            { status: 500 }
        );
    }
}
