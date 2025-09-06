import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { mcpServer } from "@/lib/mcp-server"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bugDescription, repositoryId, sinceDate } = await request.json()

    if (!bugDescription || !repositoryId) {
      return NextResponse.json(
        { error: "Bug description and Repository ID are required" },
        { status: 400 }
      )
    }

    // Verify user has access to this repository
    // In a real implementation, you'd check permissions here

    const diagnosis = await mcpServer.diagnoseBugOrigin(bugDescription, repositoryId, sinceDate)

    return NextResponse.json(diagnosis)
  } catch (error) {
    console.error("Error in MCP bug diagnosis:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}