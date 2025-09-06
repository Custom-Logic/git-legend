import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's repositories from GitHub API
    const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      console.error("GitHub API error:", response.status, response.statusText)
      return NextResponse.json(
        { error: "Failed to fetch repositories from GitHub" },
        { status: 500 }
      )
    }

    const repositories = await response.json()

    // Filter out repositories that are already in our database
    // This is a simple implementation - in production you'd want to check against the database
    const filteredRepos = repositories.filter((repo: any) => !repo.archived)

    return NextResponse.json(filteredRepos)
  } catch (error) {
    console.error("Error fetching user repositories:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}