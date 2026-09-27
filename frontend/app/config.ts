// Centralized API configuration
// In production (e.g. Vercel), set NEXT_PUBLIC_API_URL to your deployed backend URL.
// In local development, it automatically falls back to http://localhost:8000.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
