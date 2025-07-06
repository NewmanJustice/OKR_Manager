// file: lib/notify.ts (or a similar location)

import jwt from 'jsonwebtoken';

/**
 * Generates a JWT for authenticating with the GOV.UK Notify API.
 * @param {string} fullApiKey - The full API key from GOV.UK Notify.
 * @returns {string} The signed JSON Web Token.
 */
export function createNotifyJwt(fullApiKey: string): string {
  // 1. Parse the API Key
  // The key is in the format: {key_name}-{service_id}-{api_secret}

const parts = fullApiKey.split('-');
if (parts.length < 3) {
  console.error('Invalid GOV_NOTIFY_API_KEY format. Expected format: key_name-service_id-api_secret');
  process.exit(1);
}

const serviceId = parts.slice(1, 6).join('-');    // 1 to 5 (inclusive)
const apiSecret = parts.slice(6).join('-');       // 6 to end

  // 2. Create the JWT Payload
  const payload = {
    iss: serviceId, // The service ID is the issuer
    iat: Math.floor(Date.now() / 1000), // Issued at time in UTC seconds
  };

  // 3. Sign the JWT with the API Secret
  const token = jwt.sign(
    payload,
    apiSecret,
    {
      algorithm: 'HS256', // Must be HS256
      header: {
        typ: 'JWT',
        alg: 'HS256',
      },
    }
  );

  return token;
}
