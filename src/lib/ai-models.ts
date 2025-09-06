/**
 * @file Defines the AI models available in the application and provides functions for accessing them.
 * @exports AIModel
 * @exports FREE_AI_MODELS
 * @exports PREMIUM_AI_MODELS
 * @exports ALL_MODELS
 * @exports DEFAULT_MODEL_CONFIG
 * @exports getModelById
 * @exports getFreeModels
 * @exports getRecommendedFreeModels
 * @exports validateModelConfig
 */

/**
 * Represents an AI model with its properties.
 * @interface
 */
export interface AIModel {
  /** The unique identifier for the model. */
  id: string
  /** The name of the model. */
  name: string
  /** The provider of the model. */
  provider: string
  /** A description of the model. */
  description: string
  /** The maximum context length for the model. */
  contextLength: number
  /** The input pricing per 1 million tokens. */
  inputPricing: number
  /** The output pricing per 1 million tokens. */
  outputPricing: number
  /** A flag indicating if the model is free. */
  isFree: boolean
  /** A flag indicating if the model is recommended. */
  isRecommended: boolean
  /** The maximum number of requests per minute. */
  maxRequestsPerMinute?: number
  /** An array of special features of the model. */
  specialFeatures?: string[]
}

/**
 * An array of free AI models.
 * @type {AIModel[]}
 */
export const FREE_AI_MODELS: AIModel[] = [
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1 (Free)",
    provider: "DeepSeek",
    description: "671B parameter model with 37B active. Performance on par with OpenAI o1, fully open-source with reasoning tokens.",
    contextLength: 64000,
    inputPricing: 0,
    outputPricing: 0,
    isFree: true,
    isRecommended: true,
    maxRequestsPerMinute: 20,
    specialFeatures: ["reasoning", "open-source", "large-context"]
  },
  {
    id: "deepseek/deepseek-chat:free",
    name: "DeepSeek V3 (Free)",
    provider: "DeepSeek",
    description: "Latest DeepSeek model with excellent instruction following and coding abilities. Pre-trained on 15 trillion tokens.",
    contextLength: 64000,
    inputPricing: 0,
    outputPricing: 0,
    isFree: true,
    isRecommended: true,
    maxRequestsPerMinute: 30,
    specialFeatures: ["coding", "instruction-following", "multilingual"]
  },
  {
    id: "moonshot/moonshot-v1-8k:free",
    name: "Moonshot V1 8K (Free)",
    provider: "Moonshot AI",
    description: "High-quality Chinese model with strong reasoning capabilities and multilingual support.",
    contextLength: 8192,
    inputPricing: 0,
    outputPricing: 0,
    isFree: true,
    isRecommended: true,
    maxRequestsPerMinute: 25,
    specialFeatures: ["chinese", "reasoning", "multilingual"]
  },
  {
    id: "google/gemma-2-9b-it:free",
    name: "Gemma 2 9B IT (Free)",
    provider: "Google",
    description: "Google's instruction-tuned model with excellent performance for coding and creative tasks.",
    contextLength: 8192,
    inputPricing: 0,
    outputPricing: 0,
    isFree: true,
    isRecommended: false,
    maxRequestsPerMinute: 30,
    specialFeatures: ["instruction-tuned", "creative", "coding"]
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct:free",
    name: "Llama 3.1 8B Instruct (Free)",
    provider: "Meta",
    description: "Meta's latest open-source model with strong general capabilities and multilingual support.",
    contextLength: 128000,
    inputPricing: 0,
    outputPricing: 0,
    isFree: true,
    isRecommended: false,
    maxRequestsPerMinute: 30,
    specialFeatures: ["open-source", "large-context", "multilingual"]
  },
  {
    id: "microsoft/phi-3-medium-128k-instruct:free",
    name: "Phi-3 Medium 128K (Free)",
    provider: "Microsoft",
    description: "Compact but powerful model with very large context window, excellent for analysis tasks.",
    contextLength: 128000,
    inputPricing: 0,
    outputPricing: 0,
    isFree: true,
    isRecommended: false,
    maxRequestsPerMinute: 25,
    specialFeatures: ["large-context", "compact", "analysis"]
  },
  {
    id: "qwen/qwq-32b-preview:free",
    name: "QwQ 32B Preview (Free)",
    provider: "Qwen",
    description: "Reasoning-focused model with excellent problem-solving capabilities.",
    contextLength: 32000,
    inputPricing: 0,
    outputPricing: 0,
    isFree: true,
    isRecommended: false,
    maxRequestsPerMinute: 20,
    specialFeatures: ["reasoning", "problem-solving", "preview"]
  }
]

/**
 * An array of premium AI models.
 * @type {AIModel[]}
 */
export const PREMIUM_AI_MODELS: AIModel[] = [
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Cost-effective version of GPT-4o with excellent performance for most tasks.",
    contextLength: 128000,
    inputPricing: 0.15,
    outputPricing: 0.6,
    isFree: false,
    isRecommended: true,
    specialFeatures: ["cost-effective", "versatile", "large-context"]
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    description: "Fast and cost-effective Claude model for quick analysis and summaries.",
    contextLength: 200000,
    inputPricing: 0.25,
    outputPricing: 1.25,
    isFree: false,
    isRecommended: true,
    specialFeatures: ["fast", "analysis", "summarization"]
  }
]

/**
 * An array of all AI models, both free and premium.
 * @type {AIModel[]}
 */
export const ALL_MODELS = [...FREE_AI_MODELS, ...PREMIUM_AI_MODELS]

/**
 * The default model configuration.
 * @property {string} primary - The primary model to use.
 * @property {string} fallback - The fallback model to use.
 * @property {string[]} enabled - An array of enabled model IDs.
 */
export const DEFAULT_MODEL_CONFIG = {
  primary: "deepseek/deepseek-r1:free",
  fallback: "deepseek/deepseek-chat:free",
  enabled: FREE_AI_MODELS.slice(0, 5).map(m => m.id)
}

/**
 * Retrieves an AI model by its ID.
 * @param {string} modelId - The ID of the model to retrieve.
 * @returns {AIModel | undefined} The model with the specified ID, or undefined if not found.
 */
export function getModelById(modelId: string): AIModel | undefined {
  return ALL_MODELS.find(model => model.id === modelId)
}

/**
 * Retrieves all free AI models.
 * @returns {AIModel[]} An array of free AI models.
 */
export function getFreeModels(): AIModel[] {
  return ALL_MODELS.filter(model => model.isFree)
}

/**
 * Retrieves all recommended free AI models.
 * @returns {AIModel[]} An array of recommended free AI models.
 */
export function getRecommendedFreeModels(): AIModel[] {
  return ALL_MODELS.filter(model => model.isFree && model.isRecommended)
}

/**
 * Validates a list of model IDs.
 * @param {string[]} modelIds - The list of model IDs to validate.
 * @returns {{valid: string[], invalid: string[]}} An object containing two arrays: one with valid model IDs and one with invalid model IDs.
 */
export function validateModelConfig(modelIds: string[]): { valid: string[], invalid: string[] } {
  const valid = modelIds.filter(id => getModelById(id) !== undefined)
  const invalid = modelIds.filter(id => getModelById(id) === undefined)
  return { valid, invalid }
}