/**
 * Home — main page of the Rooted app
 *
 * Renders a multi-step form that collects information about the user's land
 * (soil type, sun exposure, size, and goals). Each step shows one question
 * at a time with clickable options. Answers are stored in local state and
 * will be sent to the AI model to generate personalized plant recommendations.
 */

"use client";

import { useState } from "react";

const steps = [
  {
    id: "soil",
    question: "What's your soil like?",
    options: [
      { value: "clay", label: "Clay", description: "Compact, cracks when dry" },
      { value: "sandy", label: "Sandy", description: "Loose, drains quickly" },
      { value: "silty", label: "Silty", description: "Soft and fertile" },
      { value: "unknown", label: "Not sure", description: "I'll find out later" },
    ],
  },
  {
    id: "sun",
    question: "How much sun does your land get?",
    options: [
      { value: "full", label: "Full sun", description: "More than 6 hours/day" },
      { value: "partial", label: "Partial shade", description: "3 to 6 hours/day" },
      { value: "shade", label: "Shade", description: "Less than 3 hours/day" },
    ],
  },
  {
    id: "size",
    question: "How big is your space?",
    options: [
      { value: "small", label: "Small", description: "Less than 20 sqm" },
      { value: "medium", label: "Medium", description: "20 to 100 sqm" },
      { value: "large", label: "Large", description: "More than 100 sqm" },
    ],
  },
  {
    id: "goal",
    question: "What's your main goal?",
    options: [
      { value: "food", label: "Grow food", description: "Vegetables and fruits" },
      { value: "biodiversity", label: "Biodiversity", description: "Flowers and wild plants" },
      { value: "shade", label: "Shade & shelter", description: "Trees and shrubs" },
      { value: "pollinators", label: "Attract pollinators", description: "Bees and butterflies" },
    ],
  },
];

export default function Home() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [climateData, setClimateData] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const step = steps[currentStep];

  // Save the selected option for the current step
  function selectOption(value: string) {
    setAnswers({ ...answers, [step.id]: value });
  }

  // Move to the next step, or fetch climate data and submit on the last step
  async function goNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });

          // Fetch climate data from Open-Meteo
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=16`;
          const response = await fetch(url);
          const climate = await response.json();
          setClimateData(climate);

          // Send everything to our API route
          const result = await fetch("/api/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers, climate }),
          });

          const data = await result.json();
          setRecommendations(data.recommendations);
          setIsLoading(false);
        },
        (error) => {
          console.error("Location error:", error);
          setIsLoading(false);
          alert("Could not get your location. Please allow location access.");
        }
      );
    }
  }

  // Move to the previous step
  function goBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  const selected = answers[step.id];

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-lg">

        {/* Recommendations screen */}
        {recommendations.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold text-green-900 mb-2">
              Your plant recommendations
            </h2>
            <p className="text-zinc-500 text-sm mb-6">
              Based on your soil, sun exposure, and local climate.
            </p>
            <div className="flex flex-col gap-4">
              {recommendations.map((plant, i) => (
                <div key={i} className="border border-zinc-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-zinc-900">{plant.name}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      plant.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                      plant.difficulty === "Medium" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {plant.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 mb-3">{plant.why}</p>
                  <div className="flex gap-4 text-xs text-zinc-400">
                    <span>🗓 {plant.season}</span>
                    <span>🌿 Companion: {plant.companion}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setRecommendations([]);
                setCurrentStep(0);
                setAnswers({});
              }}
              className="mt-6 w-full py-2 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-all text-sm"
            >
              Start over
            </button>
          </div>

        ) : (

          /* Form screen */
          <>
            {/* Header */}
            <h1 className="text-2xl font-semibold text-green-900 mb-1">
              Find the right plants for your land
            </h1>
            <p className="text-zinc-500 mb-6 text-sm">
              Answer a few questions and we'll recommend the best plants for your space.
            </p>

            {/* Progress bar */}
            <div className="flex gap-2 mb-8">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1 flex-1 rounded-full ${i <= currentStep ? "bg-green-500" : "bg-zinc-100"}`}
                />
              ))}
            </div>

            {/* Question */}
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">
              {step.question}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-8">
              {step.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectOption(opt.value)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selected === opt.value
                      ? "border-green-500 bg-green-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="font-medium text-zinc-900">{opt.label}</div>
                  <div className="text-sm text-zinc-500">{opt.description}</div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={goBack}
                disabled={currentStep === 0}
                className="px-5 py-2 rounded-xl text-zinc-500 hover:bg-zinc-50 disabled:opacity-0 transition-all"
              >
                Back
              </button>
              <button
                onClick={goNext}
                disabled={!selected || isLoading}
                className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-all"
              >
                {isLoading ? "Getting your location..." : currentStep === steps.length - 1 ? "Get recommendations" : "Next"}
              </button>
            </div>
          </>
        )}

      </div>
    </main>
  );
}