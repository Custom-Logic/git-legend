import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get repository with analysis data
    const repository = await db.repository.findUnique({
      where: { id },
      include: {
        analyses: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            commits: {
              orderBy: { authorDate: "desc" },
            },
            contributors: {
              orderBy: { commitsCount: "desc" },
            },
          },
        },
      },
    })

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      )
    }

    const latestAnalysis = repository.analyses[0]

    if (!latestAnalysis) {
      return NextResponse.json(
        { error: "No analysis found for this repository" },
        { status: 404 }
      )
    }

    // Calculate repository statistics
    const totalCommits = latestAnalysis.commits.length
    const totalContributors = latestAnalysis.contributors.length
    const totalAdditions = latestAnalysis.commits.reduce((sum, commit) => sum + commit.additions, 0)
    const totalDeletions = latestAnalysis.commits.reduce((sum, commit) => sum + commit.deletions, 0)
    const keyCommits = latestAnalysis.commits.filter(commit => commit.isKeyCommit)

    // Calculate project health score (simplified algorithm)
    const avgCommitsPerContributor = totalCommits / totalContributors
    const recentActivity = latestAnalysis.commits.filter(commit => {
      const commitDate = new Date(commit.authorDate)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return commitDate >= thirtyDaysAgo
    }).length

    const healthScore = Math.min(100, 
      (avgCommitsPerContributor * 10) + 
      (recentActivity * 2) + 
      (keyCommits.length * 5)
    )

    const legendData = {
      repository: {
        id: repository.id,
        name: repository.name,
        fullName: repository.fullName,
        description: repository.description,
        language: repository.language,
        stars: repository.stars,
        forks: repository.forks,
        lastAnalyzedAt: repository.lastAnalyzedAt,
      },
      analysis: {
        id: latestAnalysis.id,
        completedAt: latestAnalysis.completedAt,
        healthScore: Math.round(healthScore),
      },
      stats: {
        totalCommits,
        totalContributors,
        totalAdditions,
        totalDeletions,
        keyCommits: keyCommits.length,
        recentActivity,
      },
      commits: latestAnalysis.commits,
      contributors: latestAnalysis.contributors,
    }

    return NextResponse.json(legendData)
  } catch (error) {
    console.error("Error fetching legend data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}