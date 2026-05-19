const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Cat = require('../models/Cat');

const BASE_SYSTEM_PROMPT = `You are Dr. Paws, an expert feline veterinarian inside the Purrfect Care app.

You talk to cat owners — many of whom have no medical background. Always explain things simply, like talking to a friend who loves their cat but knows nothing about medicine.

YOUR CONSULTATION STYLE:
- Act like a real vet doing a consultation — gather information before concluding
- If the owner's message is vague or missing key details, ask 1-2 focused follow-up questions before giving advice
- If the owner has cat profiles (listed below), use that information — you already know the cat's name, age, breed, weight, health conditions, and allergies
- Only give a full diagnosis and treatment plan when you feel you have enough information
- Never ask more than 2 questions at a time — keep it conversational

WHEN YOU HAVE ENOUGH INFO:
- Acknowledge what the owner described so they feel heard
- Refer to the cat by name if you know it
- Explain in plain English what might be causing the symptom
- Give specific actionable home care steps (e.g. "withhold food for 2 hours", "apply warm compress")
- Mention specific treatments, vaccines, or medications by name when relevant (e.g. "feline calicivirus vaccine", "deworming treatment")
- Keep it conversational — 3 to 5 sentences, no bullet points, no headers
- Be warm, calm, and reassuring

NEEDS_VET SIGNAL — add this on the very last line of EVERY response:
NEEDS_VET: true   ← for: breathing difficulty, seizures, blood, collapse, not eating 24h+, severe lethargy, suspected poisoning, trauma
NEEDS_VET: false  ← for everything mild or manageable at home

If NEEDS_VET is true, add 2 vet clinic suggestions after it:
VET_LINK: Clinic Name | Full Address | https://maps.google.com/?q=Clinic+Name`;

// Fallback model chain — non-reasoning models only
const MODELS = [
  'deepseek/deepseek-v4-flash:free',
  'google/gemma-4-31b-it:free',
  'z-ai/glm-4.5-air:free',
];

async function callOpenRouter(messages) {
  for (const model of MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, temperature: 0.3, max_tokens: 450, messages }),
      });

      const data = await response.json();
      console.log(`[VetAssistant] Model: ${model} | Status: ${response.status}`);

      if (response.status === 429 || response.status === 503) {
        console.log(`[VetAssistant] ${model} rate limited, trying next...`);
        continue;
      }

      if (!response.ok) {
        throw new Error(`OpenRouter error ${response.status}: ${data.error?.message}`);
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content || content.trim().length === 0) {
        console.log(`[VetAssistant] ${model} empty content, trying next...`);
        continue;
      }

      return content;
    } catch (err) {
      console.error(`[VetAssistant] ${model} failed:`, err.message);
      continue;
    }
  }
  throw new Error('All models failed or are rate limited');
}

function buildSystemPrompt(cats) {
  if (!cats || cats.length === 0) return BASE_SYSTEM_PROMPT;

  const catProfiles = cats.map((cat, i) => {
    const lines = [`Cat ${i + 1}: ${cat.name}`];
    if (cat.age)              lines.push(`  Age: ${cat.age}`);
    if (cat.breed)            lines.push(`  Breed: ${cat.breed}`);
    if (cat.weight)           lines.push(`  Weight: ${cat.weight} kg`);
    if (cat.healthConditions) lines.push(`  Known health conditions: ${cat.healthConditions}`);
    if (cat.allergies)        lines.push(`  Allergies: ${cat.allergies}`);
    if (cat.notes)            lines.push(`  Notes: ${cat.notes}`);
    return lines.join('\n');
  }).join('\n\n');

  return `${BASE_SYSTEM_PROMPT}

---
OWNER'S CAT PROFILES:
${catProfiles}
---
Use this information when the owner refers to their cat. If they say "my cat" and there's only one profile, assume it's that cat.`;
}

function parseResponse(raw) {
  // Strip reasoning/thinking blocks some models expose
  const stripped = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  const lines = stripped.split('\n');
  const vetLinks = [];
  let needsVet = false;
  const textLines = [];

  for (const line of lines) {
    if (line.startsWith('NEEDS_VET:')) {
      needsVet = line.includes('true');
    } else if (line.startsWith('VET_LINK:')) {
      const parts = line.replace('VET_LINK:', '').trim().split('|');
      if (parts.length >= 3) {
        vetLinks.push({
          name: parts[0].trim(),
          address: parts[1].trim(),
          mapsUrl: parts[2].trim(),
        });
      }
    } else {
      textLines.push(line);
    }
  }

  return {
    reply: textLines.join('\n').trim(),
    needsVet,
    vets: vetLinks,
  };
}

router.post('/chat', protect, async (req, res) => {
  try {
    const { input, history = [] } = req.body;

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({ message: 'Input is required' });
    }

    // Fetch user's cat profiles to inject into system prompt
    const cats = await Cat.find({ userId: req.user._id }).lean();

    const systemPrompt = buildSystemPrompt(cats);

    // Build message history for multi-turn conversation
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: input.trim() },
    ];

    const raw = await callOpenRouter(messages);
    const parsed = parseResponse(raw);

    res.json(parsed);
  } catch (err) {
    console.error('[VetAssistant] Error:', err.message);
    res.status(500).json({ message: 'AI assistant failed. Please try again.' });
  }
});

module.exports = router;
