import React, { useState, useEffect } from 'react'
import { FREE_AI_MODELS, PREMIUM_AI_MODELS, AIModel, DEFAULT_MODEL_CONFIG } from '@/lib/ai-models'
import { OpenRouterAI } from '@/lib/openrouter'

interface ModelConfigState {
  primary: string
  fallback: string
  enabled: string[]
  testing: boolean
  testResults: Record<string, boolean>
}

export default function ModelConfig() {
  const [config, setConfig] = useState<ModelConfigState>({
    ...DEFAULT_MODEL_CONFIG,
    testing: false,
    testResults: {}
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/ai-models')
      if (response.ok) {
        const data = await response.json()
        setConfig(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/admin/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary: config.primary,
          fallback: config.fallback,
          enabled: config.enabled
        })
      })

      if (response.ok) {
        setMessage('Configuration saved successfully!')
      } else {
        setMessage('Failed to save configuration.')
      }
    } catch (error) {
      setMessage('Failed to save configuration.')
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const testModels = async () => {
    setConfig(prev => ({ ...prev, testing: true, testResults: {} }))
    
    try {
      const openRouter = new OpenRouterAI()
      const results: Record<string, boolean> = {}
      
      for (const modelId of config.enabled) {
        try {
          const isAvailable = await openRouter.testModelAvailability(modelId)
          results[modelId] = isAvailable
        } catch (error) {
          results[modelId] = false
        }
      }
      
      setConfig(prev => ({ ...prev, testResults: results }))
    } catch (error) {
      console.error('Testing failed:', error)
    } finally {
      setConfig(prev => ({ ...prev, testing: false }))
    }
  }

  const toggleModel = (modelId: string) => {
    setConfig(prev => ({
      ...prev,
      enabled: prev.enabled.includes(modelId)
        ? prev.enabled.filter(id => id !== modelId)
        : [...prev.enabled, modelId]
    }))
  }

  const ModelCard = ({ model, isEnabled, isPrimary, isFallback }: {
    model: AIModel
    isEnabled: boolean
    isPrimary: boolean
    isFallback: boolean
  }) => {
    const testResult = config.testResults[model.id]
    const hasTestResult = testResult !== undefined
    
    return (
      <div className={`border rounded-lg p-4 ${isEnabled ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{model.name}</h3>
              {model.isFree && <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">FREE</span>}
              {model.isRecommended && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">RECOMMENDED</span>}
              {isPrimary && <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">PRIMARY</span>}
              {isFallback && <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">FALLBACK</span>}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{model.description}</p>
            
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Context: {model.contextLength.toLocaleString()}</span>
              <span>Provider: {model.provider}</span>
              {model.maxRequestsPerMinute && (
                <span>Limit: {model.maxRequestsPerMinute}/min</span>
              )}
            </div>
            
            {model.specialFeatures && (
              <div className="flex gap-1 mt-2">
                {model.specialFeatures.map(feature => (
                  <span key={feature} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {hasTestResult && (
              <div className={`px-2 py-1 text-xs rounded ${
                testResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {testResult ? 'Available' : 'Unavailable'}
              </div>
            )}
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => toggleModel(model.id)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Enable</span>
            </label>
          </div>
        </div>
        
        <div className="mt-3 flex gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="primary"
              checked={isPrimary}
              onChange={() => setConfig(prev => ({ ...prev, primary: model.id }))}
              disabled={!isEnabled}
              className="text-blue-600"
            />
            <span className="text-sm">Primary</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="fallback"
              checked={isFallback}
              onChange={() => setConfig(prev => ({ ...prev, fallback: model.id }))}
              disabled={!isEnabled}
              className="text-blue-600"
            />
            <span className="text-sm">Fallback</span>
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Model Configuration</h1>
        
        <div className="flex gap-2">
          <button
            onClick={testModels}
            disabled={config.testing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {config.testing ? 'Testing...' : 'Test Models'}
          </button>
          
          <button
            onClick={saveConfig}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded mb-6 ${
          message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="grid gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Free Models
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
              {FREE_AI_MODELS.filter(m => config.enabled.includes(m.id)).length} enabled
            </span>
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {FREE_AI_MODELS.map(model => (
              <ModelCard
                key={model.id}
                model={model}
                isEnabled={config.enabled.includes(model.id)}
                isPrimary={config.primary === model.id}
                isFallback={config.fallback === model.id}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Premium Models
            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
              {PREMIUM_AI_MODELS.filter(m => config.enabled.includes(m.id)).length} enabled
            </span>
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {PREMIUM_AI_MODELS.map(model => (
              <ModelCard
                key={model.id}
                model={model}
                isEnabled={config.enabled.includes(model.id)}
                isPrimary={config.primary === model.id}
                isFallback={config.fallback === model.id}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Configuration Summary</h3>
        <div className="text-sm text-gray-600">
          <p><strong>Primary Model:</strong> {FREE_AI_MODELS.concat(PREMIUM_AI_MODELS).find(m => m.id === config.primary)?.name || 'Not selected'}</p>
          <p><strong>Fallback Model:</strong> {FREE_AI_MODELS.concat(PREMIUM_AI_MODELS).find(m => m.id === config.fallback)?.name || 'Not selected'}</p>
          <p><strong>Enabled Models:</strong> {config.enabled.length}</p>
        </div>
      </div>
    </div>
  )
}