import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users, GitCommit, Star, Fork, Share2, Github, ExternalLink } from "lucide-react"
import Timeline from "@/components/timeline/Timeline"

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

async function getRepository(id: string): Promise<Repository | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/repositories/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching repository:', error)
    return null
  }
}

async function getPublicCommits(repositoryId: string): Promise<Commit[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/commits?repositoryId=${repositoryId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching commits:', error)
    return []
  }
}

async function getPublicContributors(repositoryId: string): Promise<Contributor[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/contributors?repositoryId=${repositoryId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching contributors:', error)
    return []
  }
}

interface PublicLegendPageProps {
  params: {
    id: string
  }
}

export default async function PublicLegendPage({ params }: PublicLegendPageProps) {
  const repository = await getRepository(params.id)
  
  if (!repository) {
    notFound()
  }

  const [commits, contributors] = await Promise.all([
    getPublicCommits(params.id),
    getPublicContributors(params.id)
  ])

  const topContributors = contributors.filter(c => c.isTopContributor)
  const totalCommits = commits.length
  const totalContributors = contributors.length

  // Calculate some basic metrics
  const totalAdditions = commits.reduce((sum, commit) => sum + commit.additions, 0)
  const totalDeletions = commits.reduce((sum, commit) => sum + commit.deletions, 0)
  const avgCommitsPerMonth = totalCommits > 0 ? Math.round(totalCommits / 12) : 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{repository.name}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {repository.fullName}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Github className="w-4 h-4 mr-2" />
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
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalCommits}</div>
                <div className="text-sm text-slate-500">Total Commits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalContributors}</div>
                <div className="text-sm text-slate-500">Contributors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{avgCommitsPerMonth}</div>
                <div className="text-sm text-slate-500">Commits/Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {totalAdditions + totalDeletions}
                </div>
                <div className="text-sm text-slate-500">Lines Changed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitCommit className="w-5 h-5" />
              <span>Project Timeline</span>
            </CardTitle>
            <CardDescription>
              Interactive visualization of {totalCommits} commits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline commits={commits.slice(0, 50)} /> {/* Show first 50 commits for performance */}
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Top Contributors</span>
            </CardTitle>
            <CardDescription>
              The amazing people who built this repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topContributors.slice(0, 5).map((contributor, index) => (
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

        {/* GitLegend Badge */}
        <Card>
          <CardHeader>
            <CardTitle>Embed This Legend</CardTitle>
            <CardDescription>
              Add this GitLegend badge to your GitHub README
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-sm font-medium">📊 GitLegend</span>
                  <span className="text-sm text-slate-600">|</span>
                  <span className="text-sm">{totalCommits} commits</span>
                  <span className="text-sm text-slate-600">|</span>
                  <span className="text-sm">{totalContributors} contributors</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Markdown</label>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded font-mono text-sm">
                  [![GitLegend](${process.env.NEXTAUTH_URL || 'https://gitlegend.com'}/api/badge/${params.id})](${process.env.NEXTAUTH_URL || 'https://gitlegend.com'}/public/legend/${params.id})
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">HTML</label>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded font-mono text-sm">
                  {`<a href="${process.env.NEXTAUTH_URL || 'https://gitlegend.com'}/public/legend/${params.id}">
  <img src="${process.env.NEXTAUTH_URL || 'https://gitlegend.com'}/api/badge/${params.id}" alt="GitLegend" />
</a>`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}