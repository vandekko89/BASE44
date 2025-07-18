import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68759cc4361a6530c7ea0e95", 
  requiresAuth: true // Ensure authentication is required for all operations
});
