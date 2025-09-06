/**
 * @file This file contains the API route for fetching the biography of a repository.
 * @exports GET
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { mcpServer } from "@/lib/mcp-server"

/**
 * Handles GET requests to the /api/mcp/biography route.
 *
 * @param {Request} request - The request object.
 * @returns {Promise<NextResponse>} A response object.
 */
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
    // In a real implementation, you'd check permissions here

    const biography = await mcpServer.getBiography(repositoryId)

    return NextResponse.json(biography)
  } catch (error) {
    console.error("Error in MCP biography:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}