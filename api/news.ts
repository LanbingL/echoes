import type { VercelRequest, VercelResponse } from '@vercel/node';

const fallbackNews = [
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json(fallbackNews);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Find 20 distinct, current trending world news headlines from reliable sources.
              Return them as a JSON array of objects.
              Each object must have:
              - "title": The news headline.
              - "url": The source URL.
              - "source": The name of the news outlet.
              - "imagePrompt": A concise visual description.`
            }]
          }],
          tools: [{ googleSearch: {} }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(200).json(fallbackNews);
    }

    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(200).json(fallbackNews);
  }
}
