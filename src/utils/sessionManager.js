// fe/src/utils/sessionManager.js
// Simplified session manager that only uses Auth0, no server-side sessions
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

// Simple user type storage in localStorage for persistence
const USER_TYPE_KEY = 'spopa_user_type';

// Get user type from localStorage
const getUserTypeFromStorage = () => {
    try {
        return localStorage.getItem(USER_TYPE_KEY);
    } catch (error) {
        console.warn('Could not access localStorage:', error);
        return null;
    }
};

// Save user type to localStorage
const saveUserTypeToStorage = (userType) => {
    try {
        if (userType) {
            localStorage.setItem(USER_TYPE_KEY, userType);
        } else {
            localStorage.removeItem(USER_TYPE_KEY);
        }
    } catch (error) {
        console.warn('Could not save to localStorage:', error);
    }
};

// React hook for simplified session management using only Auth0
export const useSession = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [userType, setUserType] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize user type from storage when Auth0 loads
    useEffect(() => {
        if (!isLoading && isAuthenticated && user && !isInitialized) {
            const storedUserType = getUserTypeFromStorage();
            if (storedUserType) {
                setUserType(storedUserType);
            }
            setIsInitialized(true);
        } else if (!isLoading && !isAuthenticated) {
            // Clear user type when not authenticated
            setUserType(null);
            saveUserTypeToStorage(null);
            setIsInitialized(true);
        }
    }, [isAuthenticated, isLoading, user, isInitialized]);

    // Function to register/update user type
    const registerUser = async (selectedUserType) => {
        if (!isAuthenticated || !user) {
            throw new Error('User must be authenticated to register');
        }

        const validUserTypes = ['Estudiante', 'Administrativo', 'Empresa'];
        if (!validUserTypes.includes(selectedUserType)) {
            throw new Error('Invalid user type');
        }

        setUserType(selectedUserType);
        saveUserTypeToStorage(selectedUserType);
        return { userType: selectedUserType };
    };

    // Function to update user type
    const updateUserType = async (selectedUserType) => {
        return await registerUser(selectedUserType);
    };

    // Function to initialize session (simplified - just ensures user type is loaded)
    const initializeSession = async (authUser) => {
        if (authUser && !userType) {
            const storedUserType = getUserTypeFromStorage();
            if (storedUserType) {
                setUserType(storedUserType);
            }
        }
        return { user: authUser, userType };
    };

    // Function to destroy session (just clears local state)
    const destroySession = async () => {
        setUserType(null);
        saveUserTypeToStorage(null);
    };

    // Check if user has specific role
    const hasRole = (role) => {
        return userType === role;
    };

    // Check if user has any of the specified roles
    const hasAnyRole = (roles) => {
        return roles.includes(userType);
    };

    // Determine if user needs registration
    const needsRegistration = isAuthenticated && user && !userType;

    // Session object for compatibility
    const session = {
        authenticated: isAuthenticated,
        user: user,
        userType: userType,
        isRegistered: !!userType
    };

    return {
        // Session state
        session,
        isLoading: isLoading,
        error: null,

        // Authentication state
        isAuthenticated: isAuthenticated,
        isRegistered: !!userType,
        needsRegistration: needsRegistration,
        user: user,
        userType: userType,

        // Session functions
        initializeSession,
        registerUser,
        updateUserType,
        destroySession,
        hasRole,
        hasAnyRole
    };
};

// Default export for compatibility
export default {
    useSession
};