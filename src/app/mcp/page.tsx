"use client"
// src/app/mcp/page.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowRight, 
  Github, 
  Sparkles, 
  Users, 
  History, 
  Share2, 
  Brain,
  Code,
  Zap,
  Shield,
  Globe,
  Copy,
  ExternalLink,
  Terminal,
  Wand2,
  Bot,
  Cpu,
  Key,
  BookOpen
} from "lucide-react"
import Link from "next/link"

export default function McpPage() {
  const [copiedMcpUrl, setCopiedMcpUrl] = useState(false)

  const mcpServerUrl = "https://api.gitlegend.com/mcp"
  const mcpApiKey = "gl_your_api_key_here"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedMcpUrl(true)
    setTimeout(() => setCopiedMcpUrl(false), 2000)
  }

  const integrationGuides = [
    {
      id: "claude",
      name: "Claude",
      icon: <Bot className="w-5 h-5" />,
      description: "Integrate GitLegend MCP with Claude AI assistant",
      setup: `
1. Open Claude AI assistant
2. Go to Settings → Integrations
3. Add MCP Server with URL: ${mcpServerUrl}
4. Add API Key in headers: Authorization: Bearer ${mcpApiKey}
5. Start using GitLegend commands with Claude`,
      example: `"Claude, analyze the architectural shifts in my repository using gitlegend://explain_architectural_shift"`,
      color: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
    },
    {
      id: "cursor",
      name: "Cursor",
      icon: <Cpu className="w-5 h-5" />,
      description: "Use GitLegend MCP in Cursor AI editor",
      setup: `
1. Open Cursor Editor
2. Go to Settings → AI → MCP Servers
3. Add new server:
   - Name: GitLegend
   - URL: ${mcpServerUrl}
4. Configure authentication:
   - Header: Authorization
   - Value: Bearer ${mcpApiKey}
5. Restart Cursor to apply changes`,
      example: `"@cursor, use gitlegend://biography to get repository overview"`,
      color: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
    },
    {
      id: "gemini",
      name: "Gemini",
      icon: <Brain className="w-5 h-5" />,
      description: "Connect GitLegend MCP with Google Gemini",
      setup: `
1. Access Gemini Advanced
2. Go to Extensions → MCP Integration
3. Configure GitLegend MCP:
   - Server URL: ${mcpServerUrl}
   - API Key: ${mcpApiKey}
4. Enable GitLegend tools
5. Start querying your repository history`,
      example: `"Gemini, use gitlegend://diagnose_bug_origin to find when this bug was introduced"`,
      color: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
    },
    {
      id: "codex",
      name: "GitHub Copilot",
      icon: <Code className="w-5 h-5" />,
      description: "Enhance Copilot with GitLegend context",
      setup: `
1. Install GitHub Copilot extension
2. Configure MCP settings in .copilot/config.json:
\`\`\`json
{
  "mcpServers": {
    "gitlegend": {
      "url": "${mcpServerUrl}",
      "headers": {
        "Authorization": "Bearer ${mcpApiKey}"
      }
    }
  }
}
\`\`\`
3. Restart your IDE
4. Copilot will now have GitLegend context`,
      example: `"// Ask Copilot: Review this PR using gitlegend://get_review_guidelines"`,
      color: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
    },
    {
      id: "custom",
      name: "Custom AI Agent",
      icon: <Terminal className="w-5 h-5" />,
      description: "Integrate with any custom AI agent",
      setup: `
1. Configure your AI agent to call MCP endpoints
2. Use the following base URL: ${mcpServerUrl}
3. Include authentication header:
   Authorization: Bearer ${mcpApiKey}
4. Available endpoints:
   - /mcp/biography
   - /mcp/intel
   - /mcp/diagnose_bug_origin
   - /mcp/explain_architectural_shift
   - /mcp/get_review_guidelines`,
      example: `POST /mcp/biography?repositoryId=repo_id`,
      color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
    }
  ]

  const mcpTools = [
    {
      name: "Repository Biography",
      endpoint: "/mcp/biography",
      description: "Get comprehensive repository overview and statistics",
      icon: <BookOpen className="w-5 h-5" />,
      useCase: "Perfect for project onboarding and understanding repository context"
    },
    {
      name: "Commit Intelligence",
      endpoint: "/mcp/intel",
      description: "Get detailed analysis of specific commits and their impact",
      icon: <Zap className="w-5 h-5" />,
      useCase: "Ideal for code reviews and understanding commit context"
    },
    {
      name: "Bug Diagnosis",
      endpoint: "/mcp/diagnose_bug_origin",
      description: "Identify potential commits that introduced bugs",
      icon: <Shield className="w-5 h-5" />,
      useCase: "Debugging and root cause analysis"
    },
    {
      name: "Architectural Analysis",
      endpoint: "/mcp/explain_architectural_shift",
      description: "Analyze major architectural changes and patterns",
      icon: <Globe className="w-5 h-5" />,
      useCase: "Understanding codebase evolution and architectural decisions"
    },
    {
      name: "Review Guidelines",
      endpoint: "/mcp/get_review_guidelines",
      description: "Generate context-aware code review guidelines",
      icon: <Wand2 className="w-5 h-5" />,
      useCase: "Improving code quality and review processes"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Brain className="w-4 h-4 mr-2" />
              AI-Powered Repository Intelligence
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              GitLegend MCP Server
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Transform your AI assistants with deep repository context. 
              Our MCP server provides AI agents with comprehensive git history analysis and insights.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signin">
              <Button size="lg" className="px-8 py-3 text-lg">
                <Github className="w-5 h-5 mr-2" />
                Get API Key
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              View Documentation
            </Button>
          </div>
        </div>
      </div>

      {/* MCP Server Info */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Key className="w-5 h-5" />
              <span>MCP Server Configuration</span>
            </CardTitle>
            <CardDescription>
              Connect your AI agents to the GitLegend MCP server using the configuration below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Server URL</label>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <span>{mcpServerUrl}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(mcpServerUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">API Key</label>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <span>{mcpApiKey}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(mcpApiKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {copiedMcpUrl && (
                <div className="text-sm text-green-600 dark:text-green-400 flex items-center space-x-1">
                  <Copy className="w-4 h-4" />
                  <span>Copied to clipboard!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MCP Tools Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful MCP Tools for AI Agents
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Our MCP server provides five specialized tools to give AI agents deep understanding of your repository
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mcpTools.map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    {tool.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {tool.endpoint}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">
                  {tool.description}
                </CardDescription>
                <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                  <strong>Use case:</strong> {tool.useCase}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Integration Guides */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Platform Integration Guides
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Learn how to integrate GitLegend MCP with your favorite AI platforms and tools
          </p>
        </div>

        <Tabs defaultValue="claude" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {integrationGuides.map((guide) => (
              <TabsTrigger key={guide.id} value={guide.id} className="flex items-center space-x-2">
                {guide.icon}
                <span className="hidden sm:inline">{guide.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {integrationGuides.map((guide) => (
            <TabsContent key={guide.id} value={guide.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${guide.color}`}>
                      {guide.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{guide.name} Integration</CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Terminal className="w-4 h-4" />
                      <span>Setup Instructions</span>
                    </h4>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                      {guide.setup}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Code className="w-4 h-4" />
                      <span>Usage Example</span>
                    </h4>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm italic">
                      {guide.example}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 pt-4">
                    <Button size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Documentation
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Config
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose GitLegend MCP?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Supercharge your AI assistants with deep repository intelligence and context
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">AI-First Design</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Built specifically for AI agents with structured data and context-aware responses
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Optimized queries and caching for sub-second response times even on large repositories
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                API key authentication and secure data handling for enterprise-grade security
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-lg">Universal Compatibility</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Works with any MCP-compatible AI agent or custom integration
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Ready to Supercharge Your AI?</CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Join thousands of developers who are enhancing their AI assistants with GitLegend MCP
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/signin">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                <Key className="w-5 h-5 mr-2" />
                Get Your API Key
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}