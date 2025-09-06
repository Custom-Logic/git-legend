/**
 * @file This file contains the MCPServer class, which provides methods for analyzing repositories.
 * @exports MCPContext
 * @exports BiographyResult
 * @exports IntelResult
 * @exports BugOriginResult
 * @exports ArchitecturalShiftResult
 * @exports ReviewGuidelinesResult
 * @exports MCPServer
 * @exports mcpServer
 */

import { db } from "@/lib/db"
import { AnalysisStatus } from "@prisma/client"

/**
 * Represents the context for an MCP analysis.
 * @interface
 */
export interface MCPContext {
  /** The ID of the repository. */
  repositoryId: string
  /** The SHA of the commit to analyze. */
  commitSha?: string
  /** The ID of the user performing the analysis. */
  userId?: string
}

/**
 * Represents the result of a repository biography analysis.
 * @interface
 */
export interface BiographyResult {
  /** The repository information. */
  repository: {
    /** The name of the repository. */
    name: string
    /** The full name of the repository. */
    fullName: string
    /** The description of the repository. */
    description?: string
    /** The primary language of the repository. */
    language?: string
    /** The number of stars. */
    stars: number
    /** The number of forks. */
    forks: number
    /** The date the repository was created. */
    createdAt: string
    /** The date the repository was last analyzed. */
    lastAnalyzedAt?: string
  }
  /** The total number of commits. */
  totalCommits: number
  /** The total number of contributors. */
  totalContributors: number
  /** The time span of the repository's history. */
  timeSpan: {
    /** The date of the first commit. */
    firstCommit: string
    /** The date of the last commit. */
    lastCommit: string
  }
  /** Key metrics for the repository. */
  keyMetrics: {
    /** The average number of commits per month. */
    avgCommitsPerMonth: number
    /** The top contributor to the repository. */
    topContributor: string
    /** The most active month for the repository. */
    mostActiveMonth: string
  }
}

/**
 * Represents the result of a commit intelligence analysis.
 * @interface
 */
export interface IntelResult {
  /** The commit information. */
  commit: {
    /** The SHA of the commit. */
    sha: string
    /** The commit message. */
    message: string
    /** The name of the commit author. */
    authorName: string
    /** The date of the commit. */
    authorDate: string
    /** The significance of the commit, from 0 to 1. */
    significance: number
    /** A summary of the commit. */
    summary?: string
    /** Whether the commit is a key commit. */
    isKeyCommit: boolean
  }
  /** The context of the commit. */
  context: {
    /** The number of files changed in the commit. */
    filesChanged: number
    /** The number of additions in the commit. */
    additions: number
    /** The number of deletions in the commit. */
    deletions: number
    /** An array of related commits. */
    relatedCommits: Array<{
      sha: string
      message: string
      authorDate: string
    }>
  }
}

/**
 * Represents the result of a bug origin analysis.
 * @interface
 */
export interface BugOriginResult {
  /** The potential origin of the bug. */
  potentialOrigin: {
    /** The SHA of the commit. */
    sha: string
    /** The commit message. */
    message: string
    /** The date of the commit. */
    authorDate: string
    /** The name of the commit author. */
    authorName: string
    /** The confidence in the potential origin, from 0 to 1. */
    confidence: number
    /** The reasoning for the potential origin. */
    reasoning: string
  } | null
  /** The analysis of the bug. */
  analysis: {
    /** A description of the bug. */
    bugDescription: string
    /** An array of suspicious patterns found in the code. */
    suspiciousPatterns: string[]
    /** An array of recommended investigation steps. */
    recommendedInvestigation: string[]
  }
}

/**
 * Represents the result of an architectural shift analysis.
 * @interface
 */
export interface ArchitecturalShiftResult {
  /** An array of architectural shifts. */
  shifts: Array<{
    /** The SHA of the commit. */
    sha: string
    /** The commit message. */
    message: string
    /** The date of the commit. */
    authorDate: string
    /** A description of the shift. */
    description: string
    /** The impact of the shift. */
    impact: "low" | "medium" | "high"
    /** An array of files affected by the shift. */
    filesAffected: string[]
  }>
  /** A summary of the architectural shifts. */
  summary: {
    /** The number of major shifts. */
    majorShifts: number
    /** The primary areas of the codebase that have evolved. */
    primaryAreas: string[]
    /** The evolution pattern of the repository. */
    evolutionPattern: string
  }
}

/**
 * Represents the result of a review guidelines analysis.
 * @interface
 */
export interface ReviewGuidelinesResult {
  /** An array of review guidelines. */
  guidelines: Array<{
    /** The rule or guideline. */
    rule: string
    /** A description of the guideline. */
    description: string
    /** An example commit that illustrates the guideline. */
    exampleCommit?: string
    /** The severity of the guideline. */
    severity: "low" | "medium" | "high"
  }>
  /** The context for the review guidelines. */
  context: {
    /** An array of repository patterns. */
    repositoryPatterns: string[]
    /** An array of common issues found in the repository. */
    commonIssues: string[]
    /** An array of team preferences. */
    teamPreferences: string[]
  }
}

/**
 * A server class that provides methods for analyzing repositories.
 */
class MCPServer {
  /**
   * Retrieves the biography of a repository.
   * @param {string} repositoryId - The ID of the repository.
   * @returns {Promise<BiographyResult>} A promise that resolves with the biography of the repository.
   */
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

  /**
   * Retrieves intelligence for a specific commit.
   * @param {string} commitSha - The SHA of the commit.
   * @param {string} repositoryId - The ID of the repository.
   * @returns {Promise<IntelResult>} A promise that resolves with the intelligence for the commit.
   */
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

  /**
   * Diagnoses the origin of a bug.
   * @param {string} bugDescription - A description of the bug.
   * @param {string} repositoryId - The ID of the repository.
   * @param {string} [sinceDate] - The date to start searching for the bug origin.
   * @returns {Promise<BugOriginResult>} A promise that resolves with the bug origin analysis.
   */
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

  /**
   * Explains the architectural shifts in a repository.
   * @param {string} repositoryId - The ID of the repository.
   * @returns {Promise<ArchitecturalShiftResult>} A promise that resolves with the architectural shift analysis.
   */
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

  /**
   * Retrieves review guidelines for a repository.
   * @param {string} repositoryId - The ID of the repository.
   * @returns {Promise<ReviewGuidelinesResult>} A promise that resolves with the review guidelines.
   */
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

  /**
   * Extracts the primary areas of a repository from a list of commits.
   * @private
   * @param {any[]} commits - The list of commits.
   * @returns {string[]} An array of primary areas.
   */
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

  /**
   * Determines the evolution pattern of a repository from a list of shifts.
   * @private
   * @param {any[]} shifts - The list of architectural shifts.
   * @returns {string} The evolution pattern.
   */
  private determineEvolutionPattern(shifts: any[]): string {
    if (shifts.length === 0) return "Steady incremental development"
    
    const highImpactShifts = shifts.filter(s => s.impact === "high").length
    
    if (highImpactShifts > 3) return "Rapid evolution with frequent architectural changes"
    if (highImpactShifts > 1) return "Moderate evolution with occasional major changes"
    return "Stable evolution with minimal architectural disruption"
  }

  /**
   * Extracts commit patterns from a list of commits.
   * @private
   * @param {any[]} commits - The list of commits.
   * @returns {object} An object containing the commit patterns.
   */
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

/**
 * An instance of the MCPServer class.
 * @type {MCPServer}
 */
export const mcpServer = new MCPServer()