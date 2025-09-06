import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get repository data for badge
    const repository = await db.repository.findUnique({
      where: { id },
      include: {
        analyses: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            commits: {
              select: { id: true },
            },
            contributors: {
              select: { id: true },
            },
          },
        },
      },
    })

    if (!repository || repository.isPrivate) {
      // Return a default "not found" badge
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
          <rect width="200" height="80" rx="4" fill="#64748b"/>
          <text x="100" y="35" text-anchor="middle" fill="#f1f5f9" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
            GitLegend
          </text>
          <text x="100" y="55" text-anchor="middle" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="10">
            Not Found
          </text>
        </svg>
      `
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    const analysis = repository.analyses[0]
    const totalCommits = analysis?.commits.length || 0
    const totalContributors = analysis?.contributors.length || 0

    // Generate badge SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="80" rx="4" fill="url(#grad1)"/>
        <text x="100" y="20" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold">
          GitLegend
        </text>
        <text x="100" y="35" text-anchor="middle" fill="#e0e7ff" font-family="Arial, sans-serif" font-size="9">
          ${repository.fullName}
        </text>
        <text x="100" y="50" text-anchor="middle" fill="#c7d2fe" font-family="Arial, sans-serif" font-size="8">
          ${totalCommits} commits • ${totalContributors} contributors
        </text>
        <text x="100" y="65" text-anchor="middle" fill="#a5b4fc" font-family="Arial, sans-serif" font-size="7">
          View Full Legend →
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error("Error generating badge:", error)
    
    // Return error badge
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
        <rect width="200" height="80" rx="4" fill="#ef4444"/>
        <text x="100" y="35" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
          GitLegend
        </text>
        <text x="100" y="55" text-anchor="middle" fill="#fecaca" font-family="Arial, sans-serif" font-size="10">
          Error
        </text>
      </svg>
    `
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }
}