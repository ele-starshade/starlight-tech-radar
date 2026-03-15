export function getQuadrantTranslationKey (quadrant: string): string {
  const mapping: Record<string, string> = {
    Techniques: 'radar.quadrants.techniques',
    Platforms: 'radar.quadrants.platforms',
    Tools: 'radar.quadrants.tools',
    'Languages & Frameworks': 'radar.quadrants.languages'
  }

  return mapping[quadrant] || quadrant
}

export function getRatingColor (rating?: string): string {
  if (rating === 'Gold') return 'amber-9'
  if (rating === 'Silver') return 'grey-6'
  if (rating === 'Bronze') return 'deep-orange-9'
  if (rating === 'Approved') return 'positive'

  return 'grey-5'
}
