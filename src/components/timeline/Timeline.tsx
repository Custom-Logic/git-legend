"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, GitCommit, User, FileText, Copy, ExternalLink } from "lucide-react"

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

interface TimelineProps {
  commits: Commit[]
  onCommitSelect?: (commit: Commit) => void
}

export default function Timeline({ commits, onCommitSelect }: TimelineProps) {
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null)
  const [visibleCommits, setVisibleCommits] = useState(20)
  const timelineRef = useRef<HTMLDivElement>(null)

  const sortedCommits = commits
    .sort((a, b) => new Date(b.authorDate).getTime() - new Date(a.authorDate).getTime())
    .slice(0, visibleCommits)

  const handleLoadMore = () => {
    setVisibleCommits(prev => prev + 20)
  }

  const handleCommitClick = (commit: Commit) => {
    setSelectedCommit(commit)
    onCommitSelect?.(commit)
  }

  const generateMCPUrl = (commit: Commit) => {
    return `gitlegend://commit/${commit.sha}`
  }

  const copyMCPUrl = (commit: Commit) => {
    const url = generateMCPUrl(commit)
    navigator.clipboard.writeText(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getSignificanceColor = (significance: number) => {
    if (significance >= 0.8) return "bg-red-500"
    if (significance >= 0.6) return "bg-orange-500"
    if (significance >= 0.4) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getSignificanceLabel = (significance: number) => {
    if (significance >= 0.8) return "Critical"
    if (significance >= 0.6) return "Major"
    if (significance >= 0.4) return "Moderate"
    return "Minor"
  }

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Project Timeline</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Interactive visualization of {commits.length} commits
        </p>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-300 dark:bg-slate-600"></div>

        {/* Timeline Items */}
        <div className="space-y-6">
          {sortedCommits.map((commit, index) => (
            <div key={commit.id} className="relative flex items-start space-x-4">
              {/* Timeline Node */}
              <div className="relative z-10">
                <div
                  className={`w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${getSignificanceColor(
                    commit.significance
                  )} cursor-pointer hover:scale-110 transition-transform`}
                  onClick={() => handleCommitClick(commit)}
                  title={`${getSignificanceLabel(commit.significance)} significance`}
                />
              </div>

              {/* Commit Card */}
              <div className="flex-1 min-w-0">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCommit?.id === commit.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleCommitClick(commit)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge 
                            variant={commit.isKeyCommit ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {commit.isKeyCommit ? "Key Commit" : "Commit"}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              commit.significance >= 0.6 ? "border-orange-500 text-orange-700" : ""
                            }`}
                          >
                            {getSignificanceLabel(commit.significance)}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-medium truncate">
                          {commit.message.split("\n")[0]}
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(commit.authorDate)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {commit.summary && (
                      <CardDescription className="text-sm mb-3 line-clamp-2">
                        {commit.summary}
                      </CardDescription>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <GitCommit className="w-3 h-3" />
                          <span>{commit.sha.substring(0, 7)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>{commit.filesChanged} files</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-green-600">+{commit.additions}</span>
                          <span className="text-red-600">-{commit.deletions}</span>
                        </div>
                      </div>
                      
                      {commit.authorAvatar && (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={commit.authorAvatar} />
                          <AvatarFallback className="text-xs">
                            {commit.authorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleCommits < commits.length && (
          <div className="text-center pt-6">
            <Button onClick={handleLoadMore} variant="outline">
              Load More Commits ({commits.length - visibleCommits} remaining)
            </Button>
          </div>
        )}
      </div>

      {/* Selected Commit Detail Modal */}
      {selectedCommit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{selectedCommit.message}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedCommit.authorDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{selectedCommit.authorName}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCommit(null)}
                >
                  ×
                </Button>
              </div>

              {selectedCommit.summary && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">AI Summary</h4>
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-3 rounded">
                    {selectedCommit.summary}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{selectedCommit.additions}</div>
                  <div className="text-sm text-slate-500">Additions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">-{selectedCommit.deletions}</div>
                  <div className="text-sm text-slate-500">Deletions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedCommit.filesChanged}</div>
                  <div className="text-sm text-slate-500">Files Changed</div>
                </div>
              </div>

              {/* MCP Integration */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">AI Integration</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700 p-3 rounded font-mono text-sm">
                    {generateMCPUrl(selectedCommit)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyMCPUrl(selectedCommit)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Share this URL with your AI assistant to provide context about this commit
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}