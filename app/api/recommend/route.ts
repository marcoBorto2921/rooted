/**
 * POST /api/recommend
 *
 * Receives the user's form answers and climate data.
 * 1. Calls the Python backend to get matching plants from the database
 * 2. Passes those plants to Groq to generate natural language explanations
 * 3. Returns the final recommendations to the frontend
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { answers, climate } = await req.json();

  // Extract climate info from Open-Meteo response
  const temps = climate.daily.temperature_2m_max;
  const minTemps = climate.daily.temperature_2m_min;
  const maxTemp = Math.max(...temps).toFixed(1);
  const minTemp = Math.min(...minTemps).toFixed(1);

  // Step 1 — get matching plants from the Python backend
  const dbResponse = await fetch("http://localhost:8000/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      soil: answers.soil,
      sun: answers.sun,
      goal: answers.goal,
      max_temp: parseFloat(maxTemp),
      min_temp: parseFloat(minTemp),
    }),
  });

  const dbData = await dbResponse.json();
  const plants = dbData.plants;

  if (!plants || plants.length === 0) {
    return NextResponse.json({ recommendations: [] });
  }

  // Step 2 — ask Groq to explain why each plant suits this land
  const prompt = `
You are an expert botanist helping community gardens.

The user's land:
- Soil: ${answers.soil}
- Sun: ${answers.sun}
- Size: ${answers.size}
- Goal: ${answers.goal}
- Max temperature: ${maxTemp}°C
- Min temperature: ${minTemp}°C

These plants have been selected from our database as suitable matches:
${plants.map((p: any) => `- ${p.name}: ${p.description}`).join("\n")}

For each plant, write a short personalized explanation of why it suits THIS specific land.

Respond ONLY with a valid JSON array, no extra text, no markdown, no backticks:
[
  {
    "name": "Plant name",
    "why": "One sentence explaining why it suits this specific land",
    "season": "Best time to plant",
    "difficulty": "Easy / Medium / Hard",
    "companion": "Companion plant name"
  }
]
  `;

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

  const groqData = await groqResponse.json();
  const text = groqData.choices[0].message.content;
  const recommendations = JSON.parse(text);

  return NextResponse.json({ recommendations });
}