// fe/src/components/Hero.js
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSession } from "../utils/sessionManager";
import logo from "../assets/SPOPALogo.png";

const Hero = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const {
    session,
    initializeSession,
    registerUser,
    isAuthenticated: sessionAuthenticated,
    needsRegistration
  } = useSession();

  const [isInitializingSession, setIsInitializingSession] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  const roles = ["Estudiante", "Administrativo"];

  // Initialize server session when Auth0 authentication completes
  useEffect(() => {
    const initSession = async () => {
      // Only try to initialize session if user is authenticated and we haven't already initialized
      if (isAuthenticated && user && !sessionAuthenticated && !isInitializingSession) {
        setIsInitializingSession(true);
        setSessionError(null);

        try {
          await initializeSession(user);
          console.log('Session initialized successfully');
        } catch (error) {
          console.warn('Failed to initialize session, but app will continue working:', error);
          // Don't block the UI - let user continue even if session init fails
          setSessionError('Session service unavailable. Some features may be limited.');
        } finally {
          setIsInitializingSession(false);
        }
      }
    };

    // Don't block on loading - allow Auth0 to work independently
    if (!isLoading) {
      initSession();
    }
  }, [isAuthenticated, user, sessionAuthenticated, isInitializingSession, isLoading, initializeSession]);

  const handleRoleSelect = async (role) => {
    setSessionError(null);
    setIsRegistering(true);

    try {
      await registerUser(role);
      console.log(`User registered with role: ${role}`);
    } catch (error) {
      console.error('Failed to register user:', error);
      setSessionError('Failed to register user. Please try again or contact support.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Show loading state only for Auth0, not session initialization
  if (isLoading) {
    return (
      <div className="text-center hero my-5">
        <img className="mb-3 app-logo" src={logo} alt="SPOPA logo" width="120" />
        <h1 className="mb-4">SPOPA</h1>
        <div className="mb-4">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center hero my-5">
      {/* Show session initialization status if needed */}
      {isInitializingSession && (
        <div className="mb-3">
          <div className="spinner-border spinner-border-sm text-info" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <small className="text-muted ml-2">Initializing session...</small>
        </div>
      )}

      {/* Show session error as warning, not blocking error */}
      {sessionError && (
        <div className="mb-4">
          <div className="alert alert-warning" role="alert">
            <small>
              <strong>Warning:</strong> {sessionError}
            </small>
          </div>
        </div>
      )}

      {/* Main authentication flow */}
      {isAuthenticated && (
        <div className="mb-4">
          {needsRegistration ? (
            <>
              <h5 className="mb-3 text-primary">Welcome, {session.user?.name || user?.name}!</h5>
              <h6 className="mb-2">Please complete your registration by selecting your role:</h6>
              <div className="alert alert-info" role="alert">
                <strong>Registration Required:</strong> You must select a role to continue using SPOPA.
              </div>
              <div className="d-flex justify-content-center gap-3 mb-2 flex-wrap">
                {roles.map((role) => (
                  <button
                    key={role}
                    className="btn btn-primary mx-1 mb-2"
                    onClick={() => handleRoleSelect(role)}
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                        Registering...
                      </>
                    ) : (
                      role
                    )}
                  </button>
                ))}
              </div>
              <small className="text-muted">
                This is a one-time setup. Your role will be saved permanently.
              </small>
            </>
          ) : sessionAuthenticated ? (
            <div className="alert alert-success" role="alert">
              <p className="mb-1">
                <strong>Welcome back, {session.user?.name}!</strong>
              </p>
              <p className="mb-0">
                Current role: <span className="badge badge-primary">{session.userType}</span>
              </p>
            </div>
          ) : (
            // User is authenticated with Auth0 but session hasn't initialized yet
            <div className="alert alert-info" role="alert">
              <p className="mb-1">
                <strong>Welcome, {user?.name}!</strong>
              </p>
              <p className="mb-0">
                <small>Setting up your session...</small>
              </p>
            </div>
          )}
        </div>
      )}

      <img className="mb-3 app-logo" src={logo} alt="SPOPA logo" width="120" />
      <h1 className="mb-4">SPOPA</h1>

      {!isAuthenticated && (
        <div className="mb-4">
          <p className="lead text-muted">
            Student Professional Opportunities Platform for Academia
          </p>
          <p className="text-muted">
            Please log in to access your dashboard and manage your internship process.
          </p>
        </div>
      )}
    </div>
  );
};

export default Hero;