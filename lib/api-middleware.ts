import { NextRequest, NextResponse } from 'next/server';
import { validateAPIKey } from '@/lib/api-keys';
import { canMakeAPICall, recordAPICall, getUsageRecord } from '@/lib/usage';

/**
 * Middleware helper to validate API key and check usage limits
 */
export async function withAPIAuth(
    request: NextRequest,
    handler: (keyData: any, usage: any) => Promise<NextResponse>
): Promise<NextResponse> {
    const startTime = Date.now();

    // Extract API key from header
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (!apiKey) {
        return NextResponse.json(
            {
                error: 'API key required',
                hint: 'Include your API key in the Authorization header: Bearer aksh_...'
            },
            { status: 401 }
        );
    }

    // Validate API key
    const { valid, keyData, error } = await validateAPIKey(apiKey);

    if (!valid || !keyData) {
        return NextResponse.json(
            { error: error || 'Invalid API key' },
            { status: 401 }
        );
    }

    // Check usage limits
    const usageCheck = await canMakeAPICall(keyData.userId);

    if (!usageCheck.allowed) {
        return NextResponse.json(
            {
                error: usageCheck.error,
                remaining: usageCheck.remaining,
                limit: usageCheck.limit,
                upgrade_url: 'https://akshon.org/pricing'
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': String(usageCheck.limit),
                    'X-RateLimit-Remaining': '0',
                    'Retry-After': '3600',
                }
            }
        );
    }

    // Get full usage record
    const usage = await getUsageRecord(keyData.userId);

    // Execute the actual handler
    const response = await handler(keyData, usage);

    // Record the API call
    const endpoint = new URL(request.url).pathname;
    const responseTime = Date.now() - startTime;
    await recordAPICall(keyData.userId, endpoint, responseTime);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', String(usageCheck.limit));
    response.headers.set('X-RateLimit-Remaining', String(usageCheck.remaining));
    response.headers.set('X-Response-Time', `${responseTime}ms`);

    return response;
}

/**
 * Create standardized API response
 */
export function apiResponse<T>(data: T, status: number = 200): NextResponse<{ success: boolean; data: T; timestamp: string }> {
    return NextResponse.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
    }, { status });
}

/**
 * Create standardized error response
 */
export function apiError(message: string, status: number = 400, details?: Record<string, any>): NextResponse {
    return NextResponse.json({
        success: false,
        error: message,
        details,
        timestamp: new Date().toISOString(),
    }, { status });
}
