// Enhanced configuration that works with both local files and environment variables
let configJson;

try {
  // Try to import local auth_config.json for development
  configJson = require("./auth_config.json");
} catch (error) {
  // Fallback to empty object if file doesn't exist
  console.warn("auth_config.json not found, using environment variables");
  configJson = {};
}

export function getConfig() {
  // Use environment variables if available, otherwise fall back to configJson
  const domain = process.env.REACT_APP_AUTH0_DOMAIN || configJson.domain;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || configJson.clientId;
  const audienceFromEnv = process.env.REACT_APP_AUTH0_AUDIENCE || configJson.audience;

  // Configure the audience here. By default, it will take whatever is in the config
  // (specified by the `audience` key) unless it's the default value of "YOUR_API_IDENTIFIER" (which
  // is what you get sometimes by using the Auth0 sample download tool from the quickstart page, if you
  // don't have an API).
  // If this resolves to `null`, the API page changes to show some helpful info about what to do
  // with the audience.
  const audience =
    audienceFromEnv && audienceFromEnv !== "YOUR_API_IDENTIFIER"
      ? audienceFromEnv
      : null;

  // Validate required configuration
  if (!domain || !clientId) {
    console.error("Missing required Auth0 configuration. Please set environment variables or auth_config.json");
    throw new Error("Auth0 configuration is incomplete");
  }

  return {
    domain,
    clientId,
    ...(audience ? { audience } : null),
    // Additional configuration for production deployment
    redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin,
    returnTo: process.env.REACT_APP_AUTH0_RETURN_TO || window.location.origin,
  };
}