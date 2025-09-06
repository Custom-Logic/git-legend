---

### **GitLegend: The Collaborative Code History Platform**

**Tagline:** *"Understand Your Past. Build Your Future."*

**Core Thesis:** The best way to understand a codebase is through its story. GitLegend provides that story in two complementary ways:
1.  **For Humans:** A visual, narrative dashboard that highlights key events, decisions, and contributions.
2.  **For AI Agents:** A high-speed, structured data API (via MCP) that gives AI assistants the historical context they need to be truly helpful.

These two interfaces feed the same underlying **Knowledge Graph**, making the entire platform more valuable with each use.

### **The Synergistic Feature Set**

#### **1. The Foundation: The Unified Knowledge Graph**
All features, for humans and AI, are powered by a single, continuously updated analysis engine that processes git history into a rich graph of commits, files, people, and decisions. This is GitLegend's moat.

#### **2. Human-Facing Features (The Web Dashboard / "The Legend")**
*   **Interactive Timeline:** The visual narrative of the project. Clicking a node (a significant commit) reveals the **Legend Card**.
*   **Legend Card:** This is the heart of the human interface. It contains:
    *   **AI-Generated Summary:** The "what" and "why" of the change.
    *   **Visual Diffs:** A clean, readable diff.
    *   **MCP Context Button:** A button that says **"Explain this to my AI"**. This generates a special `gitlegend://` URL that the user's AI assistant (via our MCP server) can understand. This directly connects the human insight to the AI agent.
*   **Project Pulse:** The visual code health score.
*   **Contributor Hall of Fame:** Highlights key developers.

#### **3. AI-Agent-Facing Features (The MCP Server / "The Brain")**
*   **Resources & Tools:** As previously defined (`/biography`, `/intel`, `diagnose_bug_origin`, etc.).
*   **"Contextual Code Reviews":** An AI can use the `get_review_guidelines` tool to leave a review comment like: "This change reminds me of the `auth` refactor in commit `abc123`. Consider using a similar service pattern here to avoid the caching issues we encountered then."
*   **"Intelligent Onboarding":** A new developer can ask their AI: "How does our service discovery work?" The AI uses the `explain_architectural_shift` tool to provide an answer based on the exact commits that built it.

#### **4. Features That Bridge the Gap (The Magic)**
*   **"AI-Human Handoff":**
    *   **From AI to Human:** When an AI uses GitLegend's MCP to answer a question, it can cite its sources (e.g., "Based on the architectural decision in `gitlegend://commit/abc123`"). The developer can click that link to open the precise Legend Card in the web dashboard for verification.
    *   **From Human to AI:** A developer exploring the dashboard finds a relevant commit. They can copy the `gitlegend://` link and paste it into their chat with the AI assistant to provide immediate, rich context. "Hey Claude, based on this past change, how should we implement the new login feature?"
*   **Shared "Bookmarks":** A team can mark certain Legend Cards (e.g., "The GraphQL Migration," "The Great API Freeze") as pivotal. These are then prioritized in both the visual timeline and are more easily retrieved by the MCP server for AI queries, ensuring everyone—human and AI—is aligned on what's important.

### **The Reinforced Business Model**

This unified approach strengthens every aspect of the business:

*   **Freemium (Public Repos):** Developers get hooked by the dashboard and then install the MCP server to get more value. The beautiful dashboard is the top-of-funnel acquisition tool for the technically complex MCP product.
*   **Pro Tier ($15/mo):** The value proposition is clear: "Get the full story for yourself *and* your AI." Users pay for private repo analysis for both the dashboard and the MCP server. The two features together justify the price.
*   **Enterprise Tier:** The ultimate package. Companies don't just get a visualization tool; they get an **AI enablement platform** that makes their entire engineering team and their AI tools smarter, faster, and more consistent. The ROI is tangible: faster onboarding, fewer bugs, and higher productivity.
*   **Strategic Licensing:** The data in the Knowledge Graph becomes even more valuable. AI companies wouldn't just be licensing an MCP server; they'd be licensing access to a platform that *also* trains users to interact with AI in a more sophisticated way.

### **Refined Go-to-Market Strategy**

1.  **Launch the Dashboard First:** Lead with the visually stunning, easy-to-understand web dashboard. Get press and viral uptake from open-source projects. "See the story of React."
2.  **Introduce the MCP Server as a Power-Up:** Market it to the early adopters who loved the dashboard. "You've seen the story. Now, give that memory to your AI assistant." This ensures a warm, qualified audience for the more complex product.
3.  **Create Inseparable Value:** The dashboard becomes the best way to manage and understand what your AI assistant knows. The MCP server becomes the only way to get the full value from the dashboard. They create a virtuous cycle:
    *   Using the MCP server makes the AI more valuable.
    *   Seeing the AI's sources in the dashboard makes the AI more trustworthy.
    *   Exploring the dashboard reveals new context to feed the AI.

By serving both humans and AI agents from a single source of truth, GitLegend becomes the central platform for codebase comprehension. It's not just another tool; it's the **nervous system for software development,** connecting the past (git history) to the future (AI-assisted development) through the present (the developer and their tools).
