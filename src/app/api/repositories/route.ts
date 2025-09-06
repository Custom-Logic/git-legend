import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const repositories = await db.repository.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(repositories)
  } catch (error) {
    console.error("Error fetching repositories:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { repositoryUrl } = await request.json()

    if (!repositoryUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      )
    }

    // Extract owner and repo name from GitHub URL
    const urlMatch = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!urlMatch) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      )
    }

    const [, owner, repoName] = urlMatch
    const fullName = `${owner}/${repoName}`

    // Check if repository already exists
    const existingRepository = await db.repository.findFirst({
      where: {
        fullName,
        userId: session.user.id,
      },
    })

    if (existingRepository) {
      return NextResponse.json(
        { error: "Repository already added" },
        { status: 400 }
      )
    }

    // Fetch repository data from GitHub API
    const githubResponse = await fetch(`https://api.github.com/repos/${fullName}`, {
      headers: {
        Authorization: `token ${(session as any).accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!githubResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch repository from GitHub" },
        { status: 400 }
      )
    }

    const githubData = await githubResponse.json()

    // Create repository in database
    const repository = await db.repository.create({
      data: {
        githubId: githubData.id.toString(),
        name: githubData.name,
        fullName: githubData.full_name,
        description: githubData.description,
        language: githubData.language,
        stars: githubData.stargazers_count,
        forks: githubData.forks_count,
        isPrivate: githubData.private,
        userId: session.user.id,
      },
    })

    return NextResponse.json(repository)
  } catch (error) {
    console.error("Error creating repository:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}