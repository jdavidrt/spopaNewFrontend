import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSession } from "../utils/sessionManager";

// API base URL - change to match your setup
const API_BASE_URL = 'https://3.138.110.228:8000/api';

// LocalStorage utility functions for managing applications (same as AdminDashboard)
const applicationStorage = {
  // Get the localStorage key for a specific user
  getStorageKey: (userId) => `spopa_applied_offers_${userId}`,

  // Load applied offers for a user
  loadAppliedOffers: (userId) => {
    try {
      const key = applicationStorage.getStorageKey(userId);
      const data = localStorage.getItem(key);

      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);

      // Ensure we have an array of objects with the expected structure
      if (Array.isArray(parsed)) {
        // If it's an array of strings (old format), convert to new format
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          return parsed.map(offerId => ({
            offerId: offerId,
            userId: userId,
            appliedAt: new Date().toISOString()
          }));
        }

        // If it's already in the new format, return as is
        if (parsed.length > 0 && typeof parsed[0] === 'object') {
          return parsed;
        }

        return parsed; // Empty array
      }

      return [];
    } catch (error) {
      console.error('Error loading applied offers:', error);
      return [];
    }
  },

  // Get progress for an offer (stored separately or generated)
  getOfferProgress: (userId, offerId) => {
    try {
      const progressKey = `spopa_offer_progress_${userId}`;
      const progressData = localStorage.getItem(progressKey);
      let progressMap = {};

      if (progressData) {
        progressMap = JSON.parse(progressData);
      }

      // If progress doesn't exist for this offer, generate random progress between 10-70%
      if (!progressMap[offerId]) {
        progressMap[offerId] = Math.floor(Math.random() * 61) + 10; // 10 to 70
        localStorage.setItem(progressKey, JSON.stringify(progressMap));
      }

      return progressMap[offerId];
    } catch (error) {
      console.error('Error getting offer progress:', error);
      return Math.floor(Math.random() * 61) + 10; // Fallback random progress
    }
  }
};

// Progress bar component with gradient
function ProgressBar({ progress, offerId }) {
  const progressStyle = {
    width: '100%',
    height: '20px',
    backgroundColor: '#e9ecef',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
    marginBottom: '8px'
  };

  const fillStyle = {
    width: `${progress}%`,
    height: '100%',
    background: `linear-gradient(45deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #6B73FF 50%, 
      #9A9CE2 75%, 
      #667eea 100%)`,
    backgroundSize: '200% 200%',
    animation: 'gradientShift 3s ease infinite',
    borderRadius: '10px',
    position: 'relative',
    transition: 'width 0.8s ease-in-out'
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>
          Application Progress
        </span>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#6c757d' }}>
          {progress}%
        </span>
      </div>
      <div style={progressStyle}>
        <div style={fillStyle}>
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}>
            {progress >= 25 ? `${progress}%` : ''}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

// Offer card component
function OfferCard({ offer, applicationData, progress }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatAppliedDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getProgressStage = (progress) => {
    if (progress < 20) return { stage: 'Application Submitted', color: '#6c757d' };
    if (progress < 40) return { stage: 'Under Review', color: '#fd7e14' };
    if (progress < 60) return { stage: 'Interview Scheduled', color: '#ffc107' };
    if (progress < 80) return { stage: 'Final Review', color: '#20c997' };
    return { stage: 'Offer Pending', color: '#28a745' };
  };

  const progressStage = getProgressStage(progress);

  return (
    <div style={{
      border: '1px solid #dee2e6',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
      }}>

      {/* Header with title and status */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{
            margin: 0,
            color: '#212529',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            {offer.titulo}
          </h3>
          <span style={{
            backgroundColor: progressStage.color,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {progressStage.stage}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <h4 style={{
            margin: 0,
            color: '#6c757d',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            {offer.nombre_empresa}
          </h4>
          <span style={{
            color: '#28a745',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            📍 {offer.ciudad}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={progress} offerId={offer._id} />

      {/* Application Details */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid #e9ecef'
      }}>
        <h5 style={{
          margin: '0 0 12px 0',
          color: '#495057',
          fontSize: '14px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Application Information
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          <div>
            <strong style={{ color: '#6c757d', fontSize: '12px' }}>Applied:</strong>
            <div style={{ color: '#212529', fontSize: '14px' }}>
              {formatAppliedDate(applicationData.appliedAt)}
            </div>
          </div>
          <div>
            <strong style={{ color: '#6c757d', fontSize: '12px' }}>Position:</strong>
            <div style={{ color: '#212529', fontSize: '14px' }}>
              {offer.cargo}
            </div>
          </div>
          <div>
            <strong style={{ color: '#6c757d', fontSize: '12px' }}>Modality:</strong>
            <div style={{ color: '#212529', fontSize: '14px' }}>
              {offer.modalidad}
            </div>
          </div>
          <div>
            <strong style={{ color: '#6c757d', fontSize: '12px' }}>Schedule:</strong>
            <div style={{ color: '#212529', fontSize: '14px' }}>
              {offer.horario}
            </div>
          </div>
        </div>
      </div>

      {/* Offer Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>

        {/* Left Column */}
        <div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#495057', fontSize: '14px' }}>Department:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
              {offer.departamento || 'Not specified'}
            </p>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#495057', fontSize: '14px' }}>Type:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
              {offer.tipo || 'Not specified'}
            </p>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#495057', fontSize: '14px' }}>Vacancies:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
              {offer.vacantes} position{offer.vacantes !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#495057', fontSize: '14px' }}>Application Deadline:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
              {formatDate(offer.fecha_cierre)}
            </p>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#495057', fontSize: '14px' }}>Start Date:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
              {formatDate(offer.fecha_inicio)}
            </p>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#495057', fontSize: '14px' }}>Contact:</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              <a
                href={`mailto:${offer.correo_electronico}`}
                style={{ color: '#007bff', textDecoration: 'none' }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                {offer.correo_electronico}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {offer.descripcion && (
        <div style={{ marginTop: '16px' }}>
          <strong style={{ color: '#495057', fontSize: '14px' }}>Description:</strong>
          <p style={{
            margin: '8px 0 0 0',
            color: '#6c757d',
            lineHeight: '1.5',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            {offer.descripcion}
          </p>
        </div>
      )}

      {/* Candidate Profile */}
      {offer.perfil_aspirante && (
        <div style={{ marginTop: '16px' }}>
          <strong style={{ color: '#495057', fontSize: '14px' }}>Desired Candidate Profile:</strong>
          <p style={{
            margin: '8px 0 0 0',
            color: '#6c757d',
            lineHeight: '1.5',
            padding: '12px',
            backgroundColor: '#e8f4f8',
            borderRadius: '6px',
            border: '1px solid #bee5eb'
          }}>
            {offer.perfil_aspirante}
          </p>
        </div>
      )}

      {/* Academic Programs */}
      {offer.programas_academicos_buscados && offer.programas_academicos_buscados.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <strong style={{ color: '#495057', fontSize: '14px' }}>Target Academic Programs:</strong>
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {offer.programas_academicos_buscados.map((programa, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  padding: '4px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: '500',
                  border: '1px solid #bbdefb'
                }}
              >
                {programa}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Observations */}
      {offer.observaciones && (
        <div style={{ marginTop: '16px' }}>
          <strong style={{ color: '#495057', fontSize: '14px' }}>Additional Notes:</strong>
          <p style={{
            margin: '8px 0 0 0',
            color: '#6c757d',
            lineHeight: '1.5',
            padding: '12px',
            backgroundColor: '#fff3cd',
            borderRadius: '6px',
            border: '1px solid #ffeaa7',
            fontStyle: 'italic'
          }}>
            {offer.observaciones}
          </p>
        </div>
      )}
    </div>
  );
}

function Process() {
  const { user } = useAuth0();
  const { hasRole } = useSession();
  const isStudent = hasRole && hasRole("Estudiante");

  const [appliedApplications, setAppliedApplications] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [appliedOffersWithDetails, setAppliedOffersWithDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user ID from Auth0
  const getCurrentUserId = () => {
    return user?.sub || null;
  };

  // Load offers and applications
  useEffect(() => {
    const loadData = async () => {
      if (!isStudent || !user?.sub) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Load all offers from API
        const offersResponse = await fetch(`${API_BASE_URL}/offers`);
        if (!offersResponse.ok) {
          throw new Error('Failed to load offers');
        }
        const offers = await offersResponse.json();
        setAllOffers(offers);

        // Load applied applications from localStorage
        const userId = getCurrentUserId();
        const applications = applicationStorage.loadAppliedOffers(userId);
        setAppliedApplications(applications);

        // Match applications with offer details
        const appliedOfferIds = applications.map(app =>
          typeof app === 'string' ? app : app.offerId
        );

        const appliedOffers = offers.filter(offer =>
          appliedOfferIds.includes(offer._id)
        );

        // Add application metadata and progress to each offer
        const offersWithDetails = appliedOffers.map(offer => {
          const applicationData = applications.find(app =>
            (typeof app === 'string' && app === offer._id) ||
            (typeof app === 'object' && app.offerId === offer._id)
          );

          const normalizedApplication = typeof applicationData === 'string'
            ? { offerId: applicationData, appliedAt: new Date().toISOString() }
            : applicationData;

          const progress = applicationStorage.getOfferProgress(userId, offer._id);

          return {
            ...offer,
            applicationData: normalizedApplication,
            progress: progress
          };
        });

        setAppliedOffersWithDetails(offersWithDetails);

      } catch (err) {
        console.error('Error loading process data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isStudent, user]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}>
        </div>
        <h2 style={{ color: '#6c757d', margin: 0 }}>Loading your application process...</h2>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Error Loading Data</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  // Non-student view
  if (!isStudent) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ffeaa7',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Access Restricted</h3>
          <p style={{ margin: 0 }}>
            Only students can view their application process.
            Please ensure you are logged in with a student account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            color: '#212529',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            My Application Process
          </h1>
          <p style={{
            margin: 0,
            color: '#6c757d',
            fontSize: '16px'
          }}>
            Track the progress of your internship applications
          </p>
        </div>

        {/* Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#007bff', fontSize: '24px' }}>
              {appliedOffersWithDetails.length}
            </h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
              Applications Submitted
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#28a745', fontSize: '24px' }}>
              {appliedOffersWithDetails.filter(offer => offer.progress >= 60).length}
            </h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
              Advanced Stage
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#ffc107', fontSize: '24px' }}>
              {appliedOffersWithDetails.length > 0
                ? Math.round(appliedOffersWithDetails.reduce((acc, offer) => acc + offer.progress, 0) / appliedOffersWithDetails.length)
                : 0}%
            </h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
              Average Progress
            </p>
          </div>
        </div>

        {/* Applications List */}
        {appliedOffersWithDetails.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '60px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
            <h3 style={{ margin: '0 0 15px 0', color: '#6c757d' }}>
              No Applications Yet
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#6c757d' }}>
              You haven't applied to any internship offers yet.
              Visit the Available Offers page to start your journey!
            </p>
            <a
              href="/admin"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Browse Available Offers
            </a>
          </div>
        ) : (
          <div>
            <h2 style={{
              margin: '0 0 20px 0',
              color: '#212529',
              fontSize: '22px',
              fontWeight: '600'
            }}>
              Your Applications ({appliedOffersWithDetails.length})
            </h2>

            {appliedOffersWithDetails
              .sort((a, b) => new Date(b.applicationData.appliedAt) - new Date(a.applicationData.appliedAt))
              .map((offer) => (
                <OfferCard
                  key={offer._id}
                  offer={offer}
                  applicationData={offer.applicationData}
                  progress={offer.progress}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Process;