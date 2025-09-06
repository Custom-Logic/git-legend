# Gemini Project Context: GitLegend

## 1. Core Concept & Vision

**GitLegend** is a platform to understand and narrate the history of a software project. Its vision is to be the "nervous system for software development," connecting the past (git history) to the future (AI-assisted development).

The core thesis is that the best way to understand a codebase is through its story, and GitLegend provides this story in two synergistic ways:
1.  **For Humans:** A visual, narrative web dashboard.
2.  **For AI Agents:** A high-speed, structured data API (the MCP Server).

## 2. Core Architecture: The Unified Knowledge Graph

The entire platform is built upon a **Unified Knowledge Graph**. This is the project's primary defensible moat.

- It processes git history, commits, files, and contributor data into a rich, queryable graph.
- All features, both human-facing and AI-facing, are powered by this single source of truth.
- The database schema is managed with Prisma (`prisma/schema.prisma`).

## 3. Key Components & Features

### a. Human-Facing: The Web Dashboard ("The Legend")

This is the primary user-facing application, built with Next.js and TypeScript.

- **Interactive Timeline:** The main visual narrative of the project's history.
- **Legend Card:** The core UI component for a significant commit. It includes:
    - An AI-generated summary of the change's "what" and "why".
    - Clean, visual code diffs.
- **MCP Context Button:** A key feature that generates a `gitlegend://` URL. This acts as a bridge, allowing a user to pass specific historical context from the dashboard directly to their AI assistant.

### b. AI-Agent-Facing: The MCP Server ("The Brain")

This is the backend service that provides historical context to AI agents.

- **API Resources:** Exposes tools for AI, such as `/biography` (contributor history), `/intel` (codebase structure), and `diagnose_bug_origin`.
- **Enables AI Features:** Allows AI assistants to perform "Contextual Code Reviews" (e.g., referencing past refactors) and "Intelligent Onboarding" for new developers.

### c. The Bridge: Human-AI Synergy

The platform's unique value comes from the seamless interaction between the human and AI interfaces.

- **AI-Human Handoff:** AI responses can include `gitlegend://` links, allowing developers to click and view the exact historical context in the web dashboard for verification.
- **Human-AI Handoff:** A developer can copy a `gitlegend://` link from a Legend Card and paste it into a chat with an AI to provide immediate, rich context for a query.

## 4. Technology Stack

- **Framework:** Next.js (App Router) with TypeScript.
- **Backend:** Node.js server, as part of the Next.js application (`server.ts`).
- **Frontend:** React, using components from `src/components/ui` (likely shadcn/ui) and a visualization library (planned: D3.js) for the timeline.
- **Database:** A database managed by Prisma ORM (see `prisma/schema.prisma`).
- **AI/ML:** AI models (likely transformer-based) are used to generate summaries for "Legend Cards".

## 5. Development & Strategy

- **Launch Strategy:** The go-to-market plan is to launch the visually appealing web dashboard first to gain viral traction in the open-source community.
- **Follow-up:** The MCP server will be introduced as a "power-up" to this established user base, creating a strong, synergistic product offering.
