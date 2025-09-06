import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { OpenRouterAI } from "@/lib/openrouter"
import { DEFAULT_MODEL_CONFIG } from "@/lib/ai-models"

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: { name: string; email: string; date: string }
    committer: { name: string; email: string; date: string }
  }
  author: { login: string; avatar_url: string; id: number }
  committer: { login: string; avatar_url: string; id: number }
  stats?: { additions: number; deletions: number; total: number }
  files?: Array<{ filename: string; additions: number; deletions: number; changes: number }>
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { repositoryId } = await request.json()

    if (!repositoryId) {
      return NextResponse.json({ error: "Repository ID is required" }, { status: 400 })
    }

    const repository = await db.repository.findFirst({
      where: {
        id: repositoryId,
        user: { email: session.user.email ?? undefined }
      },
      include: { user: true }
    })

    if (!repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    const accessToken = (session as any).accessToken
    if (!accessToken) {
      return NextResponse.json({ error: "GitHub access token not found" }, { status: 401 })
    }

    const analysis = await db.analysis.create({
      data: {
        userId: repository.userId,
        repositoryId: repositoryId,
        status: "PROCESSING",
        progress: 0,
      },
    })

    performAnalysis(repositoryId, analysis.id, repository.fullName, accessToken)
      .catch(error => console.error("Background analysis failed:", error))

    return NextResponse.json({ analysisId: analysis.id })
  } catch (error) {
    console.error("Error starting analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getAIModelConfig() {
  try {
    // Safe access to the model
    const config = await (db as any).aiModelConfig?.findFirst?.({
      orderBy: { createdAt: 'desc' }
    })

    return config ? {
      primary: config.primaryModel,
      fallback: config.fallbackModel,
      enabled: config.enabledModels
    } : DEFAULT_MODEL_CONFIG
  } catch (error) {
    console.error("Error loading AI model config:", error)
    return DEFAULT_MODEL_CONFIG
  }
}

async function performAnalysis(repositoryId: string, analysisId: string, fullName: string, accessToken: string) {
  try {
    await db.analysis.update({
      where: { id: analysisId },
      data: { progress: 10 }
    })

    const commits = await fetchCommits(fullName, accessToken)
    
    await db.analysis.update({
      where: { id: analysisId },
      data: { progress: 30 }
    })

    const processedCommits = await processCommits(commits)
    
    await db.analysis.update({
      where: { id: analysisId },
      data: { progress: 60 }
    })

    const commitsWithSummaries = await generateSummaries(processedCommits, analysisId)
    
    await db.analysis.update({
      where: { id: analysisId },
      data: { progress: 80 }
    })

    const contributors = extractContributors(processedCommits)
    await saveAnalysisResults(repositoryId, analysisId, commitsWithSummaries, contributors)

    await db.analysis.update({
      where: { id: analysisId },
      data: { 
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date(),
      },
    })

    await db.repository.update({
      where: { id: repositoryId },
      data: { lastAnalyzedAt: new Date() }
    })

  } catch (error) {
    console.error("Error during analysis:", error)
    await db.analysis.update({
      where: { id: analysisId },
      data: { 
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })
  }
}

async function fetchCommits(fullName: string, accessToken: string): Promise<GitHubCommit[]> {
  const allCommits: GitHubCommit[] = []
  let page = 1
  const perPage = 100

  while (allCommits.length < 500) {
    const response = await fetch(
      `https://api.github.com/repos/${fullName}/commits?per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "GitLegend-App"
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Repository not found or no access")
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const commits = await response.json()
    if (!commits || commits.length === 0) break
    
    for (const commit of commits) {
      try {
        const detailResponse = await fetch(
          `https://api.github.com/repos/${fullName}/commits/${commit.sha}`,
          {
            headers: {
              Authorization: `token ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "GitLegend-App"
            },
          }
        )
        
        if (detailResponse.ok) {
          const detailedCommit = await detailResponse.json()
          commit.stats = detailedCommit.stats
          commit.files = detailedCommit.files
        }
      } catch (error) {
        console.error(`Error fetching details for commit ${commit.sha}:`, error)
      }
    }
    
    allCommits.push(...commits)
    page++
  }

  return allCommits
}

async function processCommits(commits: GitHubCommit[]) {
  return commits.map((commit) => {
    const filesChanged = commit.files?.length || 0
    const totalChanges = (commit.stats?.additions || 0) + (commit.stats?.deletions || 0)
    const hasMergeKeyword = commit.commit.message.toLowerCase().includes("merge")
    const hasReleaseKeyword = /\b(release|version|v\d+\.\d+)\b/i.test(commit.commit.message)
    
    let significance = 0
    significance += Math.log(totalChanges + 1) * 0.4
    significance += Math.log(filesChanged + 1) * 0.3
    significance += hasMergeKeyword ? 0.2 : 0
    significance += hasReleaseKeyword ? 0.3 : 0
    significance = Math.min(significance, 1)

    return {
      sha: commit.sha,
      message: commit.commit.message,
      authorName: commit.commit.author.name,
      authorEmail: commit.commit.author.email,
      authorDate: new Date(commit.commit.author.date),
      committerName: commit.commit.committer.name,
      committerEmail: commit.commit.committer.email,
      committerDate: new Date(commit.commit.committer.date),
      additions: commit.stats?.additions || 0,
      deletions: commit.stats?.deletions || 0,
      filesChanged,
      significance,
      isKeyCommit: significance > 0.7,
      authorLogin: commit.author?.login,
      authorAvatar: commit.author?.avatar_url,
      authorGithubId: commit.author?.id?.toString(),
    }
  })
}

async function generateSummaries(commits: any[], analysisId: string) {
  try {
    const modelConfig = await getAIModelConfig()
    const openRouter = new OpenRouterAI(undefined, modelConfig)
    const keyCommits = commits.filter(commit => commit.isKeyCommit)
    
    console.log(`Generating summaries for ${keyCommits.length} key commits using config:`, {
      primary: modelConfig.primary,
      fallback: modelConfig.fallback,
      enabledCount: modelConfig.enabled.length
    })
    
    const summaryResults = await openRouter.batchGenerateSummaries(
      keyCommits.map(commit => ({
        sha: commit.sha,
        message: commit.message,
        filesChanged: commit.filesChanged,
        additions: commit.additions,
        deletions: commit.deletions
      }))
    )
    
    // Track model usage statistics
    const modelUsageStats = new Map<string, number>()
    let successfulSummaries = 0
    
    const summaryMap = new Map<string, string>()
    summaryResults.forEach(result => {
      if (result.summary) {
        summaryMap.set(result.sha, result.summary)
        successfulSummaries++
        
        if (result.modelUsed) {
          modelUsageStats.set(
            result.modelUsed, 
            (modelUsageStats.get(result.modelUsed) || 0) + 1
          )
        }
      }
    })
    
    // Log usage statistics
    console.log(`Summary generation complete:`, {
      totalCommits: keyCommits.length,
      successful: successfulSummaries,
      failureRate: `${((keyCommits.length - successfulSummaries) / keyCommits.length * 100).toFixed(1)}%`,
      modelUsage: Object.fromEntries(modelUsageStats)
    })
    
    // Save model usage stats to analysis
    await db.analysis.update({
      where: { id: analysisId },
      data: {
         // @ts-ignore - temporary workaround
        modelUsageStats: Object.fromEntries(modelUsageStats),
        summariesGenerated: successfulSummaries
      }
    })
    
    commits.forEach(commit => {
      if (summaryMap.has(commit.sha)) {
        commit.summary = summaryMap.get(commit.sha)
      }
    })
    
    return commits
  } catch (error) {
    console.error("Error generating summaries:", error)
    return commits
  }
}

function extractContributors(commits: any[]) {
  const contributorMap = new Map()
  
  commits.forEach(commit => {
    const githubId = commit.authorGithubId
    if (!githubId) return
    
    if (!contributorMap.has(githubId)) {
      contributorMap.set(githubId, {
        githubId,
        login: commit.authorLogin,
        name: commit.authorName,
        email: commit.authorEmail,
        avatar: commit.authorAvatar,
        commitsCount: 0,
        additions: 0,
        deletions: 0,
      })
    }
    
    const contributor = contributorMap.get(githubId)
    contributor.commitsCount++
    contributor.additions += commit.additions
    contributor.deletions += commit.deletions
  })
  
  const contributors = Array.from(contributorMap.values())
  contributors.sort((a, b) => b.commitsCount - a.commitsCount)
  
  const topCount = Math.max(1, Math.floor(contributors.length * 0.2))
  contributors.forEach((contributor, index) => {
    contributor.isTopContributor = index < topCount
    contributor.isFirstContributor = index === 0
  })
  
  return contributors
}

async function saveAnalysisResults(
  repositoryId: string,
  analysisId: string,
  commits: any[],
  contributors: any[]
) {
  // Batch create commits
  if (commits.length > 0) {
    await db.commit.createMany({
      data: commits.map((commit) => ({
        sha: commit.sha,
        message: commit.message,
        authorName: commit.authorName,
        authorEmail: commit.authorEmail,
        authorDate: commit.authorDate,
        committerName: commit.committerName,
        committerEmail: commit.committerEmail,
        committerDate: commit.committerDate,
        additions: commit.additions,
        deletions: commit.deletions,
        filesChanged: commit.filesChanged,
        significance: commit.significance,
        summary: commit.summary,
        isKeyCommit: commit.isKeyCommit,
        repositoryId,
        analysisId,
      })),
      skipDuplicates: true, // In case a commit from another analysis is already there
    });
  }

  // Batch create or update contributors
  if (contributors.length > 0) {
    for (const contributor of contributors) {
      await db.contributor.upsert({
        where: {
          repositoryId_githubId: {
            repositoryId,
            githubId: contributor.githubId,
          },
        },
        update: {
          commitsCount: { increment: contributor.commitsCount },
          additions: { increment: contributor.additions },
          deletions: { increment: contributor.deletions },
          // Update other fields if necessary
          name: contributor.name,
          avatar: contributor.avatar,
        },
        create: {
          ...contributor,
          repositoryId,
          analysisId, // Link to the current analysis
        },
      });
    }
  }
}
