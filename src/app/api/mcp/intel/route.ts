import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { mcpServer } from "@/lib/mcp-server"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commitSha = searchParams.get("commitSha")
    const repositoryId = searchParams.get("repositoryId")

    if (!commitSha || !repositoryId) {
      return NextResponse.json(
        { error: "Commit SHA and Repository ID are required" },
        { status: 400 }
      )
    }

    // Verify user has access to this repository
    // In a real implementation, you'd check permissions here

    const intel = await mcpServer.getIntel(commitSha, repositoryId)

    return NextResponse.json(intel)
  } catch (error) {
    console.error("Error in MCP intel:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}