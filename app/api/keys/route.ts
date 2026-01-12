import { NextRequest, NextResponse } from 'next/server';
import { generateAPIKey, getUserAPIKeys, revokeAPIKey, deleteAPIKey } from '@/lib/api-keys';

// GET: List all API keys for a user
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const keys = await getUserAPIKeys(userId);

        return NextResponse.json({
            keys,
            count: keys.length,
        });
    } catch (error: any) {
        console.error('Get API keys error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch API keys' },
            { status: 500 }
        );
    }
}

// POST: Generate a new API key
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, scopes, rateLimit, expiresInDays } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Key name is required' },
                { status: 400 }
            );
        }

        // Check if user already has max keys (limit to 5 for free tier)
        const existingKeys = await getUserAPIKeys(userId);
        if (existingKeys.length >= 5) {
            return NextResponse.json(
                { error: 'Maximum API keys reached. Delete an existing key to create a new one.' },
                { status: 400 }
            );
        }

        const { key, keyData } = await generateAPIKey(
            userId,
            name,
            scopes || ['read', 'corpus'],
            rateLimit || 60,
            expiresInDays
        );

        return NextResponse.json({
            success: true,
            key, // ⚠️ This is the ONLY time the full key is returned
            keyData: {
                id: keyData.id,
                name: keyData.name,
                keyPrefix: keyData.keyPrefix,
                scopes: keyData.scopes,
                rateLimit: keyData.rateLimit,
                createdAt: keyData.createdAt,
                expiresAt: keyData.expiresAt,
            },
            message: 'Store this API key securely - it will not be shown again!',
        });
    } catch (error: any) {
        console.error('Generate API key error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate API key' },
            { status: 500 }
        );
    }
}

// DELETE: Revoke or delete an API key
export async function DELETE(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const keyId = searchParams.get('keyId');
        const permanent = searchParams.get('permanent') === 'true';

        if (!keyId) {
            return NextResponse.json(
                { error: 'Key ID is required' },
                { status: 400 }
            );
        }

        const success = permanent
            ? await deleteAPIKey(keyId, userId)
            : await revokeAPIKey(keyId, userId);

        if (!success) {
            return NextResponse.json(
                { error: 'API key not found or already revoked' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: permanent ? 'API key deleted' : 'API key revoked',
        });
    } catch (error: any) {
        console.error('Delete API key error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete API key' },
            { status: 500 }
        );
    }
}
