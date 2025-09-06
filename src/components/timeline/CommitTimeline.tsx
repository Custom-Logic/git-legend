"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar, 
  GitCommit, 
  GitPullRequest, 
  GitMerge, 
  Star, 
  Users,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react"

interface Commit {
  id: string
  sha: string
  message: string
  authorName: string
  authorEmail: string
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
  login: string
  name?: string
  avatar?: string
  commitsCount: number
  additions: number
  deletions: number
  isTopContributor: boolean
  isFirstContributor: boolean
}

interface CommitTimelineProps {
  commits: Commit[]
  contributors: Contributor[]
  onCommitSelect?: (commit: Commit) => void
  selectedCommit?: Commit | null
}

export default function CommitTimeline({ 
  commits, 
  contributors, 
  onCommitSelect, 
  selectedCommit 
}: CommitTimelineProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline')
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'month' | 'week'>('all')

  // Filter and sort commits based on time range
  const filteredCommits = useMemo(() => {
    const now = new Date()
    let cutoffDate = new Date(0)

    switch (timeRange) {
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        cutoffDate = new Date(0)
    }

    return commits
      .filter(commit => new Date(commit.authorDate) >= cutoffDate)
      .sort((a, b) => new Date(b.authorDate).getTime() - new Date(a.authorDate).getTime())
  }, [commits, timeRange])

  // Group commits by time periods for timeline view
  const timelineGroups = useMemo(() => {
    const groups: { [key: string]: Commit[] } = {}
    
    filteredCommits.forEach(commit => {
      const date = new Date(commit.authorDate)
      const key = viewMode === 'timeline' 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(commit)
    })

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filteredCommits, viewMode])

  const getCommitIcon = (commit: Commit) => {
    if (commit.message.toLowerCase().includes('merge')) {
      return <GitMerge className="w-4 h-4" />
    }
    if (commit.message.toLowerCase().includes('pull request') || commit.message.toLowerCase().includes('pr')) {
      return <GitPullRequest className="w-4 h-4" />
    }
    return <GitCommit className="w-4 h-4" />
  }

  const getCommitColor = (significance: number) => {
    if (significance > 0.8) return 'bg-red-500'
    if (significance > 0.6) return 'bg-orange-500'
    if (significance > 0.4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  const formatDay = (dayKey: string) => {
    const [year, month, day] = dayKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              All
            </Button>
            <Button
              variant={timeRange === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('year')}
            >
              Year
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Week
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GitCommit className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{filteredCommits.length}</p>
                <p className="text-sm text-muted-foreground">Total Commits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{contributors.length}</p>
                <p className="text-sm text-muted-foreground">Contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredCommits.filter(c => c.isKeyCommit).length}
                </p>
                <p className="text-sm text-muted-foreground">Key Commits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {timelineGroups.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {viewMode === 'timeline' ? 'Months' : 'Days'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {timelineGroups.map(([timeKey, groupCommits]) => (
          <div key={timeKey} className="space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">
                {viewMode === 'timeline' ? formatMonth(timeKey) : formatDay(timeKey)}
              </h3>
              <Badge variant="secondary">{groupCommits.length} commits</Badge>
            </div>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
              
              <div className="space-y-4">
                {groupCommits.map((commit, index) => (
                  <div
                    key={commit.id}
                    className={`relative flex items-start space-x-4 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      selectedCommit?.id === commit.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                    onClick={() => onCommitSelect?.(commit)}
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'left center'
                    }}
                  >
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center z-10">
                      <div className={`w-3 h-3 rounded-full ${getCommitColor(commit.significance)}`}></div>
                    </div>
                    
                    {/* Commit content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between space-x-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {getCommitIcon(commit)}
                            <h4 className="font-medium truncate">{commit.message}</h4>
                            {commit.isKeyCommit && (
                              <Badge variant="default" className="text-xs">
                                Key Commit
                              </Badge>
                            )}
                          </div>
                          
                          {commit.summary && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">
                              {commit.summary}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>+{commit.additions}</span>
                            <span>-{commit.deletions}</span>
                            <span>{commit.filesChanged} files</span>
                            <span>•</span>
                            <span>{new Date(commit.authorDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {commit.authorAvatar && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={commit.authorAvatar} />
                            <AvatarFallback>
                              {commit.authorName?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCommits.length === 0 && (
        <div className="text-center py-12">
          <GitCommit className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No commits found</h3>
          <p className="text-slate-600 dark:text-slate-300">
            No commits match the selected time range.
          </p>
        </div>
      )}
    </div>
  )
}