// fe/src/utils/sessionManager.js
import React, { useState, useEffect } from "react";

class SessionManager {
    constructor() {
        // Use HTTP for development to avoid SSL issues
        this.baseUrl = process.env.NODE_ENV === 'production'
            ? "https://localhost:3443"
            : "http://localhost:3001";
        this.listeners = new Set();
        this.currentSession = this.getInitialSession();

        // Add debug logging
        this.debug = process.env.NODE_ENV === 'development';

        if (this.debug) {
            console.log('🔧 SessionManager initialized:', {
                baseUrl: this.baseUrl,
                initialSession: this.currentSession
            });
        }
    }

    // Get initial session data from server injection
    getInitialSession() {
        if (typeof window !== 'undefined' && window.__INITIAL_SESSION__) {
            if (this.debug) {
                console.log('📥 Initial session from server:', window.__INITIAL_SESSION__);
            }
            return window.__INITIAL_SESSION__;
        }
        return {
            authenticated: false,
            user: null,
            userType: null,
            isRegistered: false
        };
    }

    // Add listener for session changes
    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    // Notify all listeners of session changes
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.currentSession);
            } catch (error) {
                console.error('Session listener error:', error);
            }
        });
    }

    // Make API request with credentials to session server
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}/api${endpoint}`;
        const defaultOptions = {
            credentials: 'include', // Include cookies for CORS
            mode: 'cors', // Enable CORS
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        if (this.debug) {
            console.log(`🌐 Making request: ${options.method || 'GET'} ${url}`, {
                options: { ...defaultOptions, ...options }
            });
        }

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });

            if (this.debug) {
                console.log(`📡 Response: ${response.status} ${response.statusText}`, {
                    ok: response.ok,
                    url: response.url
                });
            }

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch {
                    errorMessage = await response.text().catch(() => errorMessage);
                }
                throw new Error(errorMessage);
            }

            return response.json();
        } catch (error) {
            if (this.debug) {
                console.warn(`⚠️ Request failed: ${options.method || 'GET'} ${url}`, error.message);
            }

            // Don't throw errors for connection issues during initial load
            // This allows Auth0 to work independently
            if (error.message.includes('fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
                console.warn('Session server not available, Auth0 login will still work');
                return null;
            }

            throw error;
        }
    }

    // Test API connectivity with better error handling
    async testConnection() {
        try {
            if (this.debug) {
                console.log('🧪 Testing connection to session server...');
            }

            const response = await this.makeRequest('/test');
            if (response) {
                if (this.debug) {
                    console.log('✅ Session server connection test successful:', response);
                }
                return true;
            }
            return false;
        } catch (error) {
            if (this.debug) {
                console.warn('⚠️ Session server connection test failed, but Auth0 will still work');
            }
            return false;
        }
    }

    // Get current session from server
    async getSession() {
        try {
            if (this.debug) {
                console.log('📋 Getting session from server...');
            }

            const data = await this.makeRequest('/session');
            if (data) {
                this.currentSession = {
                    authenticated: data.authenticated,
                    user: data.user,
                    userType: data.userType,
                    isRegistered: data.isRegistered || false,
                    sessionId: data.sessionId
                };

                if (this.debug) {
                    console.log('✅ Session retrieved:', this.currentSession);
                }

                this.notifyListeners();
                return this.currentSession;
            }
        } catch (error) {
            if (this.debug) {
                console.warn('⚠️ Failed to get session, using default state');
            }
        }

        // Always return a valid session state
        this.currentSession = {
            authenticated: false,
            user: null,
            userType: null,
            isRegistered: false
        };
        this.notifyListeners();
        return this.currentSession;
    }

    // Initialize session after Auth0 authentication
    async initializeSession(user, userType = null) {
        try {
            if (this.debug) {
                console.log('🚀 Initializing session:', { user: user?.name, userType });
            }

            const data = await this.makeRequest('/session/init', {
                method: 'POST',
                body: JSON.stringify({ user, userType })
            });

            if (data) {
                this.currentSession = {
                    authenticated: true,
                    user: data.user,
                    userType: data.userType,
                    isRegistered: data.isRegistered || false,
                    sessionId: data.sessionId
                };

                if (this.debug) {
                    console.log('✅ Session initialized:', this.currentSession);
                }

                this.notifyListeners();
                return this.currentSession;
            }
        } catch (error) {
            console.error('❌ Failed to initialize session:', error);
            // Don't throw - allow the app to continue working
            this.currentSession = {
                authenticated: false,
                user: null,
                userType: null,
                isRegistered: false
            };
            this.notifyListeners();
        }
        return this.currentSession;
    }

    // Register user in microservice
    async registerUser(userType) {
        try {
            if (this.debug) {
                console.log('📝 Registering user with type:', userType);
            }

            const data = await this.makeRequest('/session/register', {
                method: 'POST',
                body: JSON.stringify({ userType })
            });

            if (data) {
                this.currentSession = {
                    ...this.currentSession,
                    userType: data.userType,
                    isRegistered: data.isRegistered
                };

                if (this.debug) {
                    console.log('✅ User registered successfully:', this.currentSession);
                }

                this.notifyListeners();
                return this.currentSession;
            }
        } catch (error) {
            console.error('❌ Failed to register user:', error);
            throw error;
        }
    }

    // Update user type
    async updateUserType(userType) {
        try {
            if (this.debug) {
                console.log('🔄 Updating user type:', userType);
            }

            const data = await this.makeRequest('/session/usertype', {
                method: 'PUT',
                body: JSON.stringify({ userType })
            });

            if (data) {
                this.currentSession = {
                    ...this.currentSession,
                    userType: data.userType
                };

                if (this.debug) {
                    console.log('✅ User type updated:', this.currentSession);
                }

                this.notifyListeners();
                return this.currentSession;
            }
        } catch (error) {
            console.error('❌ Failed to update user type:', error);
            throw error;
        }
    }

    // Destroy session
    async destroySession() {
        try {
            if (this.debug) {
                console.log('🗑️ Destroying session...');
            }

            await this.makeRequest('/session', {
                method: 'DELETE'
            });

            if (this.debug) {
                console.log('✅ Session destroyed');
            }
        } catch (error) {
            console.error('❌ Failed to destroy session:', error);
            // Continue with local cleanup even if server request fails
        }

        // Always clear local session state
        this.currentSession = {
            authenticated: false,
            user: null,
            userType: null,
            isRegistered: false
        };
        this.notifyListeners();
    }

    // Get current session state (synchronous)
    getCurrentSession() {
        return this.currentSession;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentSession.authenticated;
    }

    // Get current user
    getUser() {
        return this.currentSession.user;
    }

    // Get current user type
    getUserType() {
        return this.currentSession.userType;
    }

    // Check if user is registered
    isUserRegistered() {
        return this.currentSession.isRegistered === true;
    }

    // Check if user needs registration
    needsRegistration() {
        return this.currentSession.authenticated && !this.currentSession.isRegistered;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.currentSession.userType === role;
    }

    // Check if user has any of the specified roles
    hasAnyRole(roles) {
        return roles.includes(this.currentSession.userType);
    }
}

// Create singleton instance
const sessionManager = new SessionManager();

// React hook for using session manager
export const useSession = () => {
    const [session, setSession] = useState(sessionManager.getCurrentSession());
    const [isLoading, setIsLoading] = useState(false); // Changed to false by default
    const [error, setError] = useState(null);

    useEffect(() => {
        // Subscribe to session changes first
        const unsubscribe = sessionManager.addListener((newSession) => {
            setSession(newSession);
        });

        // Test connection but don't block if it fails
        const initializeSession = async () => {
            try {
                setError(null);

                // Test API connection first, but don't block on failure
                const connectionOk = await sessionManager.testConnection();
                if (!connectionOk) {
                    console.warn('Session server not available, but Auth0 will still work');
                }

                // Try to get existing session, but don't block on failure
                await sessionManager.getSession();
            } catch (err) {
                console.warn('Session initialization warning:', err.message);
                setError(null); // Don't show errors to user for session connectivity
            } finally {
                setIsLoading(false);
            }
        };

        initializeSession();

        return unsubscribe;
    }, []);

    return {
        session,
        isLoading,
        error,
        sessionManager,
        isAuthenticated: session.authenticated,
        isRegistered: session.isRegistered,
        needsRegistration: session.authenticated && !session.isRegistered,
        user: session.user,
        userType: session.userType,
        initializeSession: sessionManager.initializeSession.bind(sessionManager),
        registerUser: sessionManager.registerUser.bind(sessionManager),
        updateUserType: sessionManager.updateUserType.bind(sessionManager),
        destroySession: sessionManager.destroySession.bind(sessionManager),
        hasRole: sessionManager.hasRole.bind(sessionManager),
        hasAnyRole: sessionManager.hasAnyRole.bind(sessionManager)
    };
};

export default sessionManager;