'use client'

import { useState, useEffect } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/providers'
import { confirmSignUp, signInWithGoogle, isOAuthConfigured } from '@/lib/auth'
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, PageLoader } from '@/components/ui'
import { Eye, EyeOff, FileText, Check, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, signIn, isAuthenticated, isLoading, isInitializing, error, clearError } = useAuth()
  const t = useTranslations('auth.register')
  const login = useTranslations('auth.login')

  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const oauthEnabled = isOAuthConfigured()

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      setIsGoogleLoading(false)
    }
  }

  // Password requirements
  const passwordRequirements = [
    { label: t('requirements.minLength'), met: password.length >= 8 },
    { label: t('requirements.uppercase'), met: /[A-Z]/.test(password) },
    { label: t('requirements.lowercase'), met: /[a-z]/.test(password) },
    { label: t('requirements.number'), met: /[0-9]/.test(password) },
    { label: t('requirements.specialChar'), met: /[^A-Za-z0-9]/.test(password) },
  ]

  const allRequirementsMet = passwordRequirements.every((req) => req.met)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isInitializing, isAuthenticated, router])

  // Clear error when inputs change
  useEffect(() => {
    if (error || localError) {
      clearError()
      setLocalError(null)
    }
  }, [email, password, name, verificationCode])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!allRequirementsMet) {
      setLocalError(t('passwordNotMet'))
      return
    }

    if (!passwordsMatch) {
      setLocalError(t('passwordMismatch'))
      return
    }

    setIsSubmitting(true)

    const result = await signUp(email, password, name)

    if (result.success && result.needsConfirmation) {
      setStep('verify')
    }

    setIsSubmitting(false)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setLocalError(null)

    const result = await confirmSignUp(email, verificationCode)

    if (result.success) {
      // Auto-login after verification
      const signInResult = await signIn(email, password)
      if (signInResult) {
        router.push('/dashboard')
      } else {
        // Fallback: redirect to login if auto-login fails
        router.push('/login')
      }
    } else {
      setLocalError(result.error || t('verify.invalidCode'))
    }

    setIsSubmitting(false)
  }

  if (isInitializing || isAuthenticated) {
    return <PageLoader message={login('checkingSession')} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {step === 'register' ? t('title') : t('verify.title')}
          </CardTitle>
          <CardDescription>
            {step === 'register'
              ? t('subtitle')
              : t('verify.subtitle', { email })}
          </CardDescription>
        </CardHeader>

        {step === 'register' ? (
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {(error || localError) && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error || localError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {password.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {passwordRequirements.map((req, index) => (
                      <li
                        key={index}
                        className={`flex items-center gap-1 ${
                          req.met ? 'text-success' : 'text-muted-foreground'
                        }`}
                      >
                        {req.met ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {req.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  error={confirmPassword.length > 0 && !passwordsMatch}
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-destructive">{t('passwordMismatch')}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting || isLoading}
                disabled={!name || !email || !allRequirementsMet || !passwordsMatch}
              >
                {t('submit')}
              </Button>

              {oauthEnabled && (
                <>
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">{login('orContinueWith')}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    isLoading={isGoogleLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {login('continueWithGoogle')}
                  </Button>
                </>
              )}

              <p className="text-center text-sm text-muted-foreground">
                {t('hasAccount')}{' '}
                <Link href="/login" className="text-primary hover:underline">
                  {t('signIn')}
                </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <CardContent className="space-y-4">
              {localError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {localError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">{t('verify.code')}</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder={t('verify.codePlaceholder')}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                disabled={verificationCode.length !== 6}
              >
                {t('verify.submit')}
              </Button>

              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t('verify.backToRegister')}
              </button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
