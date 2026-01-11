import { NextResponse } from 'next/server';

// Blockchain explorer API endpoints
const EXPLORERS = {
    ethereum: {
        name: 'Ethereum Mainnet',
        apiUrl: 'https://api.etherscan.io/api',
        apiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
    },
    base: {
        name: 'Base',
        apiUrl: 'https://api.basescan.org/api',
        apiKey: process.env.NEXT_PUBLIC_BASESCAN_API_KEY || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY, // Fallback to Etherscan
    },
    arbitrum: {
        name: 'Arbitrum',
        apiUrl: 'https://api.arbiscan.io/api',
        apiKey: process.env.NEXT_PUBLIC_ARBISCAN_API_KEY || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY, // Fallback to Etherscan
    },
    polygon: {
        name: 'Polygon',
        apiUrl: 'https://api.polygonscan.com/api',
        apiKey: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY,
    },
};

// Map network names to explorer configs
const NETWORK_MAP: Record<string, keyof typeof EXPLORERS> = {
    'Mainnet': 'ethereum',
    'Base': 'base',
    'Arbitrum': 'arbitrum',
    'Polygon': 'polygon',
};

export async function POST(req: Request) {
    try {
        const { txHash, network, expectedAddress } = await req.json();

        if (!txHash || !network) {
            return NextResponse.json(
                { error: 'Missing required parameters', verified: false },
                { status: 400 }
            );
        }

        // Get the appropriate explorer config
        const explorerKey = NETWORK_MAP[network] || 'ethereum';
        const explorer = EXPLORERS[explorerKey];

        if (!explorer.apiKey) {
            // If no API key is configured, log the transaction but don't verify
            console.warn(`No API key configured for ${network}, skipping verification`);
            return NextResponse.json({
                verified: false,
                status: 'pending',
                message: 'Transaction submitted. Verification pending manual review.',
                txHash,
                network,
            });
        }

        // Verify transaction using blockchain explorer API
        const url = `${explorer.apiUrl}?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${explorer.apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        // Check if transaction exists and is successful
        if (data.status === '1' && data.result?.status === '1') {
            // Transaction exists and is successful
            // Now fetch transaction details to verify the recipient
            const detailsUrl = `${explorer.apiUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${explorer.apiKey}`;
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();

            if (detailsData.result) {
                const txDetails = detailsData.result;
                const recipientAddress = txDetails.to?.toLowerCase();
                const expectedAddr = expectedAddress?.toLowerCase();

                // Verify recipient matches expected address
                if (expectedAddr && recipientAddress !== expectedAddr) {
                    return NextResponse.json({
                        verified: false,
                        status: 'invalid',
                        message: 'Transaction recipient does not match expected address',
                        txHash,
                        network,
                        recipientAddress,
                        expectedAddress: expectedAddr,
                    }, { status: 400 });
                }

                return NextResponse.json({
                    verified: true,
                    status: 'confirmed',
                    message: 'Transaction verified successfully',
                    txHash,
                    network,
                    blockNumber: txDetails.blockNumber,
                    from: txDetails.from,
                    to: txDetails.to,
                    value: txDetails.value,
                    gasUsed: txDetails.gas,
                });
            }
        } else if (data.status === '1' && data.result?.status === '0') {
            // Transaction failed
            return NextResponse.json({
                verified: false,
                status: 'failed',
                message: 'Transaction failed on blockchain',
                txHash,
                network,
            }, { status: 400 });
        } else {
            // Transaction not found or pending
            return NextResponse.json({
                verified: false,
                status: 'pending',
                message: 'Transaction not found or still pending confirmation',
                txHash,
                network,
            });
        }

        return NextResponse.json({
            verified: false,
            status: 'unknown',
            message: 'Unable to verify transaction',
            txHash,
            network,
        });

    } catch (error: any) {
        console.error('Error verifying crypto transaction:', error);
        return NextResponse.json(
            {
                error: 'Failed to verify transaction',
                message: error.message,
                verified: false,
            },
            { status: 500 }
        );
    }
}
