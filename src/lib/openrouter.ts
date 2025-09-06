import { AIModel, getModelById, DEFAULT_MODEL_CONFIG } from './ai-models'

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
  error?: {
    message: string
    type: string
    code: number
  }
}

interface ModelConfig {
  primary: string
  fallback: string
  enabled: string[]
  maxRetries?: number
  retryDelay?: number
}

export class OpenRouterAI {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'
  private config: ModelConfig
  
  constructor(apiKey?: string, config?: Partial<ModelConfig>) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required')
    }
    
    this.config = {
      ...DEFAULT_MODEL_CONFIG,
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    }
  }

  async generateCommitSummary(
    commitMessage: string,
    filesChanged: number,
    additions: number,
    deletions: number,
    preferredModel?: string
  ): Promise<{ summary: string | null; modelUsed: string | null }> {
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

    // Try models in order: preferred -> primary -> fallback -> enabled models
    const modelsToTry = [
      ...(preferredModel ? [preferredModel] : []),
      this.config.primary,
      this.config.fallback,
      ...this.config.enabled.filter(id => id !== this.config.primary && id !== this.config.fallback)
    ].filter((model, index, arr) => arr.indexOf(model) === index) // Remove duplicates

    for (const modelId of modelsToTry) {
      const result = await this.tryGenerateWithModel(messages, modelId)
      if (result.success) {
        return { summary: result.content, modelUsed: modelId }
      }
      
      console.warn(`Model ${modelId} failed:`, result.error)
    }

    return { summary: null, modelUsed: null }
  }

  private async tryGenerateWithModel(
    messages: OpenRouterMessage[], 
    modelId: string
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    const model = getModelById(modelId)
    if (!model) {
      return { success: false, error: `Model ${modelId} not found in configuration` }
    }

    for (let attempt = 1; attempt <= (this.config.maxRetries || 3); attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'GitLegend Analysis'
          },
          body: JSON.stringify({
            model: modelId,
            messages,
            temperature: 0.7,
            max_tokens: 150,
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          
          // Handle rate limiting
          if (response.status === 429) {
            if (attempt < (this.config.maxRetries || 3)) {
              await this.delay((this.config.retryDelay || 1000) * attempt)
              continue
            }
          }
          
          return { 
            success: false, 
            error: `HTTP ${response.status}: ${errorText}` 
          }
        }

        const data: OpenRouterResponse = await response.json()
        
        if (data.error) {
          return { 
            success: false, 
            error: `API Error: ${data.error.message}` 
          }
        }

        const content = data.choices[0]?.message?.content?.trim()
        if (content) {
          return { success: true, content }
        }

        return { success: false, error: 'No content in response' }

      } catch (error) {
        if (attempt < (this.config.maxRetries || 3)) {
          await this.delay((this.config.retryDelay || 1000) * attempt)
          continue
        }
        
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    }

    return { success: false, error: 'Max retries exceeded' }
  }

  async batchGenerateSummaries(
    commits: Array<{
      sha: string
      message: string
      filesChanged: number
      additions: number
      deletions: number
    }>,
    preferredModel?: string
  ): Promise<Array<{ sha: string; summary: string | null; modelUsed: string | null }>> {
    const results: Array<{ sha: string; summary: string | null; modelUsed: string | null }> = []
    
    // Process in small batches to avoid rate limits
    const batchSize = 3 // Reduced for free models
    for (let i = 0; i < commits.length; i += batchSize) {
      const batch = commits.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (commit) => {
        const result = await this.generateCommitSummary(
          commit.message,
          commit.filesChanged,
          commit.additions,
          commit.deletions,
          preferredModel
        )
        return { 
          sha: commit.sha, 
          summary: result.summary,
          modelUsed: result.modelUsed
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < commits.length) {
        await this.delay(2000) // 2 second delay for free models
      }
    }
    
    return results
  }

  async testModelAvailability(modelId: string): Promise<boolean> {
    try {
      const result = await this.tryGenerateWithModel(
        [{ role: 'user', content: 'Hello' }], 
        modelId
      )
      return result.success
    } catch {
      return false
    }
  }

  async getAvailableModels(): Promise<string[]> {
    const available: string[] = []
    
    for (const modelId of this.config.enabled) {
      if (await this.testModelAvailability(modelId)) {
        available.push(modelId)
      }
    }
    
    return available
  }

  updateConfig(newConfig: Partial<ModelConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): ModelConfig {
    return { ...this.config }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}