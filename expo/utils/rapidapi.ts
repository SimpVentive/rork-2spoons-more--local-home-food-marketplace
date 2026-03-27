interface RapidAPIConfig {
  host: string;
  key: string;
  baseUrl?: string;
}

interface RapidAPIOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

export class RapidAPIClient {
  private config: RapidAPIConfig;

  constructor(config: RapidAPIConfig) {
    this.config = config;
  }

  async request<T = any>(
    endpoint: string, 
    options: RapidAPIOptions = {}
  ): Promise<T> {
    const { method = 'GET', headers = {}, body, params } = options;
    
    const baseUrl = this.config.baseUrl || `https://${this.config.host}`;
    let url = `${baseUrl}${endpoint}`;
    
    // Add query parameters
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const requestHeaders = {
      'X-RapidAPI-Key': this.config.key,
      'X-RapidAPI-Host': this.config.host,
      'Content-Type': 'application/json',
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      console.log(`RapidAPI Request: ${method} ${url}`);
      
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`RapidAPI Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('RapidAPI Response:', data);
      
      return data;
    } catch (error) {
      console.error('RapidAPI Request Failed:', error);
      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Example usage for popular APIs
export const createWeatherAPI = (apiKey: string) => 
  new RapidAPIClient({
    host: 'weatherapi-com.p.rapidapi.com',
    key: apiKey,
  });

export const createNewsAPI = (apiKey: string) => 
  new RapidAPIClient({
    host: 'newsapi.org',
    key: apiKey,
    baseUrl: 'https://newsapi.org/v2',
  });

export const createTranslateAPI = (apiKey: string) => 
  new RapidAPIClient({
    host: 'google-translate1.p.rapidapi.com',
    key: apiKey,
  });