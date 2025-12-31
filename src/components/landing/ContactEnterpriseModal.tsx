'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useContactEnterprise } from '@/hooks/useApi'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactEnterpriseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactEnterpriseModal({
  open,
  onOpenChange,
}: ContactEnterpriseModalProps) {
  const t = useTranslations('contactEnterprise')
  const common = useTranslations('common')

  const [status, setStatus] = React.useState<'idle' | 'success' | 'error' | 'rateLimit'>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const contactMutation = useContactEnterprise()

  const onSubmit = async (data: ContactFormData) => {
    try {
      await contactMutation.mutateAsync(data)
      setStatus('success')
      reset()
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit')) {
        setStatus('rateLimit')
      } else {
        setStatus('error')
      }
    }
  }

  const handleClose = () => {
    setStatus('idle')
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <p className="text-center text-foreground-light">
              {t('successMessage')}
            </p>
            <Button onClick={handleClose}>{common('close')}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {status === 'error' && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{t('errorMessage')}</p>
              </div>
            )}

            {status === 'rateLimit' && (
              <div className="flex items-center gap-2 rounded-md bg-warning/10 p-3 text-warning">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{t('rateLimitMessage')}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t('nameLabel')}</Label>
              <Input
                id="name"
                placeholder={t('namePlaceholder')}
                error={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                error={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{t('messageLabel')}</Label>
              <textarea
                id="message"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('messagePlaceholder')}
                {...register('message')}
              />
              {errors.message && (
                <p className="text-sm text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {common('cancel')}
              </Button>
              <Button type="submit" isLoading={contactMutation.isPending}>
                {common('submit')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
