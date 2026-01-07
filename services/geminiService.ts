import { MemoryLog, NewsItem, BuildingStory } from '../types';

const NEWS_CACHE_KEY = 'echoes_news_cache';
const NEWS_TIMESTAMP_KEY = 'echoes_news_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Get API key from environment (works in both Vite dev and production)
const getApiKey = (): string | null => {
  // @ts-ignore - defined in vite.config.ts
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    // @ts-ignore
    return process.env.GEMINI_API_KEY;
  }
  return null;
};

// Direct Gemini API call for dev mode
const callGeminiDirectly = async (prompt: string): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return null;
  }
};

export const generateMemoryLog = async (seedId: string): Promise<MemoryLog> => {
  try {
    const response = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seedId })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();

  } catch (error) {
    console.error("API Error:", error);
    return {
      id: seedId,
      title: "Corrupted Sector",
      content: "The neural link is unstable. Static fills your mind. Try accessing another terminal.",
      timestamp: "ERR:404"
    };
  }
};

export const getRealWorldNews = async (): Promise<NewsItem[]> => {
  // 1. Check Cache
  if (typeof window !== 'undefined') {
    const cachedData = localStorage.getItem(NEWS_CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(NEWS_TIMESTAMP_KEY);

    if (cachedData && cachedTimestamp) {
      const age = Date.now() - parseInt(cachedTimestamp, 10);
      if (age < CACHE_DURATION) {
         try {
           return JSON.parse(cachedData);
         } catch (e) {
           console.warn("Cache corrupted, fetching fresh data.");
         }
      }
    }
  }

  try {
    // Try direct Gemini API call first (for dev mode)
    const prompt = `Find 24 distinct, current trending world news headlines from reliable sources.
Return them as a JSON array of objects.
Each object must have:
- "title": The news headline.
- "url": The source URL.
- "source": The name of the news outlet.
- "imagePrompt": A concise visual description.`;

    const text = await callGeminiDirectly(prompt);

    if (text) {
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data: NewsItem[] = JSON.parse(jsonStr);

      // Save to Cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(NEWS_TIMESTAMP_KEY, Date.now().toString());
      }

      return data;
    }

    // Fallback to API route (for production/Vercel)
    const response = await fetch('/api/news');

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    // Save to Cache
    if (typeof window !== 'undefined') {
      localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(NEWS_TIMESTAMP_KEY, Date.now().toString());
    }

    return data;

  } catch (e) {
    console.error("Failed to fetch news", e);
    return fallbackNews;
  }
};

export const getBuildingStories = async (): Promise<BuildingStory[]> => {
  try {
    const response = await fetch('/api/building');

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();

  } catch (e) {
    console.error("Failed to fetch building stories", e);
    return Array(24).fill(null).map((_, i) => ({ id: i, content: "Static on the screen." }));
  }
};

const fallbackNews: NewsItem[] = [
  { title: "Connection Lost: Using Offline Backup", url: "#", source: "System", imagePrompt: "static noise" },
  { title: "Global Climate Summit Reaches Critical Point", url: "#", source: "World News", imagePrompt: "climate" },
  { title: "Tech Giant Unveils Quantum Processor", url: "#", source: "Tech Weekly", imagePrompt: "tech" },
  { title: "Mars Colony Project Delayed Indefinitely", url: "#", source: "Space Today", imagePrompt: "mars" },
  { title: "Ocean Cleanup Project Removes Record Plastic", url: "#", source: "EcoWatch", imagePrompt: "ocean" },
  { title: "New Archaeological Discovery in Egypt", url: "#", source: "History Now", imagePrompt: "egypt" },
  { title: "Artificial Intelligence Regulation Bill Passed", url: "#", source: "Gov Wire", imagePrompt: "ai" },
  { title: "Electric Vehicle Sales Surpass Traditional Autos", url: "#", source: "Auto Trends", imagePrompt: "cars" },
  { title: "Medical Breakthrough in Genetic Therapy", url: "#", source: "Health Daily", imagePrompt: "dna" },
  { title: "Stock Markets Rally Amid Economic Optimism", url: "#", source: "Finance Insider", imagePrompt: "stocks" },
  { title: "Cybersecurity Firm Detects Massive Data Breach", url: "#", source: "NetSec", imagePrompt: "cyber" },
  { title: "Renewable Energy Costs Hit Historic Low", url: "#", source: "Green Energy", imagePrompt: "solar" },
  { title: "Space Telescope Captures Distant Galaxy Collision", url: "#", source: "Astro News", imagePrompt: "galaxy" },
  { title: "Major Urban Infrastructure Project Announced", url: "#", source: "City Plan", imagePrompt: "city" },
  { title: "Cryptocurrency Volatility Continues", url: "#", source: "Coin Watch", imagePrompt: "crypto" },
  { title: "Film Festival Winners Announced", url: "#", source: "Arts Daily", imagePrompt: "film" },
  { title: "Sports League Expansion Teams Confirmed", url: "#", source: "Sports Center", imagePrompt: "sports" },
  { title: "Scientific Study Links Sleep to Longevity", url: "#", source: "Science Today", imagePrompt: "sleep" },
  { title: "Global Trade Agreement Signed", url: "#", source: "Economy Now", imagePrompt: "trade" },
  { title: "Rare Weather Phenomenon Observed in Arctic", url: "#", source: "Weather Channel", imagePrompt: "snow" }
];

export const generateHeadlines = async (): Promise<string[]> => {
    const news = await getRealWorldNews();
    return news.map(n => n.title);
};
