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
*   A GitHub account
*   An OpenRouter API key (for AI features)

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username_/your_repository.git
    ```
2.  **Install NPM packages**
    ```sh
    npm install
    ```
3.  **Set up your environment variables**

    Create a `.env.local` file in the root of your project and add the following variables:

    ```
    # GitHub OAuth App credentials
    GITHUB_CLIENT_ID=your_github_client_id
    GITHUB_CLIENT_SECRET=your_github_client_secret

    # NextAuth.js secret
    # You can generate a secret with: openssl rand -base64 32
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000

    # Database connection string
    DATABASE_URL=your_database_url

    # OpenRouter API key for AI features
    OPENROUTER_API_KEY=your_openrouter_api_key
    ```

    *   **GitHub Credentials**: Create a new GitHub OAuth App [here](https://github.com/settings/applications/new). Set the "Authorization callback URL" to `http://localhost:3000/api/auth/callback/github`.
    *   **Database URL**: This project uses Prisma. You can use any database supported by Prisma (e.g., PostgreSQL, MySQL, SQLite). For local development, you can use a local PostgreSQL database or a free one from a cloud provider.
    *   **OpenRouter API Key**: Get your free API key from [OpenRouter](https://openrouter.ai/).

4.  **Set up the database**
    ```sh
    npx prisma migrate dev
    ```
5.  **Run the development server**
    ```sh
    npm run dev
    ```

## Usage

Once the development server is running, you can access the application at `http://localhost:3000`.

1.  **Sign in**: Sign in with your GitHub account.
2.  **Add a repository**: Go to the dashboard and click "Add Repository". You can add any public repository by URL, or select from your own repositories.
3.  **Analyze**: Once a repository is added, click "Analyze Now" to start the analysis process. This may take a few minutes depending on the size of the repository.
4.  **View the Legend**: After the analysis is complete, you can view the repository's "Legend", which includes the commit timeline, contributor insights, health score, and more.
5.  **Use AI Tools**: The "AI Tools" tab in the legend provides access to AI-powered features like architectural shift analysis and bug diagnosis.

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

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
