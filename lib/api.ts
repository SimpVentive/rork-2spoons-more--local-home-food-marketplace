// utils/api.ts
import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

if (!baseURL) {
  throw new Error('No base URL found. Please set EXPO_PUBLIC_RORK_API_BASE_URL');
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
