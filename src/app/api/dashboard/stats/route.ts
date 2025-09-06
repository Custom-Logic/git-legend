import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's repositories count
    const repositoriesCount = await db.repository.count({
      where: {
        user: { email: session.user.email }
      }
    })

    // Get completed analyses count
    const analysesCount = await db.analysis.count({
      where: {
        user: { email: session.user.email },
        status: "COMPLETED"
      }
    })

    // Get processing analyses count
    const processingCount = await db.analysis.count({
      where: {
        user: { email: session.user.email },
        status: "PROCESSING"
      }
    })

    // Get total commits analyzed
    const commitsCount = await db.commit.count({
      where: {
        repository: {
          user: { email: session.user.email }
        }
      }
    })

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentAnalyses = await db.analysis.count({
      where: {
        user: { email: session.user.email },
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    return NextResponse.json({
      repositories: repositoriesCount,
      analyses: analysesCount,
      processing: processingCount,
      commits: commitsCount,
      recentActivity: recentAnalyses
    })

  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({
      error: "Failed to fetch stats",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}