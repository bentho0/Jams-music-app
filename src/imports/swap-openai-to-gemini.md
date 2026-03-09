Swap OpenAI API with Google Gemini API
Find every place in the codebase where OpenAI API is used and replace it with Google Gemini API. Do not change any other logic, UI, or functionality — only swap the AI provider.

Step 1 — Remove OpenAI Dependencies
Find and remove:

Any openai npm package imports or references
Any import OpenAI from 'openai' or const OpenAI = require('openai')
Any new OpenAI({ apiKey: ... }) client initialization
Any openai.chat.completions.create(...) calls
All references to OPENAI_API_KEY


Step 2 — Install Nothing New
Gemini does not need an SDK. All calls are made via native fetch. No new packages required.

Step 3 — Update Supabase Secrets Reference
Everywhere the code references OPENAI_API_KEY, replace with GEMINI_API_KEY.
In your Supabase edge function, update the environment variable read from:
javascriptconst apiKey = Deno.env.get("OPENAI_API_KEY");
to:
javascriptconst apiKey = Deno.env.get("GEMINI_API_KEY");

Step 4 — Replace the API Call
Find every openai.chat.completions.create(...) block and replace it with this exact pattern:
Before (OpenAI):
javascriptconst completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  temperature: 0.9,
});

const result = completion.choices[0].message.content;
After (Gemini):
javascriptconst response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2000,
      }
    })
  }
);

const data = await response.json();
const result = data.candidates[0].content.parts[0].text;

Step 5 — Update JSON Parsing
OpenAI responses are usually clean. Gemini sometimes wraps JSON in markdown code fences. Add this sanitization step immediately after extracting the result:
javascriptconst raw = data.candidates[0].content.parts[0].text;
const cleaned = raw.replace(/```json|```/g, "").trim();
const playlist = JSON.parse(cleaned);
Always parse this way — never assume the response is already clean JSON.

Step 6 — Update Error Handling
Replace any OpenAI-specific error handling with this:
javascriptif (!response.ok) {
  const error = await response.json();
  throw new Error(`Gemini API error: ${error.error?.message || response.status}`);
}

if (!data.candidates || data.candidates.length === 0) {
  throw new Error("Gemini returned no candidates");
}

Step 7 — Update Environment Variables
In Supabase:

Delete the OPENAI_API_KEY secret
Add a new secret: GEMINI_API_KEY with your Google Gemini API key
Redeploy the edge function after saving


What stays exactly the same:

Your system prompt and user prompt content
All playlist generation logic
Spotify search and saving functionality
All UI and frontend code
Supabase database logic
Every other feature in the app

What changes:

The API endpoint being called
The request body structure
The response parsing path
The environment variable name
Removal of the OpenAI SDK