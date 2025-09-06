"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, GitCommit, User, FileText, Copy, ExternalLink, Sparkles } from "lucide-react"

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

interface LegendCardProps {
  commit: Commit
  className?: string
}

export default function LegendCard({ commit, className = "" }: LegendCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getSignificanceColor = (significance: number) => {
    if (significance >= 0.8) return "border-red-500 bg-red-50 dark:bg-red-950"
    if (significance >= 0.6) return "border-orange-500 bg-orange-50 dark:bg-orange-950"
    if (significance >= 0.4) return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
    return "border-green-500 bg-green-50 dark:bg-green-950"
  }

  const getSignificanceLabel = (significance: number) => {
    if (significance >= 0.8) return "Critical Impact"
    if (significance >= 0.6) return "Major Impact"
    if (significance >= 0.4) return "Moderate Impact"
    return "Minor Impact"
  }

  const generateMCPUrl = (commit: Commit) => {
    return `gitlegend://commit/${commit.sha}`
  }

  const copyMCPUrl = () => {
    const url = generateMCPUrl(commit)
    navigator.clipboard.writeText(url)
  }

  return (
    <Card className={`border-l-4 ${getSignificanceColor(commit.significance)} ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {commit.isKeyCommit && (
                <Badge variant="default" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Key Commit
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {getSignificanceLabel(commit.significance)}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">
              {commit.message.split("\n")[0]}
            </CardTitle>
            <CardDescription className="mt-2">
              {formatDate(commit.authorDate)} • {commit.authorName}
            </CardDescription>
          </div>
          {commit.authorAvatar && (
            <Avatar className="w-10 h-10">
              <AvatarImage src={commit.authorAvatar} />
              <AvatarFallback>
                {commit.authorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* AI Summary */}
        {commit.summary && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="font-semibold text-sm">AI Analysis</h4>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {commit.summary}
            </p>
          </div>
        )}

        {/* Commit Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">+{commit.additions}</div>
            <div className="text-xs text-slate-500">Additions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">-{commit.deletions}</div>
            <div className="text-xs text-slate-500">Deletions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{commit.filesChanged}</div>
            <div className="text-xs text-slate-500">Files</div>
          </div>
        </div>

        {/* Commit Details */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <GitCommit className="w-3 h-3" />
              <span>{commit.sha.substring(0, 7)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{commit.authorLogin || commit.authorName}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>{commit.filesChanged} files changed</span>
          </div>
        </div>

        {/* MCP Integration */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">AI Context</h4>
            <Badge variant="secondary" className="text-xs">
              MCP Compatible
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-2 rounded font-mono text-xs truncate">
              {generateMCPUrl(commit)}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={copyMCPUrl}
              className="flex-shrink-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" className="flex-shrink-0">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Share this URL with AI assistants to provide rich context about this commit
          </p>
        </div>
      </CardContent>
    </Card>
  )
}