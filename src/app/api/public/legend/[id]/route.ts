import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get repository with public analysis data
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
              take: 10, // Limit commits for public view
            },
            contributors: {
              orderBy: { commitsCount: "desc" },
              take: 5, // Limit contributors for public view
            },
          },
        },
        user: {
          select: {
            name: true,
            avatar: true,
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

    // Check if repository is private - don't show private repos publicly
    if (repository.isPrivate) {
      return NextResponse.json(
        { error: "Private repository" },
        { status: 403 }
      )
    }

    const latestAnalysis = repository.analyses[0]

    if (!latestAnalysis) {
      return NextResponse.json(
        { error: "No analysis found for this repository" },
        { status: 404 }
      )
    }

    // Calculate basic stats for public view
    const totalCommits = latestAnalysis.commits.length
    const totalContributors = latestAnalysis.contributors.length
    const keyCommits = latestAnalysis.commits.filter(commit => commit.isKeyCommit)

    const publicData = {
      repository: {
        id: repository.id,
        name: repository.name,
        fullName: repository.fullName,
        description: repository.description,
        language: repository.language,
        stars: repository.stars,
        forks: repository.forks,
        lastAnalyzedAt: repository.lastAnalyzedAt,
        owner: repository.user,
      },
      stats: {
        totalCommits,
        totalContributors,
        keyCommits: keyCommits.length,
      },
      recentCommits: latestAnalysis.commits,
      topContributors: latestAnalysis.contributors,
      shareUrl: `${request.headers.get('origin')}/public/legend/${repository.id}`,
    }

    return NextResponse.json(publicData)
  } catch (error) {
    console.error("Error fetching public legend data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}