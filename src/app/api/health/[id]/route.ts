import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { healthScoringService } from "@/lib/health-scoring"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user has access to this repository
    // In a real implementation, you'd check permissions here

    const healthScore = await healthScoringService.calculateHealthScore(params.id)

    return NextResponse.json(healthScore)
  } catch (error) {
    console.error("Error calculating health score:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}