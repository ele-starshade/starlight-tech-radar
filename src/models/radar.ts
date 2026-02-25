import { z } from 'zod'

export const QuadrantEnum = z.enum([
  'Techniques',
  'Platforms',
  'Tools',
  'Languages & Frameworks'
])

export const RingEnum = z.enum([
  'Adopt',
  'Trial',
  'Assess',
  'Hold'
])

export const LicenseMetadataSchema = z.object({
  spdx_id: z.string(),
  name: z.string(),
  url: z.string().url()
})

export const BlipSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  quadrant: QuadrantEnum,
  ring: RingEnum,
  isNew: z.boolean(),
  description: z.string(),
  repoUrl: z.string().url(),
  guidanceLink: z.string().url(),
  license: LicenseMetadataSchema.optional(),
  rating: z.string().optional() // Placeholder for Blue Oak rating
})

export const RadarConfigurationSchema = z.object({
  quadrants: z.array(z.string()).length(4),
  rings: z.array(z.string()).max(4),
  blips: z.array(BlipSchema)
})

export type Quadrant = z.infer<typeof QuadrantEnum>
export type Ring = z.infer<typeof RingEnum>
export type Blip = z.infer<typeof BlipSchema>
export type RadarConfiguration = z.infer<typeof RadarConfigurationSchema>
export type LicenseMetadata = z.infer<typeof LicenseMetadataSchema>
