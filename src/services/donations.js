import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// Helper to check for demo mode
const isDemoMode = () => auth.app.options.apiKey === 'demo-api-key';

// Mock Data Storage Helper
const getMockData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setMockData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Initialize mock donations if empty
if (isDemoMode() && getMockData('demo_donations').length === 0) {
    const initialDonations = [
        {
            id: 'demo-1',
            title: 'Vintage Denim Jacket',
            type: 'Jacket',
            size: 'M',
            condition: 'Good',
            gender: 'Unisex',
            color: 'Blue',
            description: 'Classic 90s denim jacket, slightly worn but in great condition.',
            imageUrl: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=500',
            status: 'available',
            quantity: 1, // Default quantity
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            donorName: 'Sarah J.',
            donorId: 'demo_user'
        },
        {
            id: 'demo-2',
            title: 'Black Cotton T-Shirt',
            type: 'T-Shirt',
            size: 'L',
            condition: 'Like New',
            gender: "Men's",
            color: 'Black',
            description: 'Basic black tee, never worn.',
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500',
            status: 'available',
            quantity: 5, // Bulk example
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            donorName: 'Mike R.',
            donorId: 'demo_user_2'
        },
        // ... (demo-3 omitted for brevity but logic handles it)
        {
            id: 'demo-3',
            title: 'Floral Summer Dress',
            type: 'Dress',
            size: 'S',
            condition: 'Good',
            gender: "Women's",
            color: 'Red',
            description: 'Perfect for summer outings.',
            imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=500',
            status: 'available',
            quantity: 1,
            createdAt: new Date(Date.now() - 43200000).toISOString(),
            donorName: 'Emily W.',
            donorId: 'demo_user_3'
        }
    ];
    setMockData('demo_donations', initialDonations);
}

// Upload Image Helper
export async function uploadImage(file) {
    if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // For demo, we can't easily "upload", so we'll use a local object URL 
        // or a placeholder if it was a real backend.
        return URL.createObjectURL(file);
    }

    try {
        const fileRef = ref(storage, `donations/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
    } catch (error) {
        console.error('Upload image error:', error);
        throw error;
    }
}

// Create a new donation
export async function createDonation(donationData, imageFile) {
    // Ensure quantity is set
    const finalData = {
        quantity: 1,
        ...donationData
    };

    if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        let imageUrl = finalData.imageUrl;

        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
        } else if (imageUrl && imageUrl.startsWith('data:')) {
            imageUrl = finalData.imageUrl;
        }

        const newDonation = {
            id: 'demo-' + Date.now() + Math.random().toString(36).substr(2, 9),
            ...finalData,
            imageUrl,
            status: 'available',
            createdAt: new Date().toISOString(),
            claimedBy: null,
            claimedAt: null
        };

        const currentDonations = getMockData('demo_donations');
        setMockData('demo_donations', [newDonation, ...currentDonations]);
        return newDonation;
    }

    try {
        let imageUrl = finalData.imageUrl;

        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
        }

        const donation = {
            ...finalData,
            imageUrl,
            status: 'available',
            createdAt: serverTimestamp(),
            claimedBy: null,
            claimedAt: null
        };

        const docRef = await addDoc(collection(db, 'donations'), donation);
        return { id: docRef.id, ...donation };
    } catch (error) {
        console.error('Create donation error:', error);
        throw error;
    }
}

// Get all available donations
export async function getDonations() {
    if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return getMockData('demo_donations').filter(d => d.status === 'available');
    }

    try {
        const q = query(
            collection(db, 'donations'),
            where('status', '==', 'available'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Get donations error:', error);
        return [];
    }
}

// Subscribe to donations (Real-time)
export function subscribeToDonations(callback) {
    if (isDemoMode()) {
        const checkUpdates = () => {
            const donations = getMockData('demo_donations')
                .filter(d => d.status === 'available')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            callback(donations);
        };

        checkUpdates(); // Initial call
        const interval = setInterval(checkUpdates, 2000); // Poll every 2s for demo updates
        return () => clearInterval(interval);
    }

    const q = query(
        collection(db, 'donations'),
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
    }, (error) => {
        console.error("Snapshot error:", error);
    });
}

// Get user's donations
export async function getUserDonations(userId) {
    if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        // In demo mode, userId might depend on how we stored it. 
        // For simplicity, match 'demo_user' or properties
        return getMockData('demo_donations').filter(d => d.donorId === userId || d.donorId === 'demo_user');
    }

    try {
        const q = query(
            collection(db, 'donations'),
            where('donorId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Get user donations error:', error);
        return [];
    }
}

// Get user's claims
export async function getUserClaims(userId) {
    if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return getMockData('demo_donations').filter(d =>
            d.status === 'claimed' &&
            (d.claimedBy?.uid === userId || d.claimedBy?.claimerId === userId || d.claimedBy?.centerId === userId)
        );
    }

    try {
        // Standardize on querying by 'claimedBy.uid' which we will ensure is set for both users and centers
        const q = query(
            collection(db, 'donations'),
            where('status', '==', 'claimed'),
            where('claimedBy.uid', '==', userId),
            orderBy('claimedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Get user claims error:', error);
        return [];
    }
}

// Claim an item (supports partial quantity)
export async function claimItem(itemId, claimerDetails, quantityToClaim = 1) {
    if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        let donations = getMockData('demo_donations');
        const index = donations.findIndex(d => d.id === itemId);

        if (index !== -1) {
            const item = donations[index];
            const currentQty = item.quantity || 1;

            if (currentQty <= quantityToClaim) {
                // Full Claim
                donations[index] = {
                    ...item,
                    status: 'claimed',
                    claimedBy: claimerDetails,
                    claimedAt: new Date().toISOString(),
                    quantity: currentQty
                };
            } else {
                // Partial Claim - Clone Split
                const claimedPart = {
                    ...item,
                    id: 'claim-' + Date.now() + Math.random().toString(36).substr(2, 9),
                    status: 'claimed',
                    claimedBy: claimerDetails,
                    claimedAt: new Date().toISOString(),
                    quantity: quantityToClaim,
                    parentId: item.id
                };

                // Update original
                donations[index] = {
                    ...item,
                    quantity: currentQty - quantityToClaim
                };

                // Add claimed part to list (at top or bottom doesn't matter much for storage, but top for visibility)
                donations.unshift(claimedPart);
            }

            setMockData('demo_donations', donations);
            return true;
        }
        throw new Error('Item not found');
    }

    try {
        const donationRef = doc(db, 'donations', itemId);
        const snapshot = await getDoc(donationRef);

        if (!snapshot.exists()) throw new Error('Item not found');

        const data = snapshot.data();
        const currentQty = data.quantity || 1;

        if (currentQty <= quantityToClaim) {
            // Full Claim
            await updateDoc(donationRef, {
                status: 'claimed',
                claimedBy: claimerDetails,
                claimedAt: serverTimestamp(),
                quantity: currentQty // Ensure this matches what was taken
            });
        } else {
            // Partial Claim
            // 1. Decrement Original
            await updateDoc(donationRef, {
                quantity: currentQty - quantityToClaim
            });

            // 2. Create new "Claimed" document for the user
            const claimedDoc = {
                ...data,
                status: 'claimed',
                claimedBy: claimerDetails,
                claimedAt: serverTimestamp(),
                quantity: quantityToClaim,
                parentId: itemId
            };
            // Remove 'id' if it was in data, addDoc generates new one
            delete claimedDoc.id;

            await addDoc(collection(db, 'donations'), claimedDoc);
        }

        return true;
    } catch (error) {
        console.error('Claim item error:', error);
        throw error;
    }
}

// Bulk claim items (modified to accept array of objects { id, quantity })
// Also supports legacy array of strings [id1, id2] for backward compatibility
export async function bulkClaimItems(itemsToClaim, centerDetails) {
    try {
        const promises = itemsToClaim.map(item => {
            if (typeof item === 'string') {
                return claimItem(item, centerDetails, 1);
            }
            return claimItem(item.id, centerDetails, item.quantity || 1);
        });
        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('Bulk claim error:', error);
        throw error;
    }
}

// Create a bulk request
export async function createBulkRequest(requestData) {
    if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newRequest = {
            id: 'req-' + Date.now() + Math.random().toString(36).substr(2, 9),
            ...requestData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        const currentRequests = getMockData('demo_requests');
        setMockData('demo_requests', [newRequest, ...currentRequests]);
        return newRequest;
    }

    try {
        const request = {
            ...requestData,
            status: 'pending',
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'bulk_requests'), request);
        return { id: docRef.id, ...request };
    } catch (error) {
        console.error('Create bulk request error:', error);
        throw error;
    }
}

// Get donation center requests
export async function getCenterRequests(centerId) {
    if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return getMockData('demo_requests').filter(r => r.centerId === centerId);
    }

    try {
        const q = query(
            collection(db, 'bulk_requests'),
            where('centerId', '==', centerId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Get center requests error:', error);
        return [];
    }
}

