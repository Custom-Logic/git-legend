import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import ZAI from 'z-ai-web-dev-sdk'

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string
    id: number
  }
  committer: {
    login: string
    avatar_url: string
    id: number
  }
  stats?: {
    additions: number
    deletions: number
    total: number
  }
  files?: Array<{
    filename: string
    additions: number
    deletions: number
    changes: number
  }>
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { repositoryId } = await request.json()

    if (!repositoryId) {
      return NextResponse.json(
        { error: "Repository ID is required" },
        { status: 400 }
      )
    }

    // Get repository from database - check by user's GitHub ID instead of internal user ID
    const repository = await db.repository.findFirst({
      where: {
        id: repositoryId,
        user: {
          email: session.user.email ?? undefined
        }
      },
      include: {
        user: true
      }
    })

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      )
    }

    // Get access token from session
    const accessToken = (session as any).accessToken
    if (!accessToken) {
      return NextResponse.json(
        { error: "GitHub access token not found" },
        { status: 401 }
      )
    }

    // Create analysis record
    const analysis = await db.analysis.create({
      data: {
        userId: repository.userId,
        repositoryId: repositoryId,
        status: "PROCESSING",
        progress: 0,
      },
    })

    // Start analysis in background
    performAnalysis(repositoryId, analysis.id, repository.fullName, accessToken)
      .catch(error => {
        console.error("Background analysis failed:", error)
      })

    return NextResponse.json({ analysisId: analysis.id })
  } catch (error) {
    console.error("Error starting analysis:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function performAnalysis(repositoryId: string, analysisId: string, fullName: string, accessToken: string) {
  try {
    await db.analysis.update({
      where: { id: analysisId },
      data: { progress: 10 },
    })

    const commits = await fetchCommits(fullName, accessToken)
    
    await db.analysis.update({
      where: { id: analysisId },
      data: { progress: 30 },
    })

    const processedCommits = await processCommits(commits)
    
    await db.analysis.update({
      where: { id: analysisId },
      data: { progress: 60 },
    })

    const commitsWithSummaries = await generateSummaries(processedCommits)
    
    await db.analysis.update({
      where: { id: analysisId },
      data: { progress: 80 },
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
      data: { lastAnalyzedAt: new Date() },
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
    
    // Fetch detailed commit info for stats
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

async function generateSummaries(commits: any[]) {
  try {
    const zai = await ZAI.create()
    const keyCommits = commits.filter(commit => commit.isKeyCommit)
    
    for (const commit of keyCommits) {
      try {
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are an expert software engineer who analyzes git commits and provides clear, concise summaries. Focus on the 'why' behind the change, not just the 'what'. Keep summaries to 1-2 sentences maximum."
            },
            {
              role: "user",
              content: `Summarize this git commit for a technical audience:\n\nCommit Message: ${commit.message}\n\nFiles Changed: ${commit.filesChanged}\nAdditions: ${commit.additions}\nDeletions: ${commit.deletions}`
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
        })

        const summary = completion.choices[0]?.message?.content
        if (summary) {
          commit.summary = summary.trim()
        }
      } catch (error) {
        console.error("Error generating summary for commit:", commit.sha, error)
        commit.summary = null
      }
    }
    
    return commits
  } catch (error) {
    console.error("Error initializing ZAI for summaries:", error)
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

async function saveAnalysisResults(repositoryId: string, analysisId: string, commits: any[], contributors: any[]) {
  for (const commit of commits) {
    await db.commit.create({
      data: {
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
      },
    })
  }

  for (const contributor of contributors) {
    await db.contributor.create({
      data: {
        githubId: contributor.githubId,
        login: contributor.login,
        name: contributor.name,
        email: contributor.email,
        avatar: contributor.avatar,
        commitsCount: contributor.commitsCount,
        additions: contributor.additions,
        deletions: contributor.deletions,
        isFirstContributor: contributor.isFirstContributor,
        isTopContributor: contributor.isTopContributor,
        repositoryId,
        analysisId,
      },
    })
  }
}