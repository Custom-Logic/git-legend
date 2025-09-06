interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class OpenRouterAI {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required')
    }
  }

  async generateCommitSummary(
    commitMessage: string,
    filesChanged: number,
    additions: number,
    deletions: number
  ): Promise<string | null> {
    try {
      const messages: OpenRouterMessage[] = [
        {
          role: "system",
          content: "You are an expert software engineer who analyzes git commits and provides clear, concise summaries. Focus on the 'why' behind the change, not just the 'what'. Keep summaries to 1-2 sentences maximum."
        },
        {
          role: "user",
          content: `Summarize this git commit for a technical audience:\n\nCommit Message: ${commitMessage}\n\nFiles Changed: ${filesChanged}\nAdditions: ${additions}\nDeletions: ${deletions}`
        }
      ]

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'GitLegend Analysis'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 150,
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenRouter API error:', response.status, errorText)
        return null
      }

      const data: OpenRouterResponse = await response.json()
      return data.choices[0]?.message?.content?.trim() || null
    } catch (error) {
      console.error('Error generating commit summary:', error)
      return null
    }
  }

  async batchGenerateSummaries(commits: Array<{
    sha: string
    message: string
    filesChanged: number
    additions: number
    deletions: number
  }>): Promise<Array<{ sha: string; summary: string | null }>> {
    const results: Array<{ sha: string; summary: string | null }> = []
    
    // Process in small batches to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < commits.length; i += batchSize) {
      const batch = commits.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (commit) => {
        const summary = await this.generateCommitSummary(
          commit.message,
          commit.filesChanged,
          commit.additions,
          commit.deletions
        )
        return { sha: commit.sha, summary }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < commits.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }
}