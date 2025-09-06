import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const repositoryId = searchParams.get("repositoryId")

    if (!repositoryId) {
      return NextResponse.json(
        { error: "Repository ID is required" },
        { status: 400 }
      )
    }

    // Verify user has access to this repository
    const repository = await db.repository.findFirst({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
    })

    if (!repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    const commits = await db.commit.findMany({
      where: { repositoryId },
      orderBy: { authorDate: "desc" },
    })

    return NextResponse.json(commits)
  } catch (error) {
    console.error("Error fetching commits:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}