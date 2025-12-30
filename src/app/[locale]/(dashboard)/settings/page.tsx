'use client'

import { useAuth } from '@/providers'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Label } from '@/components/ui'
import { User, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const { user } = useAuth()
  const t = useTranslations('settings')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground-dark">{t('title')}</h1>
        <p className="mt-1 text-sm text-foreground-light">
          {t('subtitle')}
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            {t('profile.title')}
          </CardTitle>
          <CardDescription>
            {t('profile.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t('profile.name')}</Label>
              <Input id="name" defaultValue={user?.name || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.email')}</Label>
              <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
            </div>
          </div>
          <Button>{t('profile.save')}</Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5" />
            {t('password.title')}
          </CardTitle>
          <CardDescription>
            {t('password.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t('password.current')}</Label>
            <Input id="current-password" type="password" placeholder={t('password.currentPlaceholder')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('password.new')}</Label>
              <Input id="new-password" type="password" placeholder={t('password.newPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('password.confirm')}</Label>
              <Input id="confirm-password" type="password" placeholder={t('password.confirmPlaceholder')} />
            </div>
          </div>
          <Button>{t('password.submit')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
