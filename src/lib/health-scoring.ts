/**
 * @file This file contains the HealthScoringService class, which is used to calculate the health score of a repository.
 * @exports HealthScore
 * @exports HealthScoringService
 * @exports healthScoringService
 */

import { db } from "@/lib/db"

/**
 * Represents the health score of a repository.
 * @interface
 */
export interface HealthScore {
  overall: number
  breakdown: {
    activity: number
    contributorDiversity: number
    codeQuality: number
    maintenance: number
  }
  recommendations: string[]
  metrics: {
    totalCommits: number
    activeContributors: number
    commitFrequency: number
    avgResponseTime: number
    bugFixRate: number
  }
}

/**
 * A service for calculating the health score of a repository.
 */
export class HealthScoringService {
  /**
   * Calculates the health score for a given repository.
   * @param {string} repositoryId - The ID of the repository.
   * @returns {Promise<HealthScore>} The health score of the repository.
   */
  async calculateHealthScore(repositoryId: string): Promise<HealthScore> {
    const [commits, contributors] = await Promise.all([
      db.commit.findMany({ where: { repositoryId } }),
      db.contributor.findMany({ where: { repositoryId } }),
    ])

    if (commits.length === 0) {
      return {
        overall: 0,
        breakdown: {
          activity: 0,
          contributorDiversity: 0,
          codeQuality: 0,
          maintenance: 0,
        },
        recommendations: ["No commits found to analyze health"],
        metrics: {
          totalCommits: 0,
          activeContributors: 0,
          commitFrequency: 0,
          avgResponseTime: 0,
          bugFixRate: 0,
        },
      }
    }

    // Calculate various health metrics
    const metrics = this.calculateMetrics(commits, contributors)
    const breakdown = this.calculateBreakdown(commits, contributors, metrics)
    const overall = this.calculateOverallScore(breakdown)
    const recommendations = this.generateRecommendations(breakdown, metrics)

    return {
      overall,
      breakdown,
      recommendations,
      metrics,
    }
  }

  /**
   * Calculates the health metrics for a repository.
   * @private
   * @param {any[]} commits - The commits of the repository.
   * @param {any[]} contributors - The contributors of the repository.
   * @returns {object} The health metrics.
   */
  private calculateMetrics(commits: any[], contributors: any[]) {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // Recent activity
    const recentCommits = commits.filter(c => new Date(c.authorDate) >= thirtyDaysAgo)
    const recentContributors = contributors.filter(c => {
      const contributorCommits = commits.filter(commit => 
        commit.authorName === c.name && new Date(commit.authorDate) >= thirtyDaysAgo
      )
      return contributorCommits.length > 0
    })

    // Commit frequency (commits per week)
    const timeSpan = new Date(commits[commits.length - 1].authorDate).getTime() - new Date(commits[0].authorDate).getTime()
    const weeksSpan = Math.max(1, timeSpan / (7 * 24 * 60 * 60 * 1000))
    const commitFrequency = commits.length / weeksSpan

    // Bug fix rate (commits with fix/bug keywords)
    const bugFixCommits = commits.filter(c => 
      c.message.toLowerCase().includes('fix') || 
      c.message.toLowerCase().includes('bug')
    )
    const bugFixRate = commits.length > 0 ? bugFixCommits.length / commits.length : 0

    // Average response time (time between issue mentions and fixes - simplified)
    const fixCommits = commits.filter(c => c.message.toLowerCase().includes('fix'))
    const avgResponseTime = this.calculateAverageResponseTime(fixCommits)

    return {
      totalCommits: commits.length,
      activeContributors: recentContributors.length,
      commitFrequency,
      avgResponseTime,
      bugFixRate,
    }
  }

  /**
   * Calculates the breakdown of the health score.
   * @private
   * @param {any[]} commits - The commits of the repository.
   * @param {any[]} contributors - The contributors of the repository.
   * @param {any} metrics - The health metrics.
   * @returns {object} The breakdown of the health score.
   */
  private calculateBreakdown(commits: any[], contributors: any[], metrics: any) {
    // Activity Score (0-100)
    let activityScore = 0
    if (metrics.activeContributors > 0) {
      activityScore = Math.min(100, (metrics.activeContributors * 20) + (metrics.commitFrequency * 10))
    }

    // Contributor Diversity Score (0-100)
    let contributorDiversityScore = 0
    if (contributors.length > 0) {
      const topContributorCommits = Math.max(...contributors.map(c => c.commitsCount))
      const totalCommits = commits.length
      const concentration = topContributorCommits / totalCommits
      
      // Lower concentration = higher diversity
      contributorDiversityScore = Math.max(0, 100 - (concentration * 100))
    }

    // Code Quality Score (0-100) - based on commit patterns
    let codeQualityScore = 70 // Base score
    
    // Bonus for test-related commits
    const testCommits = commits.filter(c => 
      c.message.toLowerCase().includes('test') || 
      c.message.toLowerCase().includes('spec')
    )
    if (testCommits.length > commits.length * 0.1) {
      codeQualityScore += 10
    }

    // Penalty for frequent "revert" commits
    const revertCommits = commits.filter(c => 
      c.message.toLowerCase().includes('revert')
    )
    if (revertCommits.length > commits.length * 0.05) {
      codeQualityScore -= 15
    }

    codeQualityScore = Math.max(0, Math.min(100, codeQualityScore))

    // Maintenance Score (0-100)
    let maintenanceScore = 0
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const recentCommits = commits.filter(c => new Date(c.authorDate) >= ninetyDaysAgo)
    
    if (recentCommits.length > 0) {
      maintenanceScore = Math.min(100, (recentCommits.length / commits.length) * 100)
    }

    // Bonus for good bug fix rate
    if (metrics.bugFixRate > 0.1) {
      maintenanceScore += 10
    }

    maintenanceScore = Math.max(0, Math.min(100, maintenanceScore))

    return {
      activity: Math.round(activityScore),
      contributorDiversity: Math.round(contributorDiversityScore),
      codeQuality: Math.round(codeQualityScore),
      maintenance: Math.round(maintenanceScore),
    }
  }

  /**
   * Calculates the overall health score.
   * @private
   * @param {any} breakdown - The breakdown of the health score.
   * @returns {number} The overall health score.
   */
  private calculateOverallScore(breakdown: any): number {
    const weights = {
      activity: 0.3,
      contributorDiversity: 0.2,
      codeQuality: 0.3,
      maintenance: 0.2,
    }

    const overall = 
      (breakdown.activity * weights.activity) +
      (breakdown.contributorDiversity * weights.contributorDiversity) +
      (breakdown.codeQuality * weights.codeQuality) +
      (breakdown.maintenance * weights.maintenance)

    return Math.round(overall)
  }

  /**
   * Generates recommendations for improving the health score.
   * @private
   * @param {any} breakdown - The breakdown of the health score.
   * @param {any} metrics - The health metrics.
   * @returns {string[]} An array of recommendations.
   */
  private generateRecommendations(breakdown: any, metrics: any): string[] {
    const recommendations: string[] = []

    if (breakdown.activity < 50) {
      recommendations.push("Increase commit frequency to maintain project momentum")
    }

    if (breakdown.contributorDiversity < 40) {
      recommendations.push("Encourage more contributors to reduce dependency on key developers")
    }

    if (breakdown.codeQuality < 60) {
      recommendations.push("Improve code quality practices: add more tests and reduce reverts")
    }

    if (breakdown.maintenance < 50) {
      recommendations.push("Focus on maintenance: address issues and keep dependencies updated")
    }

    if (metrics.bugFixRate < 0.05) {
      recommendations.push("Consider implementing more rigorous testing to catch bugs earlier")
    }

    if (metrics.activeContributors < 2) {
      recommendations.push("Grow the contributor base through better documentation and onboarding")
    }

    // Always provide at least one recommendation
    if (recommendations.length === 0) {
      recommendations.push("Project health looks good! Continue current practices")
    }

    return recommendations
  }

  /**
   * Calculates the average response time to fix issues.
   * @private
   * @param {any[]} fixCommits - The commits that are bug fixes.
   * @returns {number} The average response time (in days).
   */
  private calculateAverageResponseTime(fixCommits: any[]): number {
    // Simplified calculation - in reality would analyze issue-to-fix time
    if (fixCommits.length === 0) return 0

    // Estimate based on commit patterns
    const avgDaysBetweenFixes = 7 // Placeholder
    return avgDaysBetweenFixes
  }
}

/**
 * An instance of the HealthScoringService.
 * @type {HealthScoringService}
 */
export const healthScoringService = new HealthScoringService()