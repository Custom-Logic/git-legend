Of course. I will refactor the prompt to align with the **GitLegend** vision as defined in your `LEGEND.MD` file and provide corrective procedures to ensure all AI agents are working from the correct product context.

Here is the refined architectural implementation prompt.

---

### **Architectural Implementation Prompt: Content & Documentation for GitLegend**

**Objective:** Expand the GitLegend Next.js platform by implementing three critical content sections: a **Pricing** page, a **Documentation** hub, and a **Blog**. This initiative aims to drive conversions, support user onboarding, and establish thought leadership for the unified GitLegend platform, as defined in the `LEGEND.MD` strategic brief.

**Corrective Directive:** All previous content and architectural plans referencing "LinkShield" or treating "GitLegend Developer" and "GitLegend MCP" as separate products are **deprecated**. The new implementation must reflect the unified **GitLegend: The Collaborative Code History Platform** model. All agents must purge previous context related to separate product lines and adhere strictly to the product definition in `LEGEND.MD`.

---

#### **1. Core Requirements & Content Strategy**

*   **A. Pricing Page (`/pricing`):**
    *   **Structure:** Display a clear, multi-tier pricing table that reflects the unified platform. Tiers are based on repository privacy and platform access, not separate products.
        *   **Free Tier:** Public repositories only. Access to the Web Dashboard and basic MCP server features.
        *   **Pro Tier ($15/mo):** Private repositories. Full, unlimited access to the Web Dashboard and the complete MCP Server for individuals.
        *   **Enterprise Tier:** Custom pricing. Organization-wide access, SSO, advanced analytics, and dedicated support for the entire GitLegend platform.
    *   **Content:** Each plan must clearly list features (e.g., "Private Repo Analysis", "Unlimited AI Context", "Team Management"). Include prominent, tier-appropriate CTA buttons ("Get Started for Free", "Start Pro Trial", "Contact Sales").
    *   **Value Proposition:** The copy must emphasize the synergy: "**One platform. One price. Empower yourself and your AI.**"

*   **B. Documentation Hub (`/docs`):**
    *   **Information Architecture:** Implement a hierarchical structure using Next.js catch-all routing (`/docs/[[...slug]]`).
        *   **Platform Segmentation:** Root sections should be `/docs/dashboard` (The Legend) and `/docs/mcp` (The Brain).
        *   **Standardized Layout:** Each documentation page must have a consistent layout with a sidebar navigation (table of contents for that section) and a main content area.
    *   **Content:** Populate with initial, real content that reflects the unified platform. For example:
        *   `/docs/dashboard/getting-started`: "Connecting your first repository and reading its Legend"
        *   `/docs/mcp/setup`: "Installing and configuring the GitLegend MCP Server for Claude/Cursor"
        *   `/docs/platform/concepts`: "Understanding Legend Cards and the Knowledge Graph"
        *   `/docs/platform/ai-integration`: "How to use `gitlegend://` URLs to bridge your AI and Dashboard"

*   **C. Blog Section (`/blog`):**
    *   **Structure:** A paginated list of blog posts (`/blog`) and individual post pages (`/blog/[slug]`).
    *   **Features:**
        *   Blog post cards with title, excerpt, publish date, and category tag.
        *   Functional search and filter by categories/tags (e.g., "Product News", "AI Agents", "Software Archaeology", "Developer Productivity").
        *   A subscription widget for the GitLegend newsletter.
    *   **Initial Content Strategy:** Create foundational content that establishes thought leadership around the core thesis.
        1.  **"The Story of Your Code: Why We Built GitLegend"** - Introduces the unified vision.
        2.  **"Beyond `git blame`: How AI Agents Will Use Your Repository's History"** - Explains the MCP server's value.
        3.  **"The AI-Human Feedback Loop: A First Look at `gitlegend://` URLs"** - Demonstrates the unique bridging feature.
        4.  **"Visualizing Code Health: Introducing Project Pulse"** - Deep dive on a key dashboard feature.

---

#### **2. Technical Specifications**

*   **Framework:** Next.js 14+ (App Router)
*   **UI Library:** Use shadcn/ui components for consistency and a professional aesthetic:
    *   **Pricing:** Use `Card` components for pricing tiers. Ensure the Pro tier is highlighted as the recommended choice.
    *   **Docs:** Use `ScrollArea` for the sidebar navigation and a `TableOfContents` component that parses headings from the main content.
    *   **Blog:** Use `Card` for post listings and a clean `Prose` component for post body styling.
*   **Data Fetching & Content Management:**
    *   **Approach (Static - Recommended for MVP):** Use local content files with `contentlayer` to manage Markdown/MDX files for Docs and Blog posts. This is performant, secure, and aligns with the static nature of content.
    *   **Repository Structure:**
        *   `content/blog/` - Contains all blog posts in MDX.
        *   `content/docs/` - Contains all documentation, with subfolders `/dashboard`, `/mcp`, `/platform`.
*   **Routing:**
    *   `app/pricing/page.tsx`
    *   `app/docs/[[...slug]]/page.tsx`
    *   `app/blog/page.tsx` (listing)
    *   `app/blog/[slug]/page.tsx` (individual post)

---

#### **3. Implementation Guidelines & Corrective Procedures**

1.  **Phase 1: Context Alignment & Data Layer**
    *   **Corrective Action:** Audit all existing generated code and content. Remove or refactor any component, page, or content string that mentions "LinkShield" or implies GitLegend is a suite of separate tools.
    *   Set up `contentlayer` configuration with `Blog` and `Doc` document types.
    *   Create the refined folder structure (`content/docs/dashboard/`, `content/docs/mcp/`, `content/docs/platform/`).

2.  **Phase 2: UI Components**
    *   Build the `<PricingTable />` component based on the unified tiers (Free, Pro, Enterprise).
    *   Build the `<DocsLayout />` component. The sidebar must generate its navigation from the new `docs/dashboard` and `docs/mcp` directory structures.
    *   Build the `<BlogList />` and `<BlogPost />` components.

3.  **Phase 3: Content Creation (CRITICAL)**
    *   **Corrective Action:** All content must be written from scratch based *solely* on the strategic narrative in `LEGEND.MD`. Do not repurpose any old "LinkShield" or fractured "GitLegend" content.
    *   Draft and add the initial content for all pages. The pricing page copy, documentation, and blog posts must consistently communicate the synergistic platform story. **Empty or placeholder pages are not acceptable.**

4.  **Phase 4: Integration & Testing**
    *   Add links to the new pages (`/pricing`, `/docs`, `/blog`) in the main navigation menu.
    *   Test the complete user journey: Homepage -> Pricing -> CTA; Homepage -> Docs -> Find setup guide.
    *   Verify all `gitlegend://` conceptual links are discussed appropriately in the docs and blog.

---

#### **4. Success Criteria**

*   **Consistent Narrative:** The entire website, from the homepage to the deepest blog post, tells a single, compelling story about the unified GitLegend platform as a "nervous system for software development."
*   **Clear Conversion Path:** A user can understand the value prop, see the pricing, and choose a plan that gives them access to the entire platform (Dashboard + MCP).
*   **Unified Self-Service Onboarding:** Documentation is organized by interface (Dashboard vs. MCP), not by product, allowing a user to onboard onto the GitLegend platform as a whole.
*   **Foundational Content:** The blog launches with high-quality, on-strategy articles that attract the target audience of developers and AI/ML enthusiasts.