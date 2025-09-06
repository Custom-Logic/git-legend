import { db } from "@/lib/db"
import { AnalysisStatus } from "@prisma/client"

export interface MCPContext {
  repositoryId: string
  commitSha?: string
  userId?: string
}

export interface BiographyResult {
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

export interface IntelResult {
  commit: {
    sha: string
    message: string
    authorName: string
    authorDate: string
    significance: number
    summary?: string
    isKeyCommit: boolean
  }
  context: {
    filesChanged: number
    additions: number
    deletions: number
    relatedCommits: Array<{
      sha: string
      message: string
      authorDate: string
    }>
  }
}

export interface BugOriginResult {
  potentialOrigin: {
    sha: string
    message: string
    authorDate: string
    authorName: string
    confidence: number
    reasoning: string
  } | null
  analysis: {
    bugDescription: string
    suspiciousPatterns: string[]
    recommendedInvestigation: string[]
  }
}

export interface ArchitecturalShiftResult {
  shifts: Array<{
    sha: string
    message: string
    authorDate: string
    description: string
    impact: "low" | "medium" | "high"
    filesAffected: string[]
  }>
  summary: {
    majorShifts: number
    primaryAreas: string[]
    evolutionPattern: string
  }
}

export interface ReviewGuidelinesResult {
  guidelines: Array<{
    rule: string
    description: string
    exampleCommit?: string
    severity: "low" | "medium" | "high"
  }>
  context: {
    repositoryPatterns: string[]
    commonIssues: string[]
    teamPreferences: string[]
  }
}

class MCPServer {
  async getBiography(repositoryId: string): Promise<BiographyResult> {
    const repository = await db.repository.findUnique({
      where: { id: repositoryId },
    })

    if (!repository) {
      throw new Error("Repository not found")
    }

    const commits = await db.commit.findMany({
      where: { repositoryId },
      orderBy: { authorDate: "asc" },
    })

    const contributors = await db.contributor.findMany({
      where: { repositoryId },
    })

    const totalCommits = commits.length
    const totalContributors = contributors.length

    if (commits.length === 0) {
      return {
        repository: {
          name: repository.name,
          fullName: repository.fullName,
          description: repository.description,
          language: repository.language,
          stars: repository.stars,
          forks: repository.forks,
          createdAt: repository.createdAt.toISOString(),
          lastAnalyzedAt: repository.lastAnalyzedAt?.toISOString(),
        },
        totalCommits: 0,
        totalContributors: 0,
        timeSpan: {
          firstCommit: "",
          lastCommit: "",
        },
        keyMetrics: {
          avgCommitsPerMonth: 0,
          topContributor: "",
          mostActiveMonth: "",
        },
      }
    }

    const firstCommit = commits[0]
    const lastCommit = commits[commits.length - 1]

    // Calculate time span
    const timeSpan = {
      firstCommit: firstCommit.authorDate.toISOString(),
      lastCommit: lastCommit.authorDate.toISOString(),
    }

    // Calculate metrics
    const timeSpanMs = new Date(lastCommit.authorDate).getTime() - new Date(firstCommit.authorDate).getTime()
    const monthsSpan = Math.max(1, timeSpanMs / (1000 * 60 * 60 * 24 * 30))
    const avgCommitsPerMonth = Math.round(totalCommits / monthsSpan)

    // Find top contributor
    const topContributor = contributors.reduce((prev, current) => 
      prev.commitsCount > current.commitsCount ? prev : current
    )

    // Find most active month (simplified)
    const commitsByMonth = new Map<string, number>()
    commits.forEach(commit => {
      const month = commit.authorDate.toISOString().substring(0, 7)
      commitsByMonth.set(month, (commitsByMonth.get(month) || 0) + 1)
    })

    const mostActiveMonth = Array.from(commitsByMonth.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || ""

    return {
      repository: {
        name: repository.name,
        fullName: repository.fullName,
        description: repository.description,
        language: repository.language,
        stars: repository.stars,
        forks: repository.forks,
        createdAt: repository.createdAt.toISOString(),
        lastAnalyzedAt: repository.lastAnalyzedAt?.toISOString(),
      },
      totalCommits,
      totalContributors,
      timeSpan,
      keyMetrics: {
        avgCommitsPerMonth,
        topContributor: topContributor.login || topContributor.name || "Unknown",
        mostActiveMonth,
      },
    }
  }

  async getIntel(commitSha: string, repositoryId: string): Promise<IntelResult> {
    const commit = await db.commit.findFirst({
      where: { 
        sha: commitSha,
        repositoryId,
      },
    })

    if (!commit) {
      throw new Error("Commit not found")
    }

    // Find related commits (commits that touch similar files or have similar messages)
    const relatedCommits = await db.commit.findMany({
      where: {
        repositoryId,
        id: { not: commit.id },
        OR: [
          {
            message: {
              contains: commit.message.split(" ")[0], // First word similarity
            },
          },
        ],
      },
        orderBy: { authorDate: "desc" },
        take: 5,
    })

    return {
      commit: {
        sha: commit.sha,
        message: commit.message,
        authorName: commit.authorName,
        authorDate: commit.authorDate.toISOString(),
        significance: commit.significance,
        summary: commit.summary,
        isKeyCommit: commit.isKeyCommit,
      },
      context: {
        filesChanged: commit.filesChanged,
        additions: commit.additions,
        deletions: commit.deletions,
        relatedCommits: relatedCommits.map(c => ({
          sha: c.sha,
          message: c.message,
          authorDate: c.authorDate.toISOString(),
        })),
      },
    }
  }

  async diagnoseBugOrigin(
    bugDescription: string, 
    repositoryId: string,
    sinceDate?: string
  ): Promise<BugOriginResult> {
    const commits = await db.commit.findMany({
      where: {
        repositoryId,
        ...(sinceDate && {
          authorDate: {
            gte: new Date(sinceDate),
          },
        }),
      },
      orderBy: { authorDate: "desc" },
    })

    if (commits.length === 0) {
      return {
        potentialOrigin: null,
        analysis: {
          bugDescription,
          suspiciousPatterns: [],
          recommendedInvestigation: [],
        },
      }
    }

    // Simple heuristic: look for commits with high significance that might be related to the bug
    const suspiciousKeywords = [
      "fix", "bug", "error", "issue", "problem", "broken", "fail",
      "debug", "regression", "crash", "exception", "defect"
    ]

    const suspiciousCommits = commits.filter(commit => {
      const messageLower = commit.message.toLowerCase()
      return suspiciousKeywords.some(keyword => messageLower.includes(keyword)) ||
             commit.significance > 0.7
    })

    // Find the most likely candidate
    const potentialOrigin = suspiciousCommits.length > 0 ? {
      sha: suspiciousCommits[0].sha,
      message: suspiciousCommits[0].message,
      authorDate: suspiciousCommits[0].authorDate.toISOString(),
      authorName: suspiciousCommits[0].authorName,
      confidence: Math.min(0.9, 0.5 + suspiciousCommits[0].significance * 0.4),
      reasoning: "High significance commit with bug-related keywords in message",
    } : null

    return {
      potentialOrigin,
      analysis: {
        bugDescription,
        suspiciousPatterns: [
          "High significance commits",
          "Commits with bug-related keywords",
          "Recent changes to core functionality",
        ],
        recommendedInvestigation: [
          "Review commits with high significance scores",
          "Check recent changes to affected modules",
          "Look for regression patterns in commit history",
        ],
      },
    }
  }

  async explainArchitecturalShift(repositoryId: string): Promise<ArchitecturalShiftResult> {
    const commits = await db.commit.findMany({
      where: { repositoryId },
      orderBy: { authorDate: "asc" },
    })

    if (commits.length === 0) {
      return {
        shifts: [],
        summary: {
          majorShifts: 0,
          primaryAreas: [],
          evolutionPattern: "No commits found",
        },
      }
    }

    // Identify architectural shifts based on commit patterns
    const shifts: ArchitecturalShiftResult["shifts"] = []
    
    // Look for significant commits that might represent architectural changes
    const significantCommits = commits.filter(c => c.significance > 0.7 && c.isKeyCommit)
    
    for (const commit of significantCommits) {
      const messageLower = commit.message.toLowerCase()
      
      // Detect different types of architectural shifts
      let description = "Major architectural change"
      let impact: "low" | "medium" | "high" = "medium"
      
      if (messageLower.includes("refactor") || messageLower.includes("rewrite")) {
        description = "Code refactoring or rewrite"
        impact = "high"
      } else if (messageLower.includes("migrate") || messageLower.includes("migration")) {
        description = "Technology migration"
        impact = "high"
      } else if (messageLower.includes("api") || messageLower.includes("interface")) {
        description = "API or interface changes"
        impact = "medium"
      } else if (messageLower.includes("structure") || messageLower.includes("architecture")) {
        description = "Structural reorganization"
        impact = "high"
      }

      shifts.push({
        sha: commit.sha,
        message: commit.message,
        authorDate: commit.authorDate.toISOString(),
        description,
        impact,
        filesAffected: [], // Would need to analyze actual file changes
      })
    }

    // Analyze evolution pattern
    const primaryAreas = this.extractPrimaryAreas(commits)
    const evolutionPattern = this.determineEvolutionPattern(shifts)

    return {
      shifts,
      summary: {
        majorShifts: shifts.filter(s => s.impact === "high").length,
        primaryAreas,
        evolutionPattern,
      },
    }
  }

  async getReviewGuidelines(repositoryId: string): Promise<ReviewGuidelinesResult> {
    const commits = await db.commit.findMany({
      where: { repositoryId },
      orderBy: { authorDate: "desc" },
      take: 100, // Analyze recent commits
    })

    const contributors = await db.contributor.findMany({
      where: { repositoryId },
      orderBy: { commitsCount: "desc" },
      take: 10,
    })

    // Extract patterns from commit messages
    const commitPatterns = this.extractCommitPatterns(commits)
    
    const guidelines: ReviewGuidelinesResult["guidelines"] = [
      {
        rule: "Clear Commit Messages",
        description: "Write descriptive commit messages that explain the 'why' behind changes",
        severity: "high",
      },
      {
        rule: "Significant Changes Review",
        description: "Commits with high impact should be thoroughly reviewed",
        severity: "high",
      },
      {
        rule: "Consistent Style",
        description: "Maintain consistent coding style across the repository",
        severity: "medium",
      },
    ]

    // Add repository-specific guidelines based on patterns
    if (commitPatterns.hasTests) {
      guidelines.push({
        rule: "Test Coverage",
        description: "Ensure adequate test coverage for new features",
        severity: "medium",
      })
    }

    if (commitPatterns.hasBreakingChanges) {
      guidelines.push({
        rule: "Breaking Changes",
        description: "Clearly document breaking changes and migration paths",
        severity: "high",
      })
    }

    return {
      guidelines,
      context: {
        repositoryPatterns: Array.from(commitPatterns.patterns),
        commonIssues: commitPatterns.issues,
        teamPreferences: commitPatterns.preferences,
      },
    }
  }

  private extractPrimaryAreas(commits: any[]): string[] {
    // Simplified - in reality would analyze file paths and commit messages
    const areas = new Set<string>()
    
    commits.forEach(commit => {
      const message = commit.message.toLowerCase()
      if (message.includes("api")) areas.add("API")
      if (message.includes("ui") || message.includes("frontend")) areas.add("Frontend")
      if (message.includes("database") || message.includes("db")) areas.add("Database")
      if (message.includes("test") || message.includes("spec")) areas.add("Testing")
      if (message.includes("config") || message.includes("setup")) areas.add("Configuration")
    })

    return Array.from(areas)
  }

  private determineEvolutionPattern(shifts: any[]): string {
    if (shifts.length === 0) return "Steady incremental development"
    
    const highImpactShifts = shifts.filter(s => s.impact === "high").length
    
    if (highImpactShifts > 3) return "Rapid evolution with frequent architectural changes"
    if (highImpactShifts > 1) return "Moderate evolution with occasional major changes"
    return "Stable evolution with minimal architectural disruption"
  }

  private extractCommitPatterns(commits: any[]) {
    const patterns = new Set<string>()
    const issues: string[] = []
    const preferences: string[] = []
    
    let hasTests = false
    let hasBreakingChanges = false

    commits.forEach(commit => {
      const message = commit.message.toLowerCase()
      
      // Detect patterns
      if (message.includes("test") || message.includes("spec")) {
        hasTests = true
        patterns.add("Test-driven development")
      }
      
      if (message.includes("break") || message.includes("breaking")) {
        hasBreakingChanges = true
        issues.push("Breaking changes detected")
      }
      
      if (message.includes("fix") || message.includes("bug")) {
        issues.push("Bug fixes common")
      }
      
      if (message.includes("feat") || message.includes("feature")) {
        preferences.push("Feature-focused development")
      }
    })

    return {
      patterns,
      issues,
      preferences,
      hasTests,
      hasBreakingChanges,
    }
  }
}

export const mcpServer = new MCPServer()