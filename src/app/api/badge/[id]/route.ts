/**
 * @file This file contains the API route for generating a repository badge.
 * @exports GET
 */

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * Represents the data for a repository badge.
 * @interface
 */
interface BadgeData {
  repository: {
    name: string
    fullName: string
    stars: number
    forks: number
  }
  totalCommits: number
  totalContributors: number
  lastAnalyzedAt?: string
}

/**
 * Handles GET requests to the /api/badge/[id] route.
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
    // Get repository data
    const repository = await db.repository.findUnique({
      where: { id: params.id },
    })

    if (!repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    // Get commits count
    const commitsCount = await db.commit.count({
      where: { repositoryId: params.id },
    })

    // Get contributors count
    const contributorsCount = await db.contributor.count({
      where: { repositoryId: params.id },
    })

    const badgeData: BadgeData = {
      repository: {
        name: repository.name,
        fullName: repository.fullName,
        stars: repository.stars,
        forks: repository.forks,
      },
      totalCommits: commitsCount,
      totalContributors: contributorsCount,
      lastAnalyzedAt: repository.lastAnalyzedAt?.toISOString(),
    }

    // Generate SVG badge
    const svg = generateBadgeSVG(badgeData)

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("Error generating badge:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Generates an SVG badge for a repository.
 *
 * @param {BadgeData} data - The data for the badge.
 * @returns {string} The SVG badge.
 */
function generateBadgeSVG(data: BadgeData): string {
  const width = 300
  const height = 80
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" rx="8" fill="#1f2937"/>
  
  <!-- GitLegend Logo/Text -->
  <text x="15" y="25" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">
    📊 GitLegend
  </text>
  
  <!-- Repository Name -->
  <text x="15" y="45" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">
    ${data.repository.name}
  </text>
  
  <!-- Stats -->
  <text x="15" y="65" font-family="Arial, sans-serif" font-size="11" fill="#9ca3af">
    ${data.totalCommits} commits • ${data.totalContributors} contributors • ⭐${data.repository.stars}
  </text>
  
  <!-- Right side gradient accent -->
  <rect x="${width - 60}" y="0" width="60" height="${height}" rx="8" fill="url(#grad1)"/>
  
  <!-- View text -->
  <text x="${width - 30}" y="${height/2 + 4}" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle">
    VIEW
  </text>
</svg>
  `.trim()
}