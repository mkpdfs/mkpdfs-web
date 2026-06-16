// Types for the branding wizard draft state — shared between UI components and the
// draftToThemeInput helper to avoid component→lib import cycles.
import { uploadLogoFile } from '@/lib/api'
import type { ThemeInput } from '@/types'

export type LogoDraft =
  | { kind: 'upload'; file: File; previewUrl: string }
  | { kind: 'url'; url: string }
  | { kind: 'existing'; s3Key: string }
  | null

export type WizardDraft = {
  brand: string
  accent: string
  fontKey: string
  logo: LogoDraft
}

/** Resolves a WizardDraft into a ThemeInput, uploading any local file along the way. */
export async function draftToThemeInput(d: WizardDraft): Promise<ThemeInput> {
  let logo: ThemeInput['logo']
  if (d.logo === null) {
    logo = null
  } else if (d.logo.kind === 'url') {
    logo = { source: 'url', url: d.logo.url }
  } else if (d.logo.kind === 'existing') {
    logo = { source: 'upload', s3Key: d.logo.s3Key }
  } else {
    // kind === 'upload' — upload the file now
    logo = { source: 'upload', s3Key: await uploadLogoFile(d.logo.file) }
  }
  return { brand: d.brand, accent: d.accent, fontKey: d.fontKey, ...(logo !== undefined ? { logo } : {}) }
}
