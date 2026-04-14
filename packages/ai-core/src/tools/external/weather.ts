import { tool } from 'ai';
import { z } from 'zod';
import type { ToolResult } from '../../types/index.js';

export const getWeatherForecast = tool({
  description: 'Fetch weather forecast for a city including temperature, precipitation probability, and severe weather alerts',
  parameters: z.object({
    city: z.string().describe('City name for weather lookup'),
    days: z.number().optional().describe('Number of forecast days, default 3'),
  }),
  execute: async ({ city, days }): Promise<ToolResult> => {
    // TODO: Implement with OpenWeather API
    return {
      success: false,
      error: 'Not yet implemented — awaiting OpenWeather API integration',
      dataConfidence: { level: 'NONE', monthsOfData: 0, completenessScore: 0, message: 'Tool not yet implemented' },
      source: 'openweather-api',
      queriedAt: new Date().toISOString(),
    };
  },
});
