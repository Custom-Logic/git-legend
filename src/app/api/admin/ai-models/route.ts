import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { validateModelConfig } from "@/lib/ai-models"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (implement your admin check logic)
    const user = await db.user.findUnique({
      where: { email: session.user.email ?? undefined }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get current AI model configuration
    const config = await db.aiModelConfig.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!config) {
      // Return default configuration
      return NextResponse.json({
        primary: "deepseek/deepseek-r1:free",
        fallback: "deepseek/deepseek-chat:free",
        enabled: [
          "deepseek/deepseek-r1:free",
          "deepseek/deepseek-chat:free",
          "moonshot/moonshot-v1-8k:free",
          "google/gemma-2-9b-it:free",
          "meta-llama/llama-3.1-8b-instruct:free"
        ]
      })
    }

    return NextResponse.json({
      primary: config.primaryModel,
      fallback: config.fallbackModel,
      enabled: config.enabledModels
    })

  } catch (error) {
    console.error("Error fetching AI model config:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { email: session.user.email ?? undefined }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { primary, fallback, enabled } = await request.json()

    // Validate the configuration
    if (!primary || !fallback || !Array.isArray(enabled)) {
      return NextResponse.json(
        { error: "Invalid configuration format" },
        { status: 400 }
      )
    }

    // Validate model IDs
    const { valid, invalid } = validateModelConfig([primary, fallback, ...enabled])
    
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Invalid model IDs: ${invalid.join(', ')}` },
        { status: 400 }
      )
    }

    // Ensure primary and fallback are in enabled list
    if (!enabled.includes(primary)) {
      return NextResponse.json(
        { error: "Primary model must be in enabled models list" },
        { status: 400 }
      )
    }

    if (!enabled.includes(fallback)) {
      return NextResponse.json(
        { error: "Fallback model must be in enabled models list" },
        { status: 400 }
      )
    }

    // Save the configuration
    await db.aiModelConfig.create({
      data: {
        primaryModel: primary,
        fallbackModel: fallback,
        enabledModels: enabled,
        updatedBy: user.id
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error saving AI model config:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}