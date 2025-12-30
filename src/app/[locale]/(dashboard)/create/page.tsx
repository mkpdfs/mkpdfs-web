import { redirect } from 'next/navigation'

// Redirect old /create route to /ai-generate for backwards compatibility
export default function CreatePage() {
  redirect('/ai-generate')
}
