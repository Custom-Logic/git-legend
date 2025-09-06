### **Architectural Refactor Prompt: GitLegend Product Split & Navigation Implementation**

**Objective:** Refactor the monolithic GitLegend Next.js application into a multi-product platform with a clear information architecture and dedicated navigation, featuring both **GitLegend Developer** and **GitLegend MCP** as distinct product lines under a unified brand.

---

#### **1. Core Requirements**

*   **A. Product Structure:** Formalize a bifurcated product structure:
    *   **Product 1:** `GitLegend Developer` (Existing Core Product)
        *   **Audience:** Software developers, engineering managers.
        *   **Value Prop:** Advanced Git visualization, analytics, and team collaboration tools.
    *   **Product 2:** `GitLegend MCP` (New Product Line)
        *   **Audience:** AI engineers, researchers, "agentic coders".
        *   **Value Prop:** A high-performance Model Context Protocol (MCP) server providing AI agents with structured access to git history, semantics, and repository analysis.

*   **B. Page & Routing Architecture:** Implement a new route structure to support the product split.
    *   **`/`** (Homepage): Must be refactored to serve as a marketing landing page that equally promotes both products with clear value propositions and distinct call-to-actions for each.
    *   **`/developer`**: New page dedicated solely to the GitLegend Developer product, its features, use cases, and documentation.
    *   **`/mcp`**: New page dedicated solely to the GitLegend MCP product, its technical specifications, API, and integration guides.
    *   **`/blog`**, **`/pricing`**, **`/docs`**: Shared pages must be updated to contextually handle content for both products (e.g., filtered docs, product-specific pricing tiers).

*   **C. Navigation System:** Implement a primary navigation menu that provides clear access to both products and shared resources.
    *   A `Products` dropdown menu must be implemented in the main nav bar.
    *   **Dropdown Contents:**
        *   **Section: GitLegend Developer** (with icon and brief description)
        *   **Section: GitLegend MCP** (with icon and brief description)
        *   Links to respective product homepages (`/developer`, `/mcp`).
    *   The menu should be accessible, keyboard-navigable, and responsive.

---

#### **2. Technical Specifications**

*   **Framework:** Next.js 14+ (App Router)
*   **UI Library:** Refactor existing components using shadcn/ui for a consistent, accessible design system. Utilize its `DropdownMenu`, `NavigationMenu`, and `Button` components for the navigation implementation.
*   **State Management:** Leverage React hooks (`useState`, `useContext`) for UI state (e.g., mobile menu open/close). Avoid unnecessary external state libraries for this UI refactor.
*   **Data Fetching:** (Stretch) Consider modifying the Prisma schema to include a `product` or `category` field for blog posts, docs, and features to allow for filtering on shared pages.
*   **Styling:** Maintain a consistent global design system (CSS variables) while allowing for distinct visual themes for each product section (e.g., color accents) to reinforce product identity.

---

#### **3. Implementation Guidelines**

1.  **Phase 1: Routing & Layout**
    *   Create new page directories: `app/developer/page.js` and `app/mcp/page.js`.
    *   Refactor `app/page.js` to be a neutral, high-level homepage.
    *   Update the root layout (`app/layout.js`) to include the new navigation component.

2.  **Phase 2: Navigation Component**
    *   Create a new `components/Navigation` directory.
    *   Build a server or client component (`NavBar.js`) that includes:
        *   Brand logo linking to `/`.
        *   Desktop navigation with the `Products` dropdown.
        *   Mobile navigation (hamburger menu) that collapses on smaller screens.
        *   Consistent placement of common items (Login, Sign Up).

3.  **Phase 3: Content Migration & Creation**
    *   Audit existing homepage content and migrate developer-specific features/details to `app/developer/page.js`.
    *   Create new, compelling content for the GitLegend MCP product on `app/mcp/page.js`.
    *   Update any feature lists or pricing tables on shared pages to clearly delineate between products.

4.  **Phase 4: Testing & Polish**
    *   Ensure all links in the new navigation work correctly.
    *   Verify responsive behavior on mobile, tablet, and desktop.
    *   Check for consistent typography, spacing, and color across all new pages.

---

#### **4. Success Criteria**

*   A user landing on the homepage can immediately understand that GitLegend offers two distinct products.
*   A user can effortlessly navigate to either product's dedicated page via the navigation menu.
*   The visual design maintains brand cohesion while providing clear contextual signals about which product the user is engaging with.
*   The codebase is left in a maintainable state, with a clear component structure for future feature development on either product line.