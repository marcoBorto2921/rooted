/**
 * POST /api/recommend
 *
 * Receives the user's form answers and climate data,
 * builds a prompt, and calls Groq to generate personalized
 * plant recommendations. Returns a structured JSON response.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { answers, climate } = await req.json();

  // Extract useful climate info from Open-Meteo response
  const temps = climate.daily.temperature_2m_max;
  const minTemps = climate.daily.temperature_2m_min;
  const maxTemp = Math.max(...temps).toFixed(1);
  const minTemp = Math.min(...minTemps).toFixed(1);

  // Build the prompt with all the context
  const prompt = `
You are an expert botanist helping community gardens choose the right plants.

The user has provided the following information about their land:
- Soil type: ${answers.soil}
- Sun exposure: ${answers.sun}
- Space size: ${answers.size}
- Main goal: ${answers.goal}

Local climate data (next 16 days):
- Max temperature: ${maxTemp}°C
- Min temperature: ${minTemp}°C

Based on this information, recommend 4 plants that would thrive in these conditions.

Respond ONLY with a valid JSON array, no extra text, no markdown, no backticks. Use this exact format:
[
  {
    "name": "Plant name",
    "why": "One sentence explaining why it suits this land",
    "season": "Best time to plant",
    "difficulty": "Easy / Medium / Hard",
    "companion": "One plant that grows well alongside it"
  }
]
  `;

  // Call Groq API
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const text = data.choices[0].message.content;

  // Parse the JSON response from the model
  const recommendations = JSON.parse(text);

  return NextResponse.json({ recommendations });
}