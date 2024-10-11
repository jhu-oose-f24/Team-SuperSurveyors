// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

// Create AuthContext
const auth = getAuth();
const AuthContext = createContext();

// Custom hook to access auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check user authentication status
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        // Cleanup on unmount
        return unsubscribe;
    }, []);

    const value = {
        currentUser, // Current logged-in user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Only render children after loading */}
        </AuthContext.Provider>
    );
};
