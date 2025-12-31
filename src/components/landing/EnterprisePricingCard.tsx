'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { ContactEnterpriseModal } from './ContactEnterpriseModal'

interface EnterprisePricingCardProps {
  name: string
  description: string
  price: string
  features: string[]
  contactSalesText: string
}

export function EnterprisePricingCard({
  name,
  description,
  price,
  features,
  contactSalesText,
}: EnterprisePricingCardProps) {
  const [modalOpen, setModalOpen] = React.useState(false)

  return (
    <>
      <div className="relative rounded-2xl bg-card p-8 shadow-sm h-full border border-border">
        <h3 className="text-lg font-semibold text-foreground-dark">{name}</h3>
        <p className="mt-1 text-sm text-foreground-light">{description}</p>
        <p className="mt-4 text-4xl font-bold text-foreground-dark">{price}</p>

        <ul className="mt-6 space-y-3">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-3 text-sm text-foreground-light"
            >
              <Check className="h-4 w-4 flex-shrink-0 text-success" />
              {feature}
            </li>
          ))}
        </ul>

        <button
          onClick={() => setModalOpen(true)}
          className="mt-8 block w-full rounded-md border border-border px-4 py-2.5 text-center text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          {contactSalesText}
        </button>
      </div>

      <ContactEnterpriseModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
