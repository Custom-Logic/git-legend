"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Github, Plus, Search, Calendar, Users, Code, TrendingUp, Play } from "lucide-react"
import Link from "next/link"

interface Repository {
  id: string
  name: string
  fullName: string
  description?: string
  language?: string
  stars: number
  forks: number
  lastAnalyzedAt?: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [analyzingRepo, setAnalyzingRepo] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchRepositories()
    }
  }, [session])

  const fetchRepositories = async () => {
    try {
      const response = await fetch("/api/repositories")
      if (response.ok) {
        const data = await response.json()
        setRepositories(data)
      }
    } catch (error) {
      console.error("Error fetching repositories:", error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeRepository = async (repoId: string) => {
    setAnalyzingRepo(repoId)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repositoryId: repoId }),
      })

      if (response.ok) {
        // Refresh repositories to show updated status
        await fetchRepositories()
      } else {
        const error = await response.json()
        console.error("Analysis failed:", error)
      }
    } catch (error) {
      console.error("Error analyzing repository:", error)
    } finally {
      setAnalyzingRepo(null)
    }
  }

  const filteredRepositories = repositories.filter(repo =>
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              <h1 className="text-2xl font-bold">GitLegend</h1>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback>
                  {session.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {session.user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {session.user?.name?.split(' ')[0]}!</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your repositories and generate beautiful legends for your projects.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repositories.length}</div>
              <p className="text-xs text-muted-foreground">
                Connected to GitLegend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analyzed This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +20% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Github className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {repositories.reduce((acc, repo) => acc + repo.stars, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all repositories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/add-repository">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Repository
              </Button>
            </Link>
          </div>
          
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Repository Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories.map((repo) => (
            <Card key={repo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {repo.fullName}
                    </CardDescription>
                  </div>
                  {repo.language && (
                    <Badge variant="outline">{repo.language}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {repo.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                    {repo.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Github className="w-4 h-4" />
                      <span>{repo.stars}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Code className="w-4 h-4" />
                      <span>{repo.forks}</span>
                    </div>
                  </div>
                </div>

                {repo.lastAnalyzedAt ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Calendar className="w-4 h-4" />
                      <span>Analyzed</span>
                    </div>
                    <Link href={`/legend/${repo.id}`}>
                      <Button variant="outline" size="sm">
                        View Legend
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-orange-600">
                      <Calendar className="w-4 h-4" />
                      <span>Not analyzed</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => analyzeRepository(repo.id)}
                      disabled={analyzingRepo === repo.id}
                    >
                      {analyzingRepo === repo.id ? (
                        "Analyzing..."
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Analyze Now
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRepositories.length === 0 && (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {searchQuery ? "No repositories match your search." : "Get started by adding your first repository."}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/add-repository">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Repository
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}