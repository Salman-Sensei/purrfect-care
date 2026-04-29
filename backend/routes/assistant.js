const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');

/* ── Cat-care system prompt ──────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are Mochi, a friendly, knowledgeable, and slightly playful cat care assistant 
built into the Purrfect Care app. You help cat owners with:
- Daily cat care routines (feeding, grooming, playtime)
- Health and symptom questions (always recommend a vet for serious issues)
- Nutrition and diet advice
- Behaviour and training tips
- Vet visit preparation
- Understanding cat body language

Keep replies concise (2–4 sentences), warm, and occasionally use a cat-related emoji 🐱🐾.
If asked about something unrelated to cats, gently redirect: 
"I'm a cat specialist! Let me help you with something cat-related instead 🐾"
Never provide emergency medical diagnoses — always recommend a vet for serious concerns.`;

/* ── POST /api/assistant/chat ───────────────────────────────────────────── */
router.post('/chat', protect, async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ message: 'Message is required' });
  }

  /* ── If OpenRouter key exists, use the real API ── */
if (process.env.OPENROUTER_API_KEY) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-8).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: message.trim() },
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'stepfun/step-3.5-flash',
        messages,
        max_tokens: 250,
        temperature: 0.75,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('OpenRouter error:', err);
      throw new Error(err.error?.message || 'OpenRouter request failed');
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) throw new Error('Empty response from OpenRouter');

    return res.json({ reply, source: 'openrouter' });

  } catch (err) {
    console.error('[Assistant] OpenRouter error, falling back:', err.message);
  }
}

  /* ── Mock responses (no API key / fallback) ─────────────────────────── */
  const msg    = message.toLowerCase();
  const mocks  = [
    {
      match: ['feed', 'food', 'eat', 'diet', 'hungry', 'meal'],
      reply: "Most adult cats do well with two meals a day — morning and evening 🍣 Make sure fresh water is always available, and choose a high-protein diet without too many fillers. Ask your vet about the ideal portion size for your cat's weight!",
    },
    {
      match: ['groom', 'brush', 'fur', 'shed', 'hair', 'coat'],
      reply: "Regular brushing (2–3 times a week) keeps your cat's coat shiny and reduces hairballs 🛁 Short-haired cats need less frequent brushing than long-haired breeds like Persians. Most cats enjoy the bonding time!",
    },
    {
      match: ['vet', 'checkup', 'appointment', 'vaccine', 'vaccination'],
      reply: "Annual wellness exams are recommended for healthy adult cats 🏥 Kittens and senior cats (7+) may need more frequent visits. Keep a record of vaccines — your Purrfect Care vet log can help with that!",
    },
    {
      match: ['sick', 'symptom', 'vomit', 'diarrhea', 'lethargic', 'sneez', 'cough'],
      reply: "I'm sorry your cat isn't feeling well! 🐱 For any concerning symptoms lasting more than 24 hours — vomiting, lethargy, not eating — please contact your vet. Use the Symptom Helper in the app for a quick assessment!",
    },
    {
      match: ['play', 'toy', 'exercise', 'bored', 'active'],
      reply: "Cats need at least 15–20 minutes of interactive play daily 🎾 Wand toys, laser pointers, and puzzle feeders keep them mentally sharp. Multiple short sessions often work better than one long one!",
    },
    {
      match: ['litter', 'toilet', 'poop', 'pee', 'box'],
      reply: "The golden rule: one litter box per cat, plus one extra 🪣 Scoop daily and do a full clean weekly. If your cat starts avoiding the box, check for cleanliness, location, or see a vet — it can signal a health issue.",
    },
    {
      match: ['sleep', 'nap', 'rest', 'tired'],
      reply: "Cats are champion sleepers — 12 to 16 hours a day is completely normal! 🌙 Provide cosy spots at different heights. If your cat suddenly sleeps much more than usual, it's worth mentioning to your vet.",
    },
    {
      match: ['hello', 'hi', 'hey', 'meow', 'hola'],
      reply: "Meow! 🐾 Hi there! I'm Mochi, your Purrfect Care assistant. Ask me anything about cat care, feeding, health, grooming — I'm here to help!",
    },
    {
      match: ['thank', 'thanks', 'great', 'helpful', 'awesome'],
      reply: "You're so welcome! 😸 Happy to help you take great care of your furry friend. Is there anything else you'd like to know?",
    },
  ];

  for (const { match, reply } of mocks) {
    if (match.some(kw => msg.includes(kw))) {
      // Simulate a small delay like a real API
      await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
      return res.json({ reply, source: 'mock' });
    }
  }

  // Generic fallback
  await new Promise(r => setTimeout(r, 300));
  return res.json({
    reply: "Great question! 🐾 Every cat is unique. For personalised advice, the best first step is always a chat with your vet. In the meantime, feel free to use the health logs and checklists in the app to stay on top of your cat's routine!",
    source: 'mock',
  });
});

module.exports = router;
