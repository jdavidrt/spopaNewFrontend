// fe/src/config.js
// Enhanced configuration for AWS Amplify deployment that prioritizes environment variables

let configJson = {};

// Safely try to import local auth_config.json for development
try {
  configJson = require("./auth_config.json");
} catch (error) {
  // This is expected in production/deployment environments
  console.log("auth_config.json not found, using environment variables (this is normal for production)");
}

export function getConfig() {
  // Use environment variables first (for production), fall back to configJson (for development)
  const domain = process.env.REACT_APP_AUTH0_DOMAIN || configJson.domain;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || configJson.clientId;
  const audienceFromEnv = process.env.REACT_APP_AUTH0_AUDIENCE || configJson.audience;

  // Configure the audience. Set to null if it's the default placeholder value
  const audience =
    audienceFromEnv && audienceFromEnv !== "YOUR_API_IDENTIFIER"
      ? audienceFromEnv
      : null;

  // Validate required configuration
  if (!domain || !clientId) {
    console.error("Missing required Auth0 configuration:");
    console.error("- REACT_APP_AUTH0_DOMAIN:", domain ? "✓" : "✗");
    console.error("- REACT_APP_AUTH0_CLIENT_ID:", clientId ? "✓" : "✗");

    // In development, provide helpful guidance
    if (process.env.NODE_ENV === 'development') {
      console.error("\nFor local development, either:");
      console.error("1. Create src/auth_config.json with your Auth0 settings, or");
      console.error("2. Set environment variables in .env.local:");
      console.error("   REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com");
      console.error("   REACT_APP_AUTH0_CLIENT_ID=your-client-id");
    } else {
      console.error("\nFor production deployment, set these environment variables in your hosting platform:");
      console.error("- REACT_APP_AUTH0_DOMAIN");
      console.error("- REACT_APP_AUTH0_CLIENT_ID");
      console.error("- REACT_APP_AUTH0_AUDIENCE (optional)");
    }

    throw new Error("Auth0 configuration is incomplete");
  }

  const config = {
    domain,
    clientId,
    ...(audience ? { audience } : {}),
    // Additional configuration for production deployment
    redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin,
    returnTo: process.env.REACT_APP_AUTH0_RETURN_TO || window.location.origin,
  };

  console.log("Auth0 configuration loaded:", {
    domain: config.domain,
    clientId: config.clientId ? "✓" : "✗",
    audience: config.audience || "none",
    redirectUri: config.redirectUri,
    returnTo: config.returnTo
  });

  return config;
}