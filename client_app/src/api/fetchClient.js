// fetchClient.js
import { SERVER } from "../config";
import { getToken } from "../authentication/getToken";
import { getGlobalLogout } from "../contexts/AuthContext";

// Custom error class thrown by fetchClient for all API failures.
// isServerError is true for network failures and 5xx responses (show <ServerError />).
// isServerError is false for 4xx responses (show error.message inline).
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isServerError = !status || status >= 500;
  }
}

// Create a navigation function that will be set by the App component
let navigate = null;

// Function to set the navigate function from your App component
export const setNavigate = (navigateFunction) => {
  navigate = navigateFunction;
};

// Central fetch wrapper function
export const fetchClient = async (endpoint, options = {}) => {
  // Get the token from storage
  const token = getToken();

  // Prepare headers with authentication
  const headers = {
    "Content-Type": "application/json",
  };

  // Add auth token if available
  if (token) {
    headers.Authorization = `${token}`;
  }

  // Prepare the complete request config
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${SERVER}${endpoint}`, config);

    // Check if the response indicates authentication failure
    if (response.status === 401 || response.status === 403) {
      const logout = getGlobalLogout();
      if (logout) {
        logout();
      }
      if (navigate) {
        navigate("/home");
      }
      return Promise.reject(new Error("Authentication failed"));
    }

    // If the response is not OK and not a 401, handle other errors
    if (!response.ok) {
      let errorMessage = "An error occurred while processing your request";
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        const responseText = await response.text();
        if (responseText) errorMessage = responseText;
      }
      return Promise.reject(new ApiError(errorMessage, response.status));
    }

    // Parse and return the response data
    return await response.json();
  } catch (error) {
    throw new ApiError(error.message || 'Unable to connect to the server.', undefined);
  }
};

// ✅ Helper functions for common request types
export const getRequest = (endpoint) => fetchClient(endpoint, { method: "GET" });

export const postRequest = (endpoint, data) =>
  fetchClient(endpoint, { method: "POST", body: JSON.stringify(data) });

export const putRequest = (endpoint, data) =>
  fetchClient(endpoint, { method: "PUT", body: JSON.stringify(data) });

// Patch request MUST be exported to be used by the new feature
export const patchRequest = (
  endpoint,
  data, // <-- EXPORT ADDED HERE
) => fetchClient(endpoint, { method: "PATCH", body: JSON.stringify(data) });

export const deleteRequest = (endpoint) => fetchClient(endpoint, { method: "DELETE" });
