const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Cat = require('../models/Cat');

/* ── POST /api/products/recommend ──────────────────────────────────────────
   Body: { catId, category, country? }
   Returns: { products: [ { name, description, why, searchQuery, links: [{label,url}] } ] }
────────────────────────────────────────────────────────────────────────── */
router.post('/recommend', protect, async (req, res) => {
  const { catId, category, country = 'US' } = req.body;

  if (!catId || !category) {
    return res.status(400).json({ message: 'catId and category are required' });
  }

  // Fetch the cat and verify ownership
  const cat = await Cat.findOne({ _id: catId, userId: req.user._id });
  if (!cat) {
    return res.status(404).json({ message: 'Cat not found' });
  }

  // Build a rich cat profile string for the prompt
  const profile = [
    `Name: ${cat.name}`,
    `Age: ${cat.age}`,
    cat.breed        ? `Breed: ${cat.breed}`                         : null,
    cat.weight       ? `Weight: ${cat.weight}kg`                     : null,
    cat.healthConditions?.trim() ? `Health conditions: ${cat.healthConditions}` : null,
    cat.allergies?.trim()        ? `Allergies: ${cat.allergies}`     : null,
    cat.notes?.trim()            ? `Additional notes: ${cat.notes}`  : null,
  ].filter(Boolean).join(', ');

  // Geo-aware retailer guidance
  const retailerGuide = {
    PK: 'Pakistan — prefer Daraz.pk, OLX.com.pk, PetZone.pk, Petshop.pk, and local pet stores. Use PKR prices where possible.',
    US: 'United States — prefer Chewy.com, Amazon.com, PetSmart.com, Petco.com.',
    GB: 'United Kingdom — prefer Zooplus.co.uk, Pets at Home, Amazon.co.uk, VioVet.co.uk.',
    CA: 'Canada — prefer Chewy.ca, PetSmart.ca, Amazon.ca, Global Pet Foods.',
    AU: 'Australia — prefer PetBarn.com.au, MyPetWarehouse.com.au, Amazon.com.au.',
    AE: 'UAE — prefer Noon.com, Amazon.ae, PetZone.ae, Vet Shop.',
    IN: 'India — prefer Amazon.in, Flipkart, Heads Up For Tails, PetKart.in.',
    DE: 'Germany — prefer Zooplus.de, Amazon.de, Fressnapf.de.',
  };
  const retailerHint = retailerGuide[country] || `Country code: ${country} — suggest popular local and international online pet retailers.`;

  const systemPrompt = `You are a cat product expert. Given a cat's profile and a product category, 
you return exactly 5 product recommendations as a JSON array. 
Each item must have these fields:
- name: product name (string)
- brand: brand name (string)  
- description: 1-sentence description (string)
- why: 1 sentence explaining why it suits THIS specific cat (string)
- priceRange: estimated price range e.g. "$10–$20" (string)
- searchQuery: a short Google search query to find this product (string)
- links: array of 2–3 objects with { label: "retailer name", url: "full https URL to search results or product page" }

Retailer guidance: ${retailerHint}

For links, construct real search URLs like:
- Daraz: https://www.daraz.pk/catalog/?q=QUERY
- Amazon: https://www.amazon.com/s?k=QUERY  
- Chewy: https://www.chewy.com/s?query=QUERY
- PetSmart: https://www.petsmart.com/search/?q=QUERY
- Zooplus: https://www.zooplus.co.uk/shop/search?q=QUERY
Replace QUERY with URL-encoded search terms relevant to the product.

Return ONLY valid JSON array, no markdown, no explanation.`;

  const userMessage = `Cat profile: ${profile}
Product category: ${category}
Recommend 5 products tailored to this cat.`;

  // Try OpenRouter first
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'stepfun/step-3.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userMessage  },
          ],
          max_tokens: 1200,
          temperature: 0.6,
        }),
      });

      if (!response.ok) throw new Error('OpenRouter request failed');

      const data  = await response.json();
      const raw   = data.choices?.[0]?.message?.content?.trim();
      if (!raw) throw new Error('Empty response');

      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const products = JSON.parse(cleaned);

      return res.json({ products, source: 'ai', cat: { name: cat.name, breed: cat.breed } });

    } catch (err) {
      console.error('[Products] OpenRouter error, falling back:', err.message);
    }
  }

  // Fallback: curated static recommendations per category
  const fallback = getFallbackProducts(category, cat, country);
  return res.json({ products: fallback, source: 'fallback', cat: { name: cat.name, breed: cat.breed } });
});

/* ── Static fallback recommendations ──────────────────────────────────────── */
function getFallbackProducts(category, cat, country) {
  const q      = (term) => encodeURIComponent(`${term} cat`)
  const amazon = (term) => `https://www.amazon.com/s?k=${q(term)}`
  const chewy  = (term) => `https://www.chewy.com/s?query=${q(term)}`
  const daraz  = (term) => `https://www.daraz.pk/catalog/?q=${q(term)}`
  const isPK   = country === 'PK'
  const link   = (term) => isPK
    ? [{ label: 'Daraz', url: daraz(term) }, { label: 'Amazon', url: amazon(term) }]
    : [{ label: 'Chewy', url: chewy(term) }, { label: 'Amazon', url: amazon(term) }]

  const catalog = {
    food: [
      { name: 'Royal Canin Breed Specific Dry Food', brand: 'Royal Canin', description: 'Tailored nutrition formulated for specific cat breeds.', why: `Great for ${cat.breed || 'your cat'}'s unique dietary needs.`, priceRange: '$25–$60', links: link('Royal Canin cat food') },
      { name: "Hill's Science Diet Adult Cat Food", brand: "Hill's", description: 'Vet-recommended balanced nutrition for adult cats.', why: 'Supports healthy weight and digestion.', priceRange: '$20–$50', links: link('Hills Science Diet cat food') },
      { name: 'Purina Pro Plan High Protein', brand: 'Purina', description: 'High-protein formula with real chicken as first ingredient.', why: 'Ideal for active cats needing lean muscle support.', priceRange: '$18–$45', links: link('Purina Pro Plan cat food') },
      { name: 'Wellness CORE Grain-Free', brand: 'Wellness', description: 'Grain-free, protein-rich formula with no fillers.', why: 'Good choice if your cat has grain sensitivities.', priceRange: '$22–$55', links: link('Wellness CORE cat food') },
      { name: 'Fancy Feast Gravy Lovers', brand: 'Fancy Feast', description: 'Wet food with rich gravy to boost hydration.', why: "Helps cats who don't drink enough water stay hydrated.", priceRange: '$10–$25', links: link('Fancy Feast wet cat food') },
    ],
    grooming: [
      { name: 'Hertzko Self-Cleaning Slicker Brush', brand: 'Hertzko', description: 'Removes loose fur and detangles with retractable bristles.', why: 'Easy to clean and gentle on sensitive skin.', priceRange: '$15–$25', links: link('cat slicker brush') },
      { name: 'FURminator Deshedding Tool', brand: 'FURminator', description: 'Reduces shedding up to 90% with stainless steel edge.', why: `Perfect for ${cat.breed || 'cats'} that shed heavily.`, priceRange: '$25–$45', links: link('FURminator cat deshedding tool') },
      { name: "Burt's Bees Hypoallergenic Cat Shampoo", brand: "Burt's Bees", description: 'Gentle, tearless formula safe for sensitive cats.', why: 'Ideal if your cat has skin sensitivities or allergies.', priceRange: '$8–$15', links: link('hypoallergenic cat shampoo') },
      { name: 'Safari Cat Nail Trimmer', brand: 'Safari', description: 'Stainless steel blades for clean, safe nail trims.', why: 'Keeps claws healthy and prevents scratching damage.', priceRange: '$8–$12', links: link('cat nail trimmer') },
      { name: "Vet's Best Ear Cleaner", brand: "Vet's Best", description: 'Gentle ear cleaning solution with aloe and tea tree oil.', why: 'Helps prevent ear infections in indoor cats.', priceRange: '$8–$14', links: link('cat ear cleaner') },
    ],
    toys: [
      { name: 'Da Bird Feather Wand', brand: 'Go Cat', description: 'Interactive wand toy that mimics real bird movement.', why: 'Satisfies natural hunting instincts with engaging play.', priceRange: '$10–$18', links: link('feather wand cat toy') },
      { name: 'KONG Kickeroo Cat Toy', brand: 'KONG', description: 'Crinkle and catnip-filled kicker for solo play.', why: 'Great for cats who love to wrestle and bunny-kick.', priceRange: '$8–$14', links: link('KONG cat kicker toy') },
      { name: 'PetFusion Ambush Interactive Toy', brand: 'PetFusion', description: 'Electronic feather toy that pops out unpredictably.', why: "Keeps cats entertained even when you're busy.", priceRange: '$20–$35', links: link('electronic cat toy') },
      { name: 'Catit Senses 2.0 Digger', brand: 'Catit', description: 'Puzzle feeder that slows eating and stimulates the mind.', why: 'Excellent mental enrichment for indoor cats.', priceRange: '$12–$20', links: link('cat puzzle feeder toy') },
      { name: 'SmartyKat Hot Pursuit Toy', brand: 'SmartyKat', description: 'Concealed motion toy with unpredictable wand movement.', why: 'Triggers prey drive for active, playful cats.', priceRange: '$12–$22', links: link('SmartyKat cat toy') },
    ],
    health: [
      { name: 'Zesty Paws Multivitamin Bites', brand: 'Zesty Paws', description: 'All-in-one supplement for immune, skin, and joint health.', why: 'Supports overall wellness especially for aging cats.', priceRange: '$20–$35', links: link('cat multivitamin supplement') },
      { name: 'Vetri-Science Hairball Support', brand: 'Vetri-Science', description: 'Chewable supplement to reduce hairball formation.', why: 'Helpful for cats that groom frequently.', priceRange: '$15–$25', links: link('cat hairball supplement') },
      { name: 'Purina FortiFlora Probiotic', brand: 'Purina', description: 'Vet-recommended probiotic for digestive health.', why: 'Supports gut health and reduces digestive upset.', priceRange: '$25–$40', links: link('cat probiotic FortiFlora') },
      { name: 'Cosequin Joint Health Supplement', brand: 'Cosequin', description: 'Glucosamine and chondroitin for joint support.', why: `Important for ${cat.age} cats to maintain mobility.`, priceRange: '$20–$40', links: link('cat joint supplement') },
      { name: 'Feliway Classic Calming Diffuser', brand: 'Feliway', description: 'Pheromone diffuser that reduces stress and anxiety.', why: 'Helps cats feel safe in their environment.', priceRange: '$25–$45', links: link('Feliway cat calming diffuser') },
    ],
    bedding: [
      { name: 'K&H Pet Products Heated Cat Bed', brand: 'K&H', description: 'Orthopedic heated bed with removable washable cover.', why: 'Provides warmth and joint relief for comfortable sleep.', priceRange: '$30–$60', links: link('heated cat bed') },
      { name: 'Aspen Pet Self-Warming Bed', brand: 'Aspen Pet', description: 'Reflects body heat without electricity for cosy warmth.', why: 'Safe, energy-free warmth for cats who love to curl up.', priceRange: '$15–$30', links: link('self warming cat bed') },
      { name: 'Furhaven Orthopedic Cat Sofa', brand: 'Furhaven', description: 'Memory foam sofa-style bed with bolster sides.', why: 'Great for cats who like to rest their head on edges.', priceRange: '$25–$50', links: link('orthopedic cat bed') },
      { name: 'Meowfia Premium Felt Cat Cave', brand: 'Meowfia', description: 'Handmade wool felt cave for cats who love enclosed spaces.', why: 'Perfect for shy or anxious cats needing a safe hideout.', priceRange: '$35–$55', links: link('felt cat cave') },
      { name: 'Catit Vesper Cat Condo', brand: 'Catit', description: 'Multi-level condo with hideaway and perch.', why: 'Gives cats vertical space and a cosy sleeping spot.', priceRange: '$60–$100', links: link('cat condo tower') },
    ],
    litter: [
      { name: 'Dr. Elsey\'s Ultra Premium Clumping Litter', brand: "Dr. Elsey's", description: 'Hard-clumping, low-dust litter with superior odour control.', why: 'Great for cats sensitive to dust or strong scents.', priceRange: '$15–$30', links: link('clumping cat litter') },
      { name: 'Arm & Hammer Clump & Seal', brand: 'Arm & Hammer', description: 'Baking soda formula seals and destroys odours on contact.', why: 'Keeps the litter box fresh for multi-cat households.', priceRange: '$12–$25', links: link('Arm Hammer cat litter') },
      { name: 'Nature\'s Miracle Hooded Litter Box', brand: "Nature's Miracle", description: 'Hooded box with built-in odour control and easy-clean design.', why: 'Gives cats privacy and reduces litter scatter.', priceRange: '$25–$45', links: link('hooded cat litter box') },
      { name: 'PetSafe ScoopFree Self-Cleaning Litter Box', brand: 'PetSafe', description: 'Automatic rake cleans waste 20 minutes after use.', why: 'Ideal for busy owners who want a low-maintenance setup.', priceRange: '$100–$160', links: link('self cleaning litter box') },
      { name: 'Tidy Cats Breeze Litter System', brand: 'Tidy Cats', description: 'Pellet system separates solid and liquid waste.', why: 'Reduces odour and makes cleaning much easier.', priceRange: '$30–$50', links: link('Tidy Cats Breeze litter system') },
    ],
    carrier: [
      { name: 'Sherpa Original Deluxe Carrier', brand: 'Sherpa', description: 'Airline-approved soft-sided carrier with mesh panels.', why: 'Comfortable and secure for travel-anxious cats.', priceRange: '$40–$70', links: link('soft cat carrier airline approved') },
      { name: 'Petmate Two-Door Top-Load Carrier', brand: 'Petmate', description: 'Hard-sided carrier with top and front door access.', why: 'Easy loading for cats that resist going in head-first.', priceRange: '$25–$45', links: link('hard cat carrier two door') },
      { name: 'Morpilot Expandable Cat Backpack', brand: 'Morpilot', description: 'Bubble window backpack with expandable side panels.', why: 'Great for cats who enjoy watching the world go by.', priceRange: '$35–$60', links: link('cat backpack carrier bubble') },
      { name: 'SportPet Designs Pop Open Carrier', brand: 'SportPet', description: 'Foldable pop-open carrier for quick setup and storage.', why: 'Convenient for vet visits and short trips.', priceRange: '$20–$35', links: link('pop open cat carrier') },
      { name: 'K&H Travel Safety Carrier', brand: 'K&H', description: 'Crash-tested carrier with seatbelt attachment loop.', why: 'Keeps your cat safe during car journeys.', priceRange: '$50–$80', links: link('crash tested cat car carrier') },
    ],
    dental: [
      { name: 'Virbac CET Enzymatic Toothpaste', brand: 'Virbac', description: 'Vet-recommended enzymatic toothpaste in poultry flavour.', why: 'Safe to swallow and effective at reducing plaque.', priceRange: '$8–$14', links: link('cat enzymatic toothpaste') },
      { name: 'Arm & Hammer Cat Dental Kit', brand: 'Arm & Hammer', description: 'Complete kit with toothbrush, finger brush, and paste.', why: 'Everything needed to start a dental care routine.', priceRange: '$8–$15', links: link('cat dental kit toothbrush') },
      { name: 'Greenies Feline Dental Treats', brand: 'Greenies', description: 'Crunchy treats that clean teeth and freshen breath.', why: 'Easy way to support dental health without brushing.', priceRange: '$8–$18', links: link('Greenies cat dental treats') },
      { name: 'TropiClean Fresh Breath Water Additive', brand: 'TropiClean', description: 'Add to water bowl to reduce plaque and freshen breath.', why: 'Effortless dental care for cats that resist brushing.', priceRange: '$8–$14', links: link('cat water additive dental') },
      { name: 'Oxyfresh Pet Dental Gel', brand: 'Oxyfresh', description: 'Odourless, tasteless gel applied to gums with a finger.', why: 'Ideal for cats that refuse toothbrushes entirely.', priceRange: '$12–$20', links: link('cat dental gel gum') },
    ],
    scratching: [
      { name: 'Pioneer Pet SmartCat Ultimate Scratching Post', brand: 'Pioneer Pet', description: 'Tall sisal post that lets cats fully stretch while scratching.', why: 'Redirects scratching away from furniture.', priceRange: '$25–$40', links: link('tall sisal cat scratching post') },
      { name: 'Catit Style Scratcher with Catnip', brand: 'Catit', description: 'Corrugated cardboard scratcher with catnip included.', why: 'Satisfies the urge to scratch and claw naturally.', priceRange: '$10–$20', links: link('cardboard cat scratcher catnip') },
      { name: 'PetFusion Ultimate Cat Scratcher Lounge', brand: 'PetFusion', description: 'Curved cardboard lounge that doubles as a bed.', why: 'Cats can scratch and nap in the same spot.', priceRange: '$30–$50', links: link('PetFusion cat scratcher lounge') },
      { name: 'Hepper Hi-Lo Cat Scratcher', brand: 'Hepper', description: 'Adjustable angle scratcher for different scratching styles.', why: 'Suits cats who prefer horizontal or angled surfaces.', priceRange: '$35–$55', links: link('adjustable cat scratcher') },
      { name: 'SoftPaws Nail Caps', brand: 'SoftPaws', description: 'Vinyl nail caps that prevent scratching damage.', why: 'Humane alternative to declawing for indoor cats.', priceRange: '$10–$18', links: link('SoftPaws cat nail caps') },
    ],
  }

  // ── Keyword map: custom input → catalog key ──────────────────────────────
  const keywordMap = [
    { keys: ['food', 'eat', 'diet', 'nutrition', 'feed', 'meal', 'treat', 'wet', 'dry', 'kibble'], cat: 'food' },
    { keys: ['groom', 'brush', 'shampoo', 'bath', 'fur', 'coat', 'nail', 'ear', 'shed', 'hair'], cat: 'grooming' },
    { keys: ['toy', 'play', 'game', 'hunt', 'wand', 'laser', 'puzzle', 'interactive', 'catnip'], cat: 'toys' },
    { keys: ['health', 'vitamin', 'supplement', 'probiotic', 'wellness', 'immune', 'joint', 'calm', 'anxiety', 'stress', 'hairball'], cat: 'health' },
    { keys: ['bed', 'sleep', 'nap', 'rest', 'cave', 'condo', 'perch', 'comfort', 'cushion', 'blanket'], cat: 'bedding' },
    { keys: ['litter', 'toilet', 'box', 'poop', 'waste', 'scoop', 'sand'], cat: 'litter' },
    { keys: ['carrier', 'travel', 'bag', 'backpack', 'transport', 'vet visit', 'trip', 'car'], cat: 'carrier' },
    { keys: ['dental', 'teeth', 'tooth', 'breath', 'gum', 'oral', 'mouth'], cat: 'dental' },
    { keys: ['scratch', 'claw', 'post', 'scratcher', 'furniture', 'nail cap'], cat: 'scratching' },
  ]

  const input = category.toLowerCase().trim()

  // 1. Exact match
  if (catalog[input]) return catalog[input]

  // 2. Keyword fuzzy match
  for (const { keys, cat: catKey } of keywordMap) {
    if (keys.some(k => input.includes(k))) return catalog[catKey]
  }

  // 3. No match — generate generic results using the custom category as search term
  const customTerm = `${category} cat`
  return [
    { name: `Top-Rated ${category} for Cats`, brand: 'Various', description: `Popular ${category.toLowerCase()} products highly rated by cat owners.`, why: `Chosen based on ${cat.name}'s profile and your search.`, priceRange: 'Varies', links: link(customTerm) },
    { name: `${category} — Vet Recommended`, brand: 'Various', description: `Vet-approved ${category.toLowerCase()} options for cats.`, why: 'Recommended by veterinary professionals.', priceRange: 'Varies', links: link(`vet recommended ${customTerm}`) },
    { name: `Best ${category} for ${cat.breed || 'Cats'}`, brand: 'Various', description: `Top picks for ${cat.breed || 'cats'} in the ${category.toLowerCase()} category.`, why: `Suited to ${cat.breed || 'your cat'}'s needs.`, priceRange: 'Varies', links: link(`${cat.breed || 'cat'} ${category}`) },
    { name: `Budget-Friendly ${category}`, brand: 'Various', description: `Affordable ${category.toLowerCase()} options without compromising quality.`, why: 'Great value for everyday use.', priceRange: 'Varies', links: link(`affordable ${customTerm}`) },
    { name: `Premium ${category} for Cats`, brand: 'Various', description: `High-end ${category.toLowerCase()} products for discerning cat owners.`, why: 'Premium quality for cats that deserve the best.', priceRange: 'Varies', links: link(`premium ${customTerm}`) },
  ]
}

module.exports = router;
