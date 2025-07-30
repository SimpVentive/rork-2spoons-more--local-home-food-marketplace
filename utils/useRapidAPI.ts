import { useState, useEffect, useCallback } from 'react';

interface UseRapidAPIOptions {
  host: string;
  apiKey: string;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: any;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseRapidAPIResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRapidAPI<T = any>({
  host,
  apiKey,
  endpoint,
  method = 'GET',
  params,
  body,
  enabled = true,
  refetchInterval,
}: UseRapidAPIOptions): UseRapidAPIResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      let url = `https://${host}${endpoint}`;
      
      if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
      }

      const requestOptions: RequestInit = {
        method,
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': host,
          'Content-Type': 'application/json',
        },
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        requestOptions.body = JSON.stringify(body);
      }

      console.log(`RapidAPI Hook: ${method} ${url}`);
      
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('RapidAPI Hook Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [host, apiKey, endpoint, method, params, body, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Specialized hooks for common APIs
export function useWeatherAPI(location: string, apiKey: string, enabled = true) {
  return useRapidAPI({
    host: 'weatherapi-com.p.rapidapi.com',
    apiKey,
    endpoint: `/current.json`,
    params: { q: location },
    enabled: enabled && !!location,
  });
}

export function useNewsAPI(query: string, apiKey: string, enabled = true) {
  return useRapidAPI({
    host: 'newsapi.org',
    apiKey,
    endpoint: '/v2/everything',
    params: { q: query, sortBy: 'publishedAt' },
    enabled: enabled && !!query,
  });
}