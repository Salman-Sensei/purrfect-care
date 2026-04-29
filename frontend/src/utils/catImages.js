// Real cat photos from Unsplash (free, no API key needed)
// Format: https://images.unsplash.com/photo-{id}?w={width}&q=80&auto=format&fit=crop

export const CAT_HERO = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=85&auto=format&fit=crop'
export const CAT_HERO_2 = 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=85&auto=format&fit=crop'
export const CAT_LOGIN = 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=900&q=90&auto=format&fit=crop'
export const CAT_SYMPTOM = 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=700&q=80&auto=format&fit=crop'
export const CAT_EMPTY = 'https://images.unsplash.com/photo-1548546738-8509cb246ed3?w=400&q=85&auto=format&fit=crop'
export const CAT_VET = 'https://images.unsplash.com/photo-1721907043479-943b8b571ca9?w=600&q=85&auto=format&fit=crop'
export const CAT_CHECKLIST = 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&q=80&auto=format&fit=crop'
export const CAT_DASHBOARD = 'https://images.unsplash.com/photo-1570824104453-508955ab713e?w=600&q=85&auto=format&fit=crop'
export const CAT_SLEEPING = 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&q=80&auto=format&fit=crop'
export const CAT_PLAYFUL  = 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&q=80&auto=format&fit=crop'
export const CAT_CUTE     = 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=500&q=80&auto=format&fit=crop'

// Placeholder avatars for cats (varied breeds)
export const CAT_AVATARS = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=200&q=80&auto=format&fit=crop',
]

// Get a consistent avatar for a cat based on its ID
export const getCatAvatar = (catId) => {
  if (!catId) return CAT_AVATARS[0]
  const idx = catId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % CAT_AVATARS.length
  return CAT_AVATARS[idx]
}
