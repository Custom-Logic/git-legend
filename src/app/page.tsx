
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, GitBranch, BrainCircuit } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent pb-2">
          Understand Your Past. Build Your Future.
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mt-4">
          GitLegend is a suite of tools for developers and AI agents to unlock the rich history and context of your codebase.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg">
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Split Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* GitLegend Developer */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-500/50">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">GitLegend Developer</CardTitle>
                  <CardDescription>For Developers & Teams</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Advanced Git visualization, repository analytics, and team collaboration tools to help you understand your codebase like never before.
              </p>
              <Link href="/developer">
                <Button variant="outline" className="w-full">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* GitLegend MCP */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:purple-500/50">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">GitLegend MCP</CardTitle>
                  <CardDescription>For AI Engineers & Agents</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                A high-performance Model Context Protocol (MCP) server providing AI agents with structured access to git history, semantics, and repository analysis.
              </p>
              <Link href="/mcp">
                <Button variant="outline" className="w-full">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
