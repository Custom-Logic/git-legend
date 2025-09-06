# GitLegend

GitLegend is a suite of tools for developers and AI agents to unlock the rich history and context of your codebase. It transforms your GitHub repository into a compelling visual narrative, allowing you to discover the story behind every commit, contributor, and milestone.

## Features

*   **Repository Analysis**: Analyze your GitHub repositories to get insights into your codebase's history and evolution.
*   **Commit Timeline**: Visualize your commits on an interactive timeline.
*   **Contributor Insights**: Get a detailed breakdown of your project's contributors and their impact.
*   **Health Score**: Assess the health of your repository based on various metrics.
*   **AI-Powered Summaries**: Generate AI-powered summaries for your key commits.
*   **MCP Server**: A high-performance Model Context Protocol (MCP) server for AI agents.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/your_repository.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your environment variables. Create a `.env.local` file in the root of your project and add the following variables:
    ```
    GITHUB_CLIENT_ID=your_github_client_id
    GITHUB_CLIENT_SECRET=your_github_client_secret
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000
    DATABASE_URL=your_database_url
    OPENROUTER_API_KEY=your_openrouter_api_key
    ```
4.  Run the development server
    ```sh
    npm run dev
    ```

## Usage

Once the development server is running, you can access the application at `http://localhost:3000`. You can sign in with your GitHub account to add and analyze your repositories.

## Technologies Used

*   [Next.js](https://nextjs.org/) - React framework for production
*   [React](https://reactjs.org/) - A JavaScript library for building user interfaces
*   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
*   [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript
*   [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js and TypeScript
*   [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
*   [Socket.IO](https://socket.io/) - Real-time, bidirectional and event-based communication
*   [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components for building high-quality design systems
*   [Vercel](https://vercel.com/) - Platform for frontend frameworks and static sites

## License

Distributed under the MIT License. See `LICENSE` for more information.
