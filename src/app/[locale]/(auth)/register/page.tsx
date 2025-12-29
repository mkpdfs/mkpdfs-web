'use client'

import { useState, useEffect } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/providers'
import { confirmSignUp } from '@/lib/auth'
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, PageLoader } from '@/components/ui'
import { Eye, EyeOff, FileText, Check, X } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, isAuthenticated, isLoading, isInitializing, error, clearError } = useAuth()

  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Password requirements
  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
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
      setLocalError('Password does not meet requirements')
      return
    }

    if (!passwordsMatch) {
      setLocalError('Passwords do not match')
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
      setLocalError(result.error || 'Invalid verification code')
    }

    setIsSubmitting(false)
  }

  if (isInitializing || isAuthenticated) {
    return <PageLoader message="Checking session..." />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {step === 'register' ? 'Create an account' : 'Verify your email'}
          </CardTitle>
          <CardDescription>
            {step === 'register'
              ? 'Start generating PDFs in minutes'
              : `We sent a verification code to ${email}`}
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  error={confirmPassword.length > 0 && !passwordsMatch}
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
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
                Create Account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
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
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
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
                Verify Email
              </Button>

              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back to registration
              </button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
