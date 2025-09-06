/**
 * @file This file contains the API route for fetching a single repository.
 * @exports GET
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * Handles GET requests to the /api/repositories/[id] route.
 *
 * @param {Request} request - The request object.
 * @param {{ params: { id: string } }} context - The context object, containing the route parameters.
 * @returns {Promise<NextResponse>} A response object.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const repository = await db.repository.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    return NextResponse.json(repository)
  } catch (error) {
    console.error("Error fetching repository:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}