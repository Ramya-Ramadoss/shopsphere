import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = '/api';

// Helper function to recursively map backend ProductResponse objects to frontend Product shape
function mapBackendResponse(data: any): any {
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => mapBackendResponse(item));
  }

  // Check if this object represents a backend ProductResponse
  if (Object.prototype.hasOwnProperty.call(data, 'productName')) {
    const mappedProduct = {
      ...data,
      name: data.productName,
      category: {
        id: data.categoryId || 0,
        name: data.categoryName || 'Unassigned',
      },
      inventory: {
        id: data.id,
        quantity: data.quantity !== undefined ? data.quantity : 0,
        inStock: data.inStock !== undefined ? data.inStock : false,
        reservedQuantity: 0,
      },
      available: data.active !== undefined ? data.active : true,
    };

    // Recursively map all fields of mappedProduct (in case there are other nested objects/arrays)
    for (const key of Object.keys(mappedProduct)) {
      mappedProduct[key] = mapBackendResponse(mappedProduct[key]);
    }
    return mappedProduct;
  }

  // Check if this object is a product image response (has primaryImage)
  if (Object.prototype.hasOwnProperty.call(data, 'primaryImage')) {
    const mappedImage = {
      ...data,
      isPrimary: data.primaryImage,
    };
    return mappedImage;
  }

  // Generic object recursion
  const mappedObj: any = {};
  for (const key of Object.keys(data)) {
    mappedObj[key] = mapBackendResponse(data[key]);
  }
  return mappedObj;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization header dynamically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('shopsphere_token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global callback to trigger logout when a 401 occurs
let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    response.data = mapBackendResponse(response.data);
    return response;
  },
  (error: AxiosError<any>) => {
    const { response, message: networkMessage } = error;

    if (response) {
      const status = response.status;
      
      const responseData = response.data;
      let errorMessage = 'Something went wrong';
      if (responseData) {
        if (responseData.message === 'Operation completed successfully' && responseData.data?.message) {
          errorMessage = responseData.data.message;
        } else {
          errorMessage = responseData.message || 'Something went wrong';
        }
      }

      switch (status) {
        case 401:
          // If the request was to login, it is a bad credential error, not an expired session
          if (error.config?.url?.includes('/auth/login')) {
            toast.error(errorMessage || 'Invalid email or password.');
          } else {
            // Unauthorized: Expiry or invalid token
            toast.error('Session expired. Please log in again.');
            if (onUnauthorizedCallback) {
              onUnauthorizedCallback();
            } else {
              localStorage.removeItem('shopsphere_token');
              localStorage.removeItem('shopsphere_user');
              // Force reload to trigger auth state reset if context isn't bound yet
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }
          }
          break;

        case 403:
          toast.error('Access Denied. You do not have permission.');
          break;
        case 404:
          // Often handled by pages, but keep a Toast just in case for API calls
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(errorMessage);
          break;
      }
    } else if (networkMessage === 'Network Error') {
      toast.error('Network Error. Please check if backend is running at ' + API_BASE_URL);
    } else {
      toast.error(error.message || 'An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

export default api;
