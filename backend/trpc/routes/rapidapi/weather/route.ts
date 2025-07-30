import { z } from 'zod';
import { publicProcedure } from '../../create-context';

const weatherInputSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  days: z.number().min(1).max(10).optional().default(1),
});

export const weatherProcedure = publicProcedure
  .input(weatherInputSchema)
  .query(async ({ input }) => {
    const { location, days } = input;
    
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
      throw new Error('RapidAPI key not configured');
    }

    try {
      const response = await fetch(
        `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${encodeURIComponent(location)}&days=${days}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        location: data.location,
        current: data.current,
        forecast: data.forecast,
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      throw new Error('Failed to fetch weather data');
    }
  });