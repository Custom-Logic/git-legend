"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Timeline from "@/components/timeline/Timeline"
import { 
  ArrowLeft, 
  Github, 
  Calendar, 
  Users, 
  GitCommit, 
  Star, 
  Fork, 
  Share2, 
  Copy,
  ExternalLink,
  Brain,
  TrendingUp,
  Code,
  FileText,
  Heart,
  Activity
} from "lucide-react"
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

interface Commit {
  id: string
  sha: string
  message: string
  authorName: string
  authorDate: string
  additions: number
  deletions: number
  filesChanged: number
  significance: number
  summary?: string
  isKeyCommit: boolean
  authorLogin?: string
  authorAvatar?: string
}

interface Contributor {
  id: string
  githubId: string
  login: string
  name?: string
  email?: string
  avatar?: string
  commitsCount: number
  additions: number
  deletions: number
  isFirstContributor: boolean
  isTopContributor: boolean
}

interface HealthScore {
  overall: number
  breakdown: {
    activity: number
    contributorDiversity: number
    codeQuality: number
    maintenance: number
  }
  recommendations: string[]
  metrics: {
    totalCommits: number
    activeContributors: number
    commitFrequency: number
    avgResponseTime: number
    bugFixRate: number
  }
}

interface BiographyData {
  repository: {
    name: string
    fullName: string
    description?: string
    language?: string
    stars: number
    forks: number
    createdAt: string
    lastAnalyzedAt?: string
  }
  totalCommits: number
  totalContributors: number
  timeSpan: {
    firstCommit: string
    lastCommit: string
  }
  keyMetrics: {
    avgCommitsPerMonth: number
    topContributor: string
    mostActiveMonth: string
  }
}

export default function LegendPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [commits, setCommits] = useState<Commit[]>([])
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [biography, setBiography] = useState<BiographyData | null>(null)
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("timeline")

  const repositoryId = params.id as string

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (repositoryId && session) {
      fetchLegendData()
    }
  }, [repositoryId, session, status])

  const fetchLegendData = async () => {
    try {
      // Fetch repository data
      const repoResponse = await fetch(`/api/repositories/${repositoryId}`)
      if (repoResponse.ok) {
        const repoData = await repoResponse.json()
        setRepository(repoData)
      }

      // Fetch commits
      const commitsResponse = await fetch(`/api/commits?repositoryId=${repositoryId}`)
      if (commitsResponse.ok) {
        const commitsData = await commitsResponse.json()
        setCommits(commitsData)
      }

      // Fetch contributors
      const contributorsResponse = await fetch(`/api/contributors?repositoryId=${repositoryId}`)
      if (contributorsResponse.ok) {
        const contributorsData = await contributorsResponse.json()
        setContributors(contributorsData)
      }

      // Fetch MCP biography data
      const bioResponse = await fetch(`/api/mcp/biography?repositoryId=${repositoryId}`)
      if (bioResponse.ok) {
        const bioData = await bioResponse.json()
        setBiography(bioData)
      }

      // Fetch health score
      const healthResponse = await fetch(`/api/health/${repositoryId}`)
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        setHealthScore(healthData)
      }
    } catch (error) {
      console.error("Error fetching legend data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateShareUrl = () => {
    return `${window.location.origin}/legend/${repositoryId}`
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(generateShareUrl())
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Repository Not Found</CardTitle>
            <CardDescription>
              The requested repository could not be found or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const topContributors = contributors.filter(c => c.isTopContributor)

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
              <div>
                <h1 className="text-2xl font-bold">{repository.name}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {repository.fullName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={copyShareUrl}>
                <Copy className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                <a 
                  href={`https://github.com/${repository.fullName}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Repository Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{repository.name}</CardTitle>
                <CardDescription className="text-lg">
                  {repository.description || "No description available"}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                {repository.language && (
                  <Badge variant="outline">{repository.language}</Badge>
                )}
                <div className="flex items-center space-x-1 text-sm text-slate-600">
                  <Star className="w-4 h-4" />
                  <span>{repository.stars}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-slate-600">
                  <Fork className="w-4 h-4" />
                  <span>{repository.forks}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          {biography && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{biography.totalCommits}</div>
                  <div className="text-sm text-slate-500">Total Commits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{biography.totalContributors}</div>
                  <div className="text-sm text-slate-500">Contributors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{biography.keyMetrics.avgCommitsPerMonth}</div>
                  <div className="text-sm text-slate-500">Commits/Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {biography.timeSpan.firstCommit ? 
                      Math.round((new Date().getTime() - new Date(biography.timeSpan.firstCommit).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 
                      0
                    }
                  </div>
                  <div className="text-sm text-slate-500">Months Active</div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="contributors">Contributors</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            <Timeline 
              commits={commits} 
              onCommitSelect={(commit) => {
                // Handle commit selection
                console.log("Selected commit:", commit)
              }}
            />
          </TabsContent>

          <TabsContent value="contributors" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Top Contributors */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Contributor Hall of Fame</span>
                  </CardTitle>
                  <CardDescription>
                    The amazing people who built this repository
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topContributors.map((contributor, index) => (
                      <div key={contributor.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-slate-400">
                              #{index + 1}
                            </span>
                            <Avatar>
                              <AvatarImage src={contributor.avatar} />
                              <AvatarFallback>
                                {contributor.name?.charAt(0) || contributor.login?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {contributor.name || contributor.login}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              @{contributor.login}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{contributor.commitsCount}</div>
                          <div className="text-sm text-slate-500">commits</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* All Contributors */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>All Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {contributors.map((contributor) => (
                      <div key={contributor.id} className="text-center">
                        <Avatar className="w-16 h-16 mx-auto mb-2">
                          <AvatarImage src={contributor.avatar} />
                          <AvatarFallback>
                            {contributor.name?.charAt(0) || contributor.login?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-sm font-medium truncate">
                          {contributor.name || contributor.login}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {contributor.commitsCount} commits
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {biography && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Project Evolution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Timeline</label>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(biography.timeSpan.firstCommit)} - {formatDate(biography.timeSpan.lastCommit)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Top Contributor</label>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {biography.keyMetrics.topContributor}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Most Active Month</label>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {biography.keyMetrics.mostActiveMonth}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="w-5 h-5" />
                      <span>Development Patterns</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Average Activity</label>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {biography.keyMetrics.avgCommitsPerMonth} commits per month
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Team Size</label>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {biography.totalContributors} contributors
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Total Output</label>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {biography.totalCommits} commits total
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            {healthScore && (
              <div className="space-y-6">
                {/* Overall Health Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>Project Health Score</span>
                    </CardTitle>
                    <CardDescription>
                      Overall health assessment based on activity, contributors, code quality, and maintenance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="relative inline-flex items-center justify-center">
                        <div className="text-6xl font-bold">
                          <span className={healthScore.overall >= 80 ? "text-green-600" : 
                                          healthScore.overall >= 60 ? "text-yellow-600" : "text-red-600"}>
                            {healthScore.overall}
                          </span>
                          <span className="text-2xl text-slate-500">/100</span>
                        </div>
                      </div>
                      <div className="text-lg font-medium">
                        {healthScore.overall >= 80 ? "Excellent Health" : 
                         healthScore.overall >= 60 ? "Good Health" : 
                         healthScore.overall >= 40 ? "Fair Health" : "Needs Attention"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Health Breakdown */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Activity className="w-4 h-4" />
                        <span>Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {healthScore.breakdown.activity}
                      </div>
                      <div className="text-xs text-slate-500">
                        {healthScore.breakdown.activity >= 80 ? "Very Active" :
                         healthScore.breakdown.activity >= 60 ? "Active" :
                         healthScore.breakdown.activity >= 40 ? "Moderate" : "Low Activity"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Diversity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {healthScore.breakdown.contributorDiversity}
                      </div>
                      <div className="text-xs text-slate-500">
                        {healthScore.breakdown.contributorDiversity >= 80 ? "Well Distributed" :
                         healthScore.breakdown.contributorDiversity >= 60 ? "Good Mix" :
                         healthScore.breakdown.contributorDiversity >= 40 ? "Concentrated" : "Very Concentrated"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Code className="w-4 h-4" />
                        <span>Quality</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {healthScore.breakdown.codeQuality}
                      </div>
                      <div className="text-xs text-slate-500">
                        {healthScore.breakdown.codeQuality >= 80 ? "High Quality" :
                         healthScore.breakdown.codeQuality >= 60 ? "Good Quality" :
                         healthScore.breakdown.codeQuality >= 40 ? "Fair Quality" : "Needs Improvement"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Maintenance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {healthScore.breakdown.maintenance}
                      </div>
                      <div className="text-xs text-slate-500">
                        {healthScore.breakdown.maintenance >= 80 ? "Well Maintained" :
                         healthScore.breakdown.maintenance >= 60 ? "Maintained" :
                         healthScore.breakdown.maintenance >= 40 ? "Needs Attention" : "Poorly Maintained"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Health Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Health Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-lg font-bold">{healthScore.metrics.totalCommits}</div>
                        <div className="text-sm text-slate-500">Total Commits</div>
                      </div>
                      <div className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-lg font-bold">{healthScore.metrics.activeContributors}</div>
                        <div className="text-sm text-slate-500">Active Contributors</div>
                      </div>
                      <div className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-lg font-bold">{healthScore.metrics.commitFrequency.toFixed(1)}</div>
                        <div className="text-sm text-slate-500">Commits/Week</div>
                      </div>
                      <div className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-lg font-bold">{healthScore.metrics.avgResponseTime.toFixed(1)} days</div>
                        <div className="text-sm text-slate-500">Avg Response Time</div>
                      </div>
                      <div className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-lg font-bold">{(healthScore.metrics.bugFixRate * 100).toFixed(1)}%</div>
                        <div className="text-sm text-slate-500">Bug Fix Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>
                      Suggestions to improve your project's health
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {healthScore.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-blue-800 dark:text-blue-200">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>AI-Powered Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Use AI tools to gain deeper insights into your repository
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <h3 className="font-semibold mb-2">Explain Architectural Shifts</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      Let AI analyze major architectural changes in your codebase
                    </p>
                    <Button size="sm" className="w-full">
                      Analyze Architecture
                    </Button>
                  </div>
                  
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <h3 className="font-semibold mb-2">Get Review Guidelines</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      Generate AI-powered code review guidelines based on repository patterns
                    </p>
                    <Button size="sm" className="w-full">
                      Generate Guidelines
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Debug Assistant</span>
                  </CardTitle>
                  <CardDescription>
                    AI tools to help diagnose and fix issues
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <h3 className="font-semibold mb-2">Diagnose Bug Origin</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      Find the commit that might have introduced a bug
                    </p>
                    <Button size="sm" className="w-full">
                      Start Diagnosis
                    </Button>
                  </div>
                  
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <h3 className="font-semibold mb-2">Commit Intelligence</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      Get detailed AI analysis of any commit
                    </p>
                    <Button size="sm" className="w-full">
                      Analyze Commit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>MCP Integration</CardTitle>
                <CardDescription>
                  Connect GitLegend with your AI assistant using the Model Context Protocol
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Available MCP Tools</h4>
                    <ul className="text-sm space-y-1">
                      <li>• <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">/biography</code> - Get repository overview</li>
                      <li>• <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">/intel</code> - Get commit intelligence</li>
                      <li>• <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">/diagnose_bug_origin</code> - Debug assistance</li>
                      <li>• <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">/explain_architectural_shift</code> - Architecture analysis</li>
                      <li>• <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">/get_review_guidelines</code> - Review assistance</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">How to Use</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Share <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">gitlegend://</code> URLs from commit cards with your AI assistant to provide rich context about your repository's history.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}