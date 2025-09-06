"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar, 
  Users, 
  GitCommit,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Target
} from "lucide-react"

interface Commit {
  id: string
  authorDate: string
  additions: number
  deletions: number
  filesChanged: number
  significance: number
  isKeyCommit: boolean
}

interface Contributor {
  id: string
  commitsCount: number
  additions: number
  deletions: number
  isTopContributor: boolean
}

interface RepositoryAnalyticsProps {
  commits: Commit[]
  contributors: Contributor[]
  healthScore: number
}

export default function RepositoryAnalytics({ 
  commits, 
  contributors, 
  healthScore 
}: RepositoryAnalyticsProps) {
  const analytics = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    
    // Recent activity (last 30 days)
    const recentCommits = commits.filter(commit => 
      new Date(commit.authorDate) >= thirtyDaysAgo
    )
    
    // Activity trend (compare last 30 days to previous 30 days)
    const previousPeriodCommits = commits.filter(commit => {
      const commitDate = new Date(commit.authorDate)
      return commitDate >= ninetyDaysAgo && commitDate < thirtyDaysAgo
    })
    
    // Activity patterns
    const commitsByDay = new Array(7).fill(0)
    const commitsByHour = new Array(24).fill(0)
    
    recentCommits.forEach(commit => {
      const date = new Date(commit.authorDate)
      commitsByDay[date.getDay()]++
      commitsByHour[date.getHours()]++
    })
    
    // Code quality metrics
    const totalAdditions = commits.reduce((sum, commit) => sum + commit.additions, 0)
    const totalDeletions = commits.reduce((sum, commit) => sum + commit.deletions, 0)
    const avgFilesChanged = commits.reduce((sum, commit) => sum + commit.filesChanged, 0) / commits.length || 0
    const avgSignificance = commits.reduce((sum, commit) => sum + commit.significance, 0) / commits.length || 0
    
    // Contributor distribution
    const topContributorsPct = contributors.filter(c => c.isTopContributor).length / contributors.length * 100
    const avgCommitsPerContributor = commits.length / contributors.length || 0
    
    // Risk assessment
    const highRiskCommits = commits.filter(commit => 
      commit.filesChanged > 20 || commit.additions + commit.deletions > 1000
    ).length
    
    const staleDays = commits.length > 0 
      ? Math.floor((now.getTime() - new Date(commits[0].authorDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    
    return {
      recentActivity: {
        totalCommits: recentCommits.length,
        previousPeriodCommits: previousPeriodCommits.length,
        trend: recentCommits.length > previousPeriodCommits.length ? 'up' : 'down',
        trendPercentage: previousPeriodCommits.length > 0 
          ? Math.round(((recentCommits.length - previousPeriodCommits.length) / previousPeriodCommits.length) * 100)
          : 0
      },
      activityPatterns: {
        commitsByDay,
        commitsByHour,
        peakDay: commitsByDay.indexOf(Math.max(...commitsByDay)),
        peakHour: commitsByHour.indexOf(Math.max(...commitsByHour))
      },
      codeQuality: {
        totalAdditions,
        totalDeletions,
        ratio: totalDeletions > 0 ? (totalAdditions / totalDeletions).toFixed(2) : '∞',
        avgFilesChanged: Math.round(avgFilesChanged),
        avgSignificance: Math.round(avgSignificance * 100)
      },
      contributorHealth: {
        topContributorsPct: Math.round(topContributorsPct),
        avgCommitsPerContributor: Math.round(avgCommitsPerContributor * 10) / 10,
        distribution: contributors.length > 3 ? 'healthy' : contributors.length > 1 ? 'moderate' : 'concentrated'
      },
      riskAssessment: {
        highRiskCommits,
        riskLevel: highRiskCommits > commits.length * 0.1 ? 'high' : highRiskCommits > commits.length * 0.05 ? 'medium' : 'low',
        staleDays,
        isActive: staleDays < 30
      }
    }
  }, [commits, contributors])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      default: return 'text-green-600'
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Attention'
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Health Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Project Health Score</span>
          </CardTitle>
          <CardDescription>
            Overall health assessment based on activity, contributions, and code quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-4xl font-bold ${getHealthScoreColor(healthScore)}`}>
                {healthScore}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                out of 100
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {getHealthScoreLabel(healthScore)}
              </Badge>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Overall Status
              </div>
            </div>
          </div>
          <Progress value={healthScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Activity Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recentActivity.totalCommits}</div>
            <div className="flex items-center space-x-1 text-xs">
              {analytics.recentActivity.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={analytics.recentActivity.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {analytics.recentActivity.trend === 'up' ? '+' : ''}{analytics.recentActivity.trendPercentage}%
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Quality</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.codeQuality.avgSignificance}%</div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-muted-foreground">Avg. significance</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{analytics.codeQuality.avgFilesChanged} files/commit</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributor Health</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.contributorHealth.topContributorsPct}%</div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-muted-foreground">Top contributors</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{analytics.contributorHealth.avgCommitsPerContributor} avg commits</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(analytics.riskAssessment.riskLevel)}`}>
              {analytics.riskAssessment.riskLevel.charAt(0).toUpperCase() + analytics.riskAssessment.riskLevel.slice(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-muted-foreground">{analytics.riskAssessment.highRiskCommits} high-risk commits</span>
              <span className="text-muted-foreground">•</span>
              <span className={analytics.riskAssessment.isActive ? 'text-green-600' : 'text-orange-600'}>
                {analytics.riskAssessment.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Activity Patterns</span>
            </CardTitle>
            <CardDescription>
              When contributions typically happen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Commits by Day of Week</h4>
                <div className="grid grid-cols-7 gap-2">
                  {analytics.activityPatterns.commitsByDay.map((count, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                        {dayNames[index]}
                      </div>
                      <div 
                        className="h-16 bg-slate-200 dark:bg-slate-700 rounded flex items-end justify-center"
                        style={{
                          background: `linear-gradient(to top, rgb(59 130 246) ${count / Math.max(...analytics.activityPatterns.commitsByDay) * 100}%, rgb(203 213 225) ${count / Math.max(...analytics.activityPatterns.commitsByDay) * 100}%)`
                        }}
                      >
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 pb-1">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <Badge variant="outline">
                  Peak: {dayNames[analytics.activityPatterns.peakDay]}s
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Quality Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitCommit className="w-5 h-5" />
              <span>Code Quality Metrics</span>
            </CardTitle>
            <CardDescription>
              Insights about code changes and maintainability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Additions vs Deletions Ratio</span>
                <span className="font-medium">{analytics.codeQuality.ratio}:1</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Files per Commit</span>
                <span className="font-medium">{analytics.codeQuality.avgFilesChanged}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Lines Added</span>
                <span className="font-medium text-green-600">+{analytics.codeQuality.totalAdditions.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Lines Removed</span>
                <span className="font-medium text-red-600">-{analytics.codeQuality.totalDeletions.toLocaleString()}</span>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center space-x-2">
                  {analytics.codeQuality.avgSignificance > 50 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="text-sm">
                    {analytics.codeQuality.avgSignificance > 50 ? 'High' : 'Moderate'} commit significance
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Risk Assessment</span>
          </CardTitle>
          <CardDescription>
            Potential risks and recommendations for the project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Project Activity</span>
                <div className="flex items-center space-x-2">
                  {analytics.riskAssessment.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-orange-600" />
                  )}
                  <span className="text-sm">
                    {analytics.riskAssessment.isActive ? 'Active' : `Inactive (${analytics.riskAssessment.staleDays} days)`}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">High-Risk Commits</span>
                <span className={`text-sm font-medium ${getRiskColor(analytics.riskAssessment.riskLevel)}`}>
                  {analytics.riskAssessment.highRiskCommits} ({Math.round(analytics.riskAssessment.highRiskCommits / commits.length * 100)}%)
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Contributor Distribution</span>
                <Badge variant={analytics.contributorHealth.distribution === 'healthy' ? 'default' : 'secondary'}>
                  {analytics.contributorHealth.distribution}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recommendations</h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {!analytics.riskAssessment.isActive && (
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Consider encouraging more frequent commits to maintain project momentum</span>
                  </div>
                )}
                
                {analytics.riskAssessment.highRiskCommits > commits.length * 0.05 && (
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Review large commits and consider breaking them into smaller, focused changes</span>
                  </div>
                )}
                
                {analytics.contributorHealth.distribution === 'concentrated' && (
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Encourage more contributors to distribute knowledge and reduce bus factor</span>
                  </div>
                )}
                
                {analytics.codeQuality.avgSignificance < 30 && (
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Focus on more meaningful commit messages and better documentation</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}