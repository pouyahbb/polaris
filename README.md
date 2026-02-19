# Polaris - Cloud IDE with AI

A fully-featured browser-based IDE inspired by Cursor AI, featuring real-time collaborative editing, AI-powered code suggestions, conversation-based AI assistant, in-browser code execution, and GitHub integration.

**Repository:** [https://github.com/pouyahbb/polaris](https://github.com/pouyahbb/polaris)

## 🌟 Features

### Code Editor

- **Multi-language Support**: Syntax highlighting for JavaScript, TypeScript (TS/TSX), JSX, HTML, CSS, JSON, Markdown (MD/MDX), and Python
- **Advanced Editor Features**:
  - Line numbers and code folding
  - Minimap overview for navigation
  - Bracket matching and indentation guides
  - Multi-cursor editing support
  - Rectangular selection
  - Search and replace functionality
  - Auto-completion
  - One Dark theme with custom styling

### AI-Powered Features

- **Real-time Code Suggestions**: AI-powered ghost text suggestions that appear as you type (accept with Tab)
- **Quick Edit (Cmd+K)**: Select code and use natural language instructions to edit it instantly
- **Selection Tooltip**: Quick action tooltip when code is selected
- **Conversation-Based AI Assistant**: 
  - Full conversation history with context awareness
  - AI agent with file management tools (create, read, update, delete files and folders)
  - Automatic conversation title generation
  - Message cancellation support
  - Background processing with Inngest for non-blocking UI

### File Management

- **File Explorer**: 
  - Hierarchical folder structure
  - VSCode-style file icons
  - Create, rename, and delete files and folders
  - Drag-and-drop support
  - Breadcrumb navigation
- **Tab-based Navigation**: Multiple files open simultaneously with tab management
- **Auto-save**: Automatic file saving with debouncing (500ms)
- **Binary File Support**: Handles both text and binary files with proper storage

### Real-time Collaboration

- **Convex-powered Real-time Updates**: Instant synchronization across all clients
- **Optimistic UI Updates**: Immediate feedback for better user experience
- **Background Job Processing**: Non-blocking operations with Inngest

### Project Management

- **Multi-project Support**: Create and manage multiple projects
- **Project Dashboard**: Overview of all your projects
- **Project Settings**: Configure install and dev commands for WebContainer
- **AI Project Creation**: Generate projects from natural language prompts

### GitHub Integration

- **Import from GitHub**: Import entire repositories with folder structure and files
- **Export to GitHub**: Export projects as new GitHub repositories (public or private)
- **Status Tracking**: Real-time import/export status with progress indicators
- **Cancellation Support**: Cancel ongoing export operations

### In-Browser Execution (WebContainer)

- **Live Preview**: Run and preview your projects directly in the browser
- **Terminal Integration**: Full terminal access with xterm.js
- **Hot Reload**: Automatic file synchronization and hot reload
- **Custom Commands**: Configure install and dev commands per project
- **Status Monitoring**: Track boot, install, and running states

### Authentication & Security

- **Clerk Authentication**: Secure authentication with GitHub OAuth
- **Protected Routes**: All routes require authentication
- **User-specific Projects**: Projects are isolated per user
- **Internal API Security**: Secure internal API with key validation

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Editor** | CodeMirror 6, Custom Extensions, One Dark Theme |
| **Backend** | Convex (Real-time DB), Inngest (Background Jobs) |
| **AI** | Claude Sonnet 4 / Claude Opus 4 (preferred) or Gemini 2.0 Flash (free tier) |
| **Auth** | Clerk (with GitHub OAuth) |
| **Execution** | WebContainer API, xterm.js |
| **UI** | shadcn/ui, Radix UI |
| **Error Tracking** | Sentry |
| **Web Scraping** | Firecrawl (for AI documentation context) |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.09 or higher
- **npm** or **pnpm** package manager
- **Git** for cloning the repository

### Required Accounts & API Keys

You'll need accounts and API keys from the following services:

1. **[Clerk](https://clerk.com)** - Authentication service
   - Create an account and set up a new application
   - Get your Publishable Key and Secret Key
   - Configure GitHub OAuth provider

2. **[Convex](https://convex.dev)** - Real-time database
   - Create an account and a new project
   - Get your deployment URL
   - Note your deployment name

3. **[Inngest](https://inngest.com)** - Background job processing
   - Create an account and set up a new app
   - Configure for local development

4. **AI Provider** (choose at least one):
   - **[Anthropic](https://anthropic.com)** - For Claude Sonnet 4 / Opus 4 (recommended)
   - **[Google AI Studio](https://aistudio.google.com)** - For Gemini 2.0 Flash (free tier alternative)
   - **[OpenAI](https://openai.com)** - Alternative option

5. **[Firecrawl](https://firecrawl.dev)** - Web scraping (optional, for AI documentation context)
   - Create an account and get your API key

6. **[Sentry](https://sentry.io)** - Error tracking (optional)
   - Create an account and project
   - Get your DSN

## 🚀 Installation & Setup

### Step 1: Clone the Repository

   ```bash
git clone https://github.com/pouyahbb/polaris.git
   cd polaris
   ```

### Step 2: Install Dependencies

   ```bash
   npm install
   ```

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root directory:


Open `.env.local` and configure the following environment variables:

   ```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=your-app.clerk.accounts.dev

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name
CONVEX_INTERNAL_KEY=your-random-secret-key-here  # Generate a random string

# AI Provider (choose at least one)
# Option 1: Anthropic (recommended)
ANTHROPIC_API_KEY=sk-ant-...

# Option 2: Google AI
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Option 3: OpenAI
OPENAI_API_KEY=sk-...

   # Firecrawl (optional)
FIRECRAWL_API_KEY=fc-...

   # Sentry (optional)
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_DSN=https://...@sentry.io/...
```

#### Important Notes:

- **CONVEX_INTERNAL_KEY**: Generate a random secure string (e.g., using `openssl rand -hex 32` or any random string generator). This key is used for internal API security.
- **AI Provider**: You need at least one of `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, or `OPENAI_API_KEY`. The application will use Anthropic if available, otherwise falls back to Google or OpenAI.
- **CLERK_JWT_ISSUER_DOMAIN**: This is typically in the format `your-app-name.clerk.accounts.dev`. You can find it in your Clerk dashboard.

### Step 4: Set Up Convex

Initialize and start the Convex development server:

   ```bash
   npx convex dev
   ```

This will:
- Set up your Convex project
- Push the schema to Convex
- Start the Convex development server
- Watch for changes and auto-sync

**Note**: Keep this terminal running. The Convex dev server needs to be running for the application to work.

### Step 5: Set Up Inngest (New Terminal)

Open a new terminal window and start the Inngest dev server:

```bash
npx inngest-cli@latest dev
```

This will:
- Start the Inngest development server
- Allow background jobs to run locally
- Provide a dashboard at `http://localhost:8288`

**Note**: Keep this terminal running as well.

### Step 6: Start the Next.js Development Server (New Terminal)

Open another new terminal window and start the Next.js server:

   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Step 7: Access the Application

1. Open your browser and navigate to `http://localhost:3000`
2. You'll be prompted to sign in with Clerk
3. Complete the authentication flow
4. Start creating and managing your projects!

## 📁 Project Structure

```
polaris/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── messages/      # Conversation API endpoints
│   │   │   ├── suggestion/    # AI code suggestions
│   │   │   ├── quick-edit/    # Cmd+K quick edit
│   │   │   ├── projects/       # Project management APIs
│   │   │   ├── github/         # GitHub import/export
│   │   │   └── inngest/        # Inngest webhook
│   │   ├── projects/           # Project pages
│   │   │   └── [projectId]/   # Individual project pages
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # Shared components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── ai-elements/       # AI conversation UI components
│   │   ├── providers.tsx      # App providers (Clerk, Convex, Theme)
│   │   └── env-check-dialog.tsx # Environment variable checker
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication components
│   │   ├── conversations/     # AI chat system
│   │   │   ├── components/    # Conversation UI
│   │   │   ├── hooks/        # Conversation hooks
│   │   │   └── inngest/      # Message processing
│   │   │       └── tools/    # AI agent tools
│   │   ├── editor/           # CodeMirror editor
│   │   │   ├── components/   # Editor components
│   │   │   ├── extensions/   # CodeMirror extensions
│   │   │   │   ├── suggestion/  # AI suggestions
│   │   │   │   ├── quick-edit/  # Cmd+K editing
│   │   │   │   └── ...          # Other extensions
│   │   │   ├── hooks/        # Editor hooks
│   │   │   └── store/        # Editor state management
│   │   ├── preview/          # WebContainer preview
│   │   │   ├── components/    # Preview UI
│   │   │   ├── hooks/        # WebContainer hooks
│   │   │   └── utils/        # File tree utilities
│   │   └── projects/         # Project management
│   │       ├── components/    # Project UI components
│   │       ├── hooks/        # Project hooks
│   │       └── inngest/       # GitHub import/export jobs
│   ├── inngest/              # Inngest client and functions
│   └── lib/                  # Utilities
│       ├── convex-client.ts  # Convex client setup
│       ├── firecrawl.ts      # Firecrawl client
│       └── utils.ts          # General utilities
├── convex/                   # Convex backend
│   ├── schema.ts             # Database schema
│   ├── auth.ts               # Authentication helpers
│   ├── projects.ts           # Project queries/mutations
│   ├── files.ts              # File operations
│   ├── conversations.ts      # Conversation operations
│   └── system.ts             # Internal API for Inngest
├── public/                   # Static assets
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start Next.js development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🎯 Key Features Explained

### AI Code Suggestions

The editor provides real-time AI-powered code suggestions as you type. Suggestions appear as ghost text (semi-transparent) after your cursor. Press `Tab` to accept a suggestion.

- **Debounced**: Suggestions are generated 300ms after you stop typing
- **Context-aware**: Considers the entire file, previous/next lines, and cursor position
- **Smart filtering**: Only suggests when appropriate (not after complete statements)

### Quick Edit (Cmd+K)

Select any code in the editor and press `Cmd+K` (or `Ctrl+K` on Windows/Linux) to open the quick edit tooltip. Enter a natural language instruction to modify the selected code.

- **In-place editing**: Changes are applied directly in the editor
- **Context preservation**: AI considers the full file context
- **URL support**: Can scrape documentation from URLs you provide

### AI Conversation Assistant

The conversation sidebar provides a full AI coding assistant powered by Claude Opus 4. The assistant can:

- **Read files**: Understand your project structure and code
- **Create files**: Generate new files with content
- **Update files**: Modify existing files based on your instructions
- **Create folders**: Organize your project structure
- **Rename/Delete**: Manage files and folders
- **Scrape URLs**: Fetch and understand documentation from web pages

The assistant processes requests in the background using Inngest, so the UI remains responsive.

### WebContainer Preview

The preview panel uses WebContainer API to run your projects directly in the browser:

- **No server required**: Everything runs client-side
- **Hot reload**: Changes sync automatically
- **Terminal access**: Full terminal with command execution
- **Custom commands**: Configure install and dev commands per project

### GitHub Integration

**Import from GitHub:**
1. Click the import button in the project dashboard
2. Enter the repository owner and name
3. Authenticate with GitHub
4. The entire repository is imported with folder structure intact

**Export to GitHub:**
1. Open a project
2. Click the export button
3. Choose repository name, visibility (public/private), and description
4. Authenticate with GitHub
5. The project is exported as a new repository

Both operations run in the background and show real-time status.

## 🔐 Environment Variables Reference

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk Dashboard → API Keys |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk JWT issuer domain | Clerk Dashboard → Settings |
| `CONVEX_DEPLOYMENT` | Convex deployment name | Convex Dashboard → Settings |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Convex Dashboard → Settings |
| `CONVEX_INTERNAL_KEY` | Internal API security key | Generate a random string |
| At least one AI key | AI provider API key | See AI Provider section |

### Optional Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key | Google AI Studio |
| `OPENAI_API_KEY` | OpenAI API key | OpenAI Platform |
| `ANTHROPIC_API_KEY` | Anthropic API key | Anthropic Console |
| `FIRECRAWL_API_KEY` | Firecrawl API key | Firecrawl Dashboard |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | Sentry Settings → Auth Tokens |
| `SENTRY_DSN` | Sentry DSN | Sentry Project → Settings → Client Keys |

## 🐛 Troubleshooting

### Environment Variables Not Detected

If you see the environment variable dialog on app load:

1. Ensure `.env.local` exists in the project root
2. Check that all required variables are set
3. Restart the Next.js development server after adding variables
4. Verify variable names match exactly (case-sensitive)

### Convex Connection Issues

- Ensure `npx convex dev` is running
- Check that `NEXT_PUBLIC_CONVEX_URL` matches your Convex deployment
- Verify your Convex project is active in the dashboard

### Inngest Jobs Not Running

- Ensure `npx inngest-cli@latest dev` is running
- Check the Inngest dashboard at `http://localhost:8288`
- Verify the Inngest webhook is configured in your Inngest dashboard

### AI Features Not Working

- Verify at least one AI API key is set
- Check API key validity and quota
- Review browser console for error messages
- Ensure the API route `/api/suggestion` and `/api/quick-edit` are accessible

### WebContainer Not Loading

- Check browser console for errors
- Ensure WebContainer API is supported in your browser
- Verify project has valid `package.json` and install/dev commands

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [CodeMirror Documentation](https://codemirror.net/docs)
- [WebContainer API](https://webcontainers.io)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Cursor](https://cursor.sh) - Inspiration for the project
- [Orchids](https://orchids.app) - Inspiration for the project
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [CodeMirror](https://codemirror.net) - Code editor
- All the amazing open-source libraries that made this possible

---

**Built with ❤️ using Next.js, Convex, and AI**
