// fe/src/components/Hero.js
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSession } from "../utils/sessionManager";
import logo from "../assets/SPOPALogo.png";

const Hero = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const {
    registerUser,
    needsRegistration,
    userType,
    isRegistered,
    validUserTypes
  } = useSession();

  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
  const [justRegistered, setJustRegistered] = useState(false);

  // Role configuration with better descriptions
  const roles = [
    {
      value: "Estudiante",
      label: "Student",
      icon: "graduation-cap",
      description: "Access internship opportunities, track applications, and manage your academic journey",
      color: "primary"
    },
    {
      value: "Administrativo",
      label: "Administrator",
      icon: "user-shield",
      description: "Oversee the platform, manage users, and coordinate internship programs",
      color: "success"
    },
    {
      value: "Empresa",
      label: "Company",
      icon: "building",
      description: "Post internship opportunities and connect with talented students",
      color: "info"
    }
  ];

  // Clear "just registered" state after a delay
  useEffect(() => {
    if (justRegistered) {
      const timer = setTimeout(() => {
        setJustRegistered(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [justRegistered]);

  const handleRoleSelect = async (role) => {
    setRegistrationError(null);
    setIsRegistering(true);

    try {
      console.log('User selecting role:', role);

      const result = await registerUser(role);

      console.log('Role registration successful:', result);
      setJustRegistered(true);

      // Optional: You can trigger a page refresh or navigation here
      // window.location.reload(); // Uncomment if you want to refresh the page

    } catch (error) {
      console.error('Failed to register user role:', error);
      setRegistrationError(`Failed to register role: ${error.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const getRoleByValue = (value) => {
    return roles.find(role => role.value === value);
  };

  // Show loading state for Auth0
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
      {/* Show registration error if any */}
      {registrationError && (
        <div className="mb-4">
          <div className="alert alert-danger" role="alert">
            <strong>Error:</strong> {registrationError}
            <button
              type="button"
              className="btn-close float-end"
              aria-label="Close"
              onClick={() => setRegistrationError(null)}
            ></button>
          </div>
        </div>
      )}

      {/* Just registered success message */}
      {justRegistered && !needsRegistration && (
        <div className="mb-4">
          <div className="alert alert-success" role="alert">
            <strong>Success!</strong> Your role has been saved and you now have access to all features!
          </div>
        </div>
      )}

      {/* Main authentication flow */}
      {isAuthenticated && (
        <div className="mb-4">
          {needsRegistration ? (
            <>
              <h5 className="mb-3 text-primary">
                Welcome to SPOPA, {user?.name}!
              </h5>
              <h6 className="mb-4">Please select your role to continue:</h6>

              <div className="alert alert-info mb-4" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                <strong>One-time setup:</strong> Choose your role to access the platform features.
                You can change this later in your profile.
              </div>

              <div className="row justify-content-center mb-4">
                {roles.map((role) => (
                  <div key={role.value} className="col-md-4 mb-3">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body d-flex flex-column">
                        <div className="text-center mb-3">
                          <i className={`fas fa-${role.icon} fa-3x text-${role.color} mb-2`}></i>
                          <h5 className="card-title">{role.label}</h5>
                        </div>
                        <p className="card-text small text-muted flex-grow-1">
                          {role.description}
                        </p>
                        <button
                          className={`btn btn-${role.color} mt-auto`}
                          onClick={() => handleRoleSelect(role.value)}
                          disabled={isRegistering}
                        >
                          {isRegistering ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Selecting...
                            </>
                          ) : (
                            <>
                              <i className={`fas fa-${role.icon} me-2`}></i>
                              Select {role.label}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <small className="text-muted d-block">
                <i className="fas fa-shield-alt me-1"></i>
                Your selection is stored securely in your browser and linked to your Auth0 account.
              </small>
            </>
          ) : isRegistered ? (
            <div className="alert alert-success" role="alert">
              <div className="d-flex align-items-center justify-content-center">
                <i className="fas fa-check-circle fa-2x me-3 text-success"></i>
                <div>
                  <p className="mb-1">
                    <strong>Welcome back, {user?.name}!</strong>
                  </p>
                  <p className="mb-0">
                    You are logged in as:
                    <span className={`badge bg-${getRoleByValue(userType)?.color || 'primary'} ms-2`}>
                      <i className={`fas fa-${getRoleByValue(userType)?.icon} me-1`}></i>
                      {getRoleByValue(userType)?.label || userType}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Fallback state
            <div className="alert alert-warning" role="alert">
              <p className="mb-1">
                <strong>Welcome, {user?.name}!</strong>
              </p>
              <p className="mb-0">
                <small>Loading your preferences...</small>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Logo and Title */}
      <img className="mb-3 app-logo" src={logo} alt="SPOPA logo" width="120" />
      <h1 className="mb-4">SPOPA</h1>

      {/* Welcome message for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mb-4">
          <p className="lead text-muted">
            Student Professional Opportunities Platform for Academia
          </p>
          <p className="text-muted">
            Connect students with meaningful internship opportunities.
            Please log in to access your dashboard and manage your internship journey.
          </p>
          <div className="mt-4">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="row">
                  {roles.map((role) => (
                    <div key={role.value} className="col-4 mb-3">
                      <i className={`fas fa-${role.icon} fa-2x text-${role.color} mb-2`}></i>
                      <div className="small text-muted">{role.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && isAuthenticated && (
        <div className="mt-4">
          <details className="text-start">
            <summary className="btn btn-outline-secondary btn-sm">
              Debug Info (Development Only)
            </summary>
            <div className="mt-2 p-3 bg-light rounded small">
              <strong>Session State:</strong><br />
              User: {user?.name}<br />
              User Type: {userType || 'None'}<br />
              Is Registered: {isRegistered ? 'Yes' : 'No'}<br />
              Needs Registration: {needsRegistration ? 'Yes' : 'No'}<br />
              localStorage userType: {localStorage.getItem('spopa_user_type') || 'None'}<br />
              localStorage registered: {localStorage.getItem('spopa_user_registered') || 'None'}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default Hero;