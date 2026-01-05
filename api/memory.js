const SYSTEM_INSTRUCTION = `
You are the central core of a corrupted memory archive in a distant, dystopian future.
Your task is to retrieve fragmented data logs.
The tone should be mysterious, slightly melancholic, and sci-fi (Cyberpunk/Blade Runner aesthetic).
Keep descriptions sensory and abstract but coherent enough to tell a micro-story.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { seedId } = req.body;

  if (!seedId) {
    return res.status(400).json({ error: 'seedId is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      id: seedId,
      title: "Corrupted Sector",
      content: "API key not configured. The neural link is unstable.",
      timestamp: "ERR:CONFIG"
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{
            parts: [{
              text: `Generate a short, cryptic memory log retrieved from data cluster ID: ${seedId}.

              Format the output as a valid JSON object with the following structure:
              {
                "title": "A short, abstract title (e.g., 'Neon Rain', 'Protocol 7')",
                "content": "A paragraph of text (max 80 words) describing a specific moment, feeling, or observation from the past.",
                "timestamp": "A futuristic timestamp (e.g., 'Cycle 4022.99')"
              }`
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
      throw new Error('No content generated');
    }

    const parsed = JSON.parse(text);

    return res.status(200).json({
      id: seedId,
      title: parsed.title || "Unknown Fragment",
      content: parsed.content || "Data corruption detected. Unable to parse memory.",
      timestamp: parsed.timestamp || "ERR:TIME"
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(200).json({
      id: seedId,
      title: "Corrupted Sector",
      content: "The neural link is unstable. Static fills your mind. Try accessing another terminal.",
      timestamp: "ERR:404"
    });
  }
}
