'use client'

import { useState } from 'react'
import { ContactEnterpriseModal } from './ContactEnterpriseModal'

interface ContactLinkProps {
  children: React.ReactNode
  className?: string
}

// Inline link that opens the contact-sales modal (custom templates, enterprise, contact).
export function ContactLink({ children, className }: ContactLinkProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <ContactEnterpriseModal open={open} onOpenChange={setOpen} />
    </>
  )
}
