# Get Place Go

> **Agentic AI Travel Agent for Pune, India**

Discover places based on *vibe*, not just ratings. AI-powered recommendations for Baner & Koregaon Park.

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <YOUR_GIT_URL>
cd get-place-go
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [Project Documentation](docs/PROJECT_DOCUMENTATION.md) | Full technical documentation |
| [Local Development Guide](docs/LOCAL_DEVELOPMENT_GUIDE.md) | Setup, debugging, workflows |
| [AI Code Reference](docs/AI_CODE_REFERENCE.md) | AI/ML code locations & modification guide |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Shadcn/UI**
- **TanStack Query** for data fetching
- **React Router v6** for navigation

### Backend (Lovable Cloud)
- **PostgreSQL** with **pgvector** for embeddings
- **Supabase Edge Functions** (Deno runtime)
- **Row Level Security (RLS)**

### AI/ML
- **Lovable AI Gateway** (Gemini/GPT models)
- **Semantic search** with vector embeddings

---

## 📁 Key Directories

```
src/
├── components/      # React components
├── pages/          # Route pages
├── hooks/          # Custom hooks (auth, etc.)
└── lib/            # Utilities

supabase/
└── functions/      # 🤖 AI EDGE FUNCTIONS
    ├── vibe-search/         # Semantic search
    └── generate-itinerary/  # Trip planning

docs/              # Documentation
```

---

## 🤖 AI Code Locations

All AI logic is in `supabase/functions/`:

| Function | File | Purpose |
|----------|------|---------|
| Vibe Search | `vibe-search/index.ts` | Natural language place search |
| Itinerary AI | `generate-itinerary/index.ts` | Day trip suggestions |

See [AI Code Reference](docs/AI_CODE_REFERENCE.md) for details.

---

## 🔧 Common Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run test       # Run tests
npm run lint       # Lint code
```

---

## How can I edit this code?

**Use Lovable**
Simply visit the Lovable Project and start prompting. Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**
If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

**Edit a file directly in GitHub**
- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

---

## How can I deploy this project?

Simply open Lovable and click on Share -> Publish.

## Can I connect a custom domain?

Yes! Navigate to Project > Settings > Domains and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

*Built with ❤️ using Lovable*
