import { nanoid } from 'nanoid';
import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface APIKey {
    id: string;
    userId: string;
    key: string;           // The actual API key (hashed in storage, plain in response)
    keyPrefix: string;     // First 8 chars for display: "aksh_xxxx..."
    name: string;          // User-defined name
    createdAt: Timestamp;
    lastUsed: Timestamp | null;
    expiresAt: Timestamp | null;
    isActive: boolean;
    scopes: string[];      // ['read', 'write', 'corpus', 'synthesis']
    rateLimit: number;     // Requests per minute
    usageCount: number;    // Total API calls
}

const API_KEYS_COLLECTION = 'apiKeys';

/**
 * Generate a new API key for a user
 */
export async function generateAPIKey(
    userId: string,
    name: string,
    scopes: string[] = ['read', 'corpus'],
    rateLimit: number = 60,
    expiresInDays?: number
): Promise<{ key: string; keyData: APIKey }> {
    // Generate a secure API key: aksh_<32-char-nanoid>
    const rawKey = `aksh_${nanoid(32)}`;
    const keyPrefix = rawKey.substring(0, 12);

    // In a production system, you'd hash this key before storing
    // For now, we store it (Firebase rules should protect it)
    const keyId = nanoid(16);

    const keyData: APIKey = {
        id: keyId,
        userId,
        key: rawKey, // In production: hash this
        keyPrefix,
        name,
        createdAt: Timestamp.now(),
        lastUsed: null,
        expiresAt: expiresInDays
            ? Timestamp.fromDate(new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000))
            : null,
        isActive: true,
        scopes,
        rateLimit,
        usageCount: 0,
    };

    await setDoc(doc(db, API_KEYS_COLLECTION, keyId), keyData);

    return { key: rawKey, keyData };
}

/**
 * Validate an API key and return the associated user data
 */
export async function validateAPIKey(apiKey: string): Promise<{ valid: boolean; keyData?: APIKey; error?: string }> {
    if (!apiKey || !apiKey.startsWith('aksh_')) {
        return { valid: false, error: 'Invalid API key format' };
    }

    // Find the key in the database
    const q = query(
        collection(db, API_KEYS_COLLECTION),
        where('key', '==', apiKey),
        where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return { valid: false, error: 'API key not found or revoked' };
    }

    const keyData = snapshot.docs[0].data() as APIKey;

    // Check expiration
    if (keyData.expiresAt && keyData.expiresAt.toDate() < new Date()) {
        return { valid: false, error: 'API key expired' };
    }

    // Update last used timestamp
    await updateDoc(doc(db, API_KEYS_COLLECTION, keyData.id), {
        lastUsed: serverTimestamp(),
        usageCount: keyData.usageCount + 1,
    });

    return { valid: true, keyData };
}

/**
 * Get all API keys for a user
 */
export async function getUserAPIKeys(userId: string): Promise<APIKey[]> {
    const q = query(
        collection(db, API_KEYS_COLLECTION),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => {
        const data = d.data() as APIKey;
        // Hide the full key, only show prefix
        return { ...data, key: `${data.keyPrefix}...` };
    });
}

/**
 * Revoke an API key
 */
export async function revokeAPIKey(keyId: string, userId: string): Promise<boolean> {
    const keyDoc = await getDoc(doc(db, API_KEYS_COLLECTION, keyId));

    if (!keyDoc.exists()) {
        return false;
    }

    const keyData = keyDoc.data() as APIKey;

    // Ensure the key belongs to the requesting user
    if (keyData.userId !== userId) {
        return false;
    }

    await updateDoc(doc(db, API_KEYS_COLLECTION, keyId), {
        isActive: false,
    });

    return true;
}

/**
 * Delete an API key permanently
 */
export async function deleteAPIKey(keyId: string, userId: string): Promise<boolean> {
    const keyDoc = await getDoc(doc(db, API_KEYS_COLLECTION, keyId));

    if (!keyDoc.exists()) {
        return false;
    }

    const keyData = keyDoc.data() as APIKey;

    if (keyData.userId !== userId) {
        return false;
    }

    await deleteDoc(doc(db, API_KEYS_COLLECTION, keyId));
    return true;
}
