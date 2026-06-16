import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        console.log('AuthProvider: Initializing...');
        // Check if we are in demo mode
        const apiKey = auth.app.options.apiKey;
        if (apiKey === 'demo-api-key') {
            setIsDemo(true);
            console.log('AuthProvider: Running in DEMO MODE');

            // Restore demo session
            const storedUser = localStorage.getItem('demo_user');
            const storedProfile = localStorage.getItem('demo_profile');
            if (storedUser && storedProfile) {
                console.log('AuthProvider: Restored Demo User from localStorage');
                setCurrentUser(JSON.parse(storedUser));
                setUserProfile(JSON.parse(storedProfile));
            }
            setLoading(false);
        } else {
            console.log('AuthProvider: Running in REAL FIREBASE MODE');
            // Real Firebase Auth
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                console.log('AuthProvider: AuthStateChanged ->', user ? user.uid : 'No User');
                setCurrentUser(user);
                if (user) {
                    await fetchUserProfile(user.uid);
                } else {
                    setUserProfile(null);
                }
                setLoading(false);
            });
            return unsubscribe;
        }
    }, []);

    // Sign up
    async function signup(email, password, name, userType = 'individual', orgDetails = {}) {
        console.log('AuthProvider: Signup called', { email, name, userType });
        if (isDemo) {
            // Mock Signup
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

            const mockUser = {
                uid: 'demo-' + Date.now(),
                email,
                displayName: name,
                emailVerified: true
            };

            const mockProfile = {
                uid: mockUser.uid,
                email: email,
                displayName: name,
                userType,
                points: 0,
                level: 'Newcomer',
                badges: [],
                donationsCount: 0,
                claimsCount: 0,
                createdAt: new Date().toISOString(),
                ...orgDetails
            };

            console.log('AuthProvider: Saving Mock Profile', mockProfile);
            setCurrentUser(mockUser);
            setUserProfile(mockProfile);

            localStorage.setItem('demo_user', JSON.stringify(mockUser));
            localStorage.setItem('demo_profile', JSON.stringify(mockProfile));

            return mockUser;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('AuthProvider: Firebase User Created', user.uid);

            // Update display name
            await updateProfile(user, { displayName: name });

            // Create user document in Firestore
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: name,
                userType, // 'individual' or 'donation_center'
                points: 0,
                level: 'Newcomer',
                badges: [],
                donationsCount: 0,
                claimsCount: 0,
                createdAt: new Date().toISOString(),
                ...orgDetails
            };

            console.log('AuthProvider: Saving Firestore Profile...', userData);
            await setDoc(doc(db, 'users', user.uid), userData);
            console.log('AuthProvider: Firestore Profile Saved.');

            setUserProfile(userData);

            return user;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    // Login
    async function login(email, password) {
        if (isDemo) {
            // Mock Login
            await new Promise(resolve => setTimeout(resolve, 600));

            const emailKey = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const userKey = `demo_user_${emailKey}`;
            const profileKey = `demo_profile_${emailKey}`;

            // Check for existing demo session for THIS email
            const storedUserStr = localStorage.getItem(userKey);
            const storedProfileStr = localStorage.getItem(profileKey);

            let mockUser = null;
            let mockProfile = null;

            if (storedUserStr) {
                console.log('AuthProvider: Demo Login - Restoring existing user for', email);
                mockUser = JSON.parse(storedUserStr);
                mockProfile = storedProfileStr ? JSON.parse(storedProfileStr) : null;
            } else {
                // If not found, check legacy 'demo_user' purely for migration? 
                // No, cleanly separate. If not found, create NEW session for this email.
                console.log('AuthProvider: Demo Login - Creating new session for', email);
                mockUser = {
                    uid: 'demo-' + Date.now(),
                    email,
                    displayName: email.split('@')[0],
                    emailVerified: true
                };

                mockProfile = {
                    uid: mockUser.uid,
                    email: email,
                    displayName: mockUser.displayName,
                    userType: 'individual',
                    points: 100,
                    level: 'Contributor',
                    badges: [],
                    donationsCount: 0,
                    claimsCount: 0,
                    createdAt: new Date().toISOString()
                };
            }

            // Ensure profile exists
            if (!mockProfile) {
                mockProfile = {
                    uid: mockUser.uid,
                    email: email,
                    displayName: mockUser.displayName || 'User',
                    userType: 'individual',
                    points: 100,
                    createdAt: new Date().toISOString()
                };
            }

            setCurrentUser(mockUser);
            setUserProfile(mockProfile);

            // Save to namespaced keys
            localStorage.setItem(userKey, JSON.stringify(mockUser));
            localStorage.setItem(profileKey, JSON.stringify(mockProfile));

            // Save as 'current' generic session for simple restores if needed, but better to track last email
            localStorage.setItem('demo_last_email', email);

            // Also update legacy keys just so page refresh (using old logic) doesn't break immediately until I fix useEffect
            localStorage.setItem('demo_user', JSON.stringify(mockUser));
            localStorage.setItem('demo_profile', JSON.stringify(mockProfile));

            return mockUser;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Logout
    async function logout() {
        if (isDemo) {
            await new Promise(resolve => setTimeout(resolve, 300));
            setCurrentUser(null);
            setUserProfile(null);
            // Do NOT clear localStorage for demo_user/demo_profile to allow persistence across sessions
            return;
        }

        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    // Update user profile
    async function updateUserProfile(data) {
        if (isDemo) {
            const newProfile = { ...userProfile, ...data };
            setUserProfile(newProfile);
            localStorage.setItem('demo_profile', JSON.stringify(newProfile));
            return;
        }

        if (!currentUser) return;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, data);
            setUserProfile(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    // Add points - (Deprecated for donations, use recordDonation instead)
    async function addPoints(points) {
        if (!currentUser || !userProfile) return;

        const newPoints = (userProfile.points || 0) + points;
        let newLevel = 'Newcomer';

        if (newPoints > 300) newLevel = 'Sustainability Champion';
        else if (newPoints > 150) newLevel = 'Eco Warrior';
        else if (newPoints > 50) newLevel = 'Contributor';

        await updateUserProfile({
            points: newPoints,
            level: newLevel
        });
    }

    // Atomic update for recording a donation (Points + Count)
    async function recordDonation(pointsEarned = 10) {
        if (!currentUser || !userProfile) return;

        const newPoints = (userProfile.points || 0) + pointsEarned;
        const newCount = (userProfile.donationsCount || 0) + 1;

        let newLevel = 'Newcomer';
        if (newPoints > 300) newLevel = 'Sustainability Champion';
        else if (newPoints > 150) newLevel = 'Eco Warrior';
        else if (newPoints > 50) newLevel = 'Contributor';

        // Single atomic update
        await updateUserProfile({
            points: newPoints,
            level: newLevel,
            donationsCount: newCount
        });
    }

    // Get user profile from Firestore
    async function fetchUserProfile(uid) {
        console.log('AuthProvider: Fetching profile for', uid);
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                console.log('AuthProvider: Profile Found', userDoc.data());
                setUserProfile(userDoc.data());
            } else {
                console.warn('AuthProvider: Profile NOT found in Firestore');
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        }
    }

    const value = {
        currentUser,
        userProfile,
        signup,
        login,
        logout,
        updateUserProfile,
        addPoints,
        recordDonation,
        loading,
        isDemo // Exporting this so components can know they are in demo mode
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
