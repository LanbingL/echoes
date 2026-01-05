import type { VercelRequest, VercelResponse } from '@vercel/node';

const fallbackStories = Array(24).fill(null).map((_, i) => ({
  id: i,
  content: "The curtains are drawn."
}));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json(fallbackStories);
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
              text: `Generate 24 very short, noir/cyberpunk descriptions of what is happening inside an apartment window.
              Examples: "A figure tends to bioluminescent plants.", "Blue light flickers from a hacked terminal.", "Shadows argue over a map.", "A robot arm repairs a toaster."

              Format as a JSON array of objects with property "content".`
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(200).json(fallbackStories);
    }

    const parsed = JSON.parse(text);
    const stories = parsed.map((item: any, index: number) => ({
      id: index,
      content: item.content
    }));

    return res.status(200).json(stories);

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(200).json(fallbackStories);
  }
}
