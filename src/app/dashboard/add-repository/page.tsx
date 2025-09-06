"use client"
// will used by developers to add a repository from their github - allowing the user to update their 
// access rights to the github repo may proove useful
// src/app/dashboard/add-repository/page.tsx
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Github, Plus, Search, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  stargazers_count: number
  forks_count: number
  private: boolean
}

export default function AddRepository() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  const [filteredRepositories, setFilteredRepositories] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [addingRepo, setAddingRepo] = useState<string | null>(null)
  const [customUrl, setCustomUrl] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchUserRepositories()
    }
  }, [session])

  useEffect(() => {
    if (repositories.length > 0) {
      const filtered = repositories.filter(repo =>
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRepositories(filtered)
    }
  }, [repositories, searchQuery])

  const fetchUserRepositories = async () => {
    try {
      const response = await fetch("/api/user-repositories")
      if (response.ok) {
        const data = await response.json()
        setRepositories(data)
        setFilteredRepositories(data)
      }
    } catch (error) {
      console.error("Error fetching repositories:", error)
    } finally {
      setLoading(false)
    }
  }

  const addRepository = async (repo: GitHubRepo) => {
    setAddingRepo(repo.full_name)
    setMessage(null)

    try {
      const response = await fetch("/api/repositories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repositoryUrl: `https://github.com/${repo.full_name}`,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Repository added successfully!' })
        // Remove from list
        setRepositories(prev => prev.filter(r => r.full_name !== repo.full_name))
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to add repository' })
      }
    } catch (error) {
      console.error("Error adding repository:", error)
      setMessage({ type: 'error', text: 'Failed to add repository' })
    } finally {
      setAddingRepo(null)
    }
  }

  const addCustomRepository = async () => {
    if (!customUrl.trim()) return

    setAddingRepo("custom")
    setMessage(null)

    try {
      const response = await fetch("/api/repositories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repositoryUrl: customUrl,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Repository added successfully!' })
        setCustomUrl("")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to add repository' })
      }
    } catch (error) {
      console.error("Error adding repository:", error)
      setMessage({ type: 'error', text: 'Failed to add repository' })
    } finally {
      setAddingRepo(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Add Repository</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Custom Repository Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Any Repository</CardTitle>
            <CardDescription>
              Add any public GitHub repository by URL (you don't need to be the owner)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-url">Repository URL</Label>
                <Input
                  id="custom-url"
                  placeholder="https://github.com/owner/repository"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={addCustomRepository}
                disabled={!customUrl.trim() || addingRepo === "custom"}
                className="w-full"
              >
                {addingRepo === "custom" ? "Adding..." : "Add Repository"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Your Repositories */}
        <Card>
          <CardHeader>
            <CardTitle>Your GitHub Repositories</CardTitle>
            <CardDescription>
              Select from your GitHub repositories to analyze with GitLegend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search your repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Repository List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredRepositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{repo.name}</h3>
                        {repo.language && (
                          <Badge variant="outline" className="text-xs">
                            {repo.language}
                          </Badge>
                        )}
                        {repo.private && (
                          <Badge variant="secondary" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        {repo.full_name}
                      </p>
                      {repo.description && (
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                        <span>⭐ {repo.stargazers_count}</span>
                        <span>🍴 {repo.forks_count}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => addRepository(repo)}
                      disabled={addingRepo === repo.full_name}
                      size="sm"
                    >
                      {addingRepo === repo.full_name ? (
                        "Adding..."
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {filteredRepositories.length === 0 && (
                <div className="text-center py-8">
                  <Github className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {searchQuery ? "No repositories match your search." : "No repositories available to add."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}