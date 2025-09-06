"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push("/dashboard")
      }
    }
    checkSession()
  }, [router])

  const handleGitHubSignIn = async () => {
    setLoading(true)
    try {
      await signIn("github", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to GitLegend</CardTitle>
          <CardDescription>
            Sign in with GitHub to start analyzing your repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGitHubSignIn}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Github className="w-5 h-5 mr-2" />
            {loading ? "Signing in..." : "Sign in with GitHub"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}