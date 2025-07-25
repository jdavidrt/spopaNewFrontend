// fe/src/utils/sessionManager.js
// Enhanced session manager with robust localStorage handling
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

// Constants for localStorage keys
const USER_TYPE_KEY = 'spopa_user_type';
const USER_REGISTRATION_KEY = 'spopa_user_registered';

// Ensure USER_TYPE_KEY exists in localStorage on load
if (!localStorage.getItem(USER_TYPE_KEY)) {
    localStorage.setItem(USER_TYPE_KEY, '');
}

// Valid user types
const VALID_USER_TYPES = ['Estudiante', 'Administrativo', 'Empresa'];

// Utility functions for localStorage operations
const storage = {
    // Get user type from localStorage
    getUserType: () => {
        try {
            const userType = localStorage.getItem(USER_TYPE_KEY);
            return VALID_USER_TYPES.includes(userType) ? userType : null;
        } catch (error) {
            console.warn('Could not access localStorage for user type:', error);
            return null;
        }
    },

    // Save user type to localStorage
    setUserType: (userType) => {
        try {
            if (userType && VALID_USER_TYPES.includes(userType)) {
                localStorage.setItem(USER_TYPE_KEY, userType);
                localStorage.setItem(USER_REGISTRATION_KEY, 'true');
                return true;
            } else {
                localStorage.removeItem(USER_TYPE_KEY);
                localStorage.removeItem(USER_REGISTRATION_KEY);
                return false;
            }
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
            return false;
        }
    },

    // Check if user is registered
    isRegistered: () => {
        try {
            return localStorage.getItem(USER_REGISTRATION_KEY) === 'true' &&
                !!localStorage.getItem(USER_TYPE_KEY);
        } catch (error) {
            console.warn('Could not check registration status:', error);
            return false;
        }
    },

    // Clear all user data
    clear: () => {
        try {
            localStorage.removeItem(USER_TYPE_KEY);
            localStorage.removeItem(USER_REGISTRATION_KEY);
            return true;
        } catch (error) {
            console.warn('Could not clear localStorage:', error);
            return false;
        }
    }
};

// React hook for session management using Auth0 + localStorage
export const useSession = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [userType, setUserType] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState(false);

    // Initialize session state when Auth0 loads
    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated && user) {
                // User is authenticated, load their stored preferences
                const storedUserType = storage.getUserType();
                const isRegistered = storage.isRegistered();

                setUserType(storedUserType);
                setRegistrationStatus(isRegistered);

                console.log('Session initialized:', {
                    user: user.name,
                    userType: storedUserType,
                    isRegistered: isRegistered
                });
            } else {
                // User is not authenticated, clear state
                setUserType(null);
                setRegistrationStatus(false);
                storage.clear();
            }
            setIsInitialized(true);
        }
    }, [isAuthenticated, isLoading, user]);

    // Function to register/update user type
    const registerUser = async (selectedUserType) => {
        if (!isAuthenticated || !user) {
            throw new Error('User must be authenticated to register');
        }

        if (!VALID_USER_TYPES.includes(selectedUserType)) {
            throw new Error(`Invalid user type. Must be one of: ${VALID_USER_TYPES.join(', ')}`);
        }

        console.log('Registering user with type:', selectedUserType);

        // Save to localStorage
        const saved = storage.setUserType(selectedUserType);
        if (!saved) {
            throw new Error('Failed to save user type to local storage');
        }

        // Update state
        setUserType(selectedUserType);
        setRegistrationStatus(true);

        console.log('User registration completed:', {
            user: user.name,
            userType: selectedUserType,
            saved: saved
        });

        return {
            userType: selectedUserType,
            isRegistered: true,
            user: user
        };
    };

    // Function to update user type (alias for registerUser)
    const updateUserType = async (selectedUserType) => {
        return await registerUser(selectedUserType);
    };

    // Function to initialize session (for compatibility)
    const initializeSession = async (authUser) => {
        console.log('Initializing session for:', authUser?.name);

        if (authUser && isAuthenticated) {
            const storedUserType = storage.getUserType();
            const isRegistered = storage.isRegistered();

            if (storedUserType && isRegistered) {
                setUserType(storedUserType);
                setRegistrationStatus(true);
            }

            return {
                user: authUser,
                userType: storedUserType,
                isRegistered: isRegistered
            };
        }

        return {
            user: null,
            userType: null,
            isRegistered: false
        };
    };

    // Function to destroy session
    const destroySession = async () => {
        console.log('Destroying session...');

        storage.clear();
        setUserType(null);
        setRegistrationStatus(false);

        console.log('Session destroyed');
    };

    // Role checking functions
    const hasRole = (role) => {
        return userType === role;
    };

    const hasAnyRole = (roles) => {
        return roles.includes(userType);
    };

    // Determine states
    const needsRegistration = isAuthenticated && user && !registrationStatus;
    const isRegistered = isAuthenticated && user && registrationStatus && !!userType;

    // Session object for compatibility
    const session = {
        authenticated: isAuthenticated,
        user: user,
        userType: userType,
        isRegistered: isRegistered
    };

    // Debug logging in development
    if (process.env.NODE_ENV === 'development' && isInitialized) {
        console.log('Session State:', {
            isAuthenticated,
            user: user?.name,
            userType,
            isRegistered,
            needsRegistration,
            isInitialized
        });
    }

    return {
        // Session state
        session,
        isLoading: isLoading || !isInitialized,
        error: null,

        // Authentication state
        isAuthenticated: isAuthenticated,
        isRegistered: isRegistered,
        needsRegistration: needsRegistration,
        user: user,
        userType: userType,

        // Session functions
        initializeSession,
        registerUser,
        updateUserType,
        destroySession,
        hasRole,
        hasAnyRole,

        // Additional utilities
        validUserTypes: VALID_USER_TYPES,
        storage: storage // Expose storage utilities for advanced usage
    };
};

// Default export for compatibility
export default {
    useSession,
    VALID_USER_TYPES,
    storage
};

export function getCurrentUserId() {
    // If you store user info in localStorage/session, adjust accordingly
    const user = JSON.parse(localStorage.getItem('auth0:user'));
    return user?.sub || 'guest';
}