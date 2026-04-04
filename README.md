# NextPlay Kanban Board

A task board for managing work across teams. Drag tasks between columns, filter by priority or assignee, leave comments, track changes. Built with React, TypeScript, and Supabase — backed by a Go REST API.

**Live app:** https://nextplay-kanban-zeta.vercel.app  
**API repo:** https://github.com/Prashanthpavudala/nextplay-kanban-api

---

## What it does

The board has four columns: To Do, In Progress, In Review, and Done. Each task moves through these columns via drag and drop — pick it up, drop it somewhere else, done. The change persists immediately.

Beyond the basics, the app supports:

**Task management** — Create tasks with a title, description, priority (low / normal / high), due date, and assignee. Edit any field later. Delete when you're done. Every change is logged automatically.

**Labels** — Create color-coded labels like "Bug" or "Feature" and attach them to tasks. Filter the board by label to see only what's relevant.

**Team members** — Add people to a team roster with a name and color. Assign them to tasks. Their initials appear as a small avatar on the card. Click an avatar in the toolbar to filter the board to that person's tasks.

**Comments** — Open any task to leave a comment. Comments show in chronological order with relative timestamps. Useful for context that doesn't fit in a description.

**Activity log** — Every task tracks what happened to it: when it was created, when it moved columns, when fields changed, when someone commented. The log shows in reverse chronological order inside the task detail panel.

**Filtering** — Search by title, filter by priority, filter by label, filter by assignee. Active filters show as chips with a one-click clear. The toolbar shows how many tasks match out of the total.

**Stats** — The header shows total tasks, active tasks, completed tasks, and overdue count at a glance.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Drag and drop | @dnd-kit/core + @dnd-kit/sortable |
| Auth | Supabase anonymous sign-in |
| API client | Custom fetch wrapper (goClient.ts) |
| Date handling | date-fns |
| Icons | lucide-react |
| Hosting | Vercel |

The frontend calls a Go REST API for all data operations. Supabase is used only for anonymous authentication — once the user has a JWT, every request goes to Go, not Supabase directly.

---

## Project structure

```
src/
├── App.tsx                    # Board, DnD logic, all modal state
├── components/
│   ├── board/
│   │   └── BoardColumn.tsx    # Droppable column with task list
│   ├── task/
│   │   ├── TaskCard.tsx       # Draggable card with priority, due date, avatar
│   │   ├── TaskModal.tsx      # Create / edit task form
│   │   └── TaskDetailPanel.tsx # Comments + activity log
│   └── ui/
│       ├── Header.tsx         # Stats bar + collapsible filters
│       ├── CustomSelect.tsx   # Fully custom dropdown (no native select)
│       ├── LabelsModal.tsx    # Create / delete labels
│       ├── TeamModal.tsx      # Add / remove team members
│       └── LoadingScreen.tsx  # Animated splash
├── hooks/
│   └── useBoard.ts            # Auth + data loading hook
├── lib/
│   ├── supabase.ts            # Supabase client (auth only)
│   ├── goClient.ts            # Fetch wrapper with JWT injection
│   ├── api.ts                 # Task, label, comment, activity functions
│   └── teamApi.ts             # Team member functions
└── types/
    └── index.ts               # Task, Label, Comment, Column types
```

---

## Local setup

You need Node.js 20+ and both a Supabase project and the Go API running locally.

**1. Clone and install**

```bash
git clone https://github.com/Prashanthpavudala/nextplay-kanban.git
cd nextplay-kanban
npm install
```

**2. Set up environment variables**

```bash
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8080
```

For production, `VITE_API_URL` points to the deployed Go API on Render.

**3. Set up Supabase**

Run the SQL schema (from the API repo's `schema.sql`) in the Supabase SQL editor. Enable anonymous sign-ins under Authentication → Sign In / Providers.

**4. Start the Go API**

See the [API repo](https://github.com/Prashanthpavudala/nextplay-kanban-api) and run it on port 8080.

**5. Run the frontend**

```bash
npm run dev
# → http://localhost:5173
```

---

## How authentication works

On first load, the app calls `supabase.auth.signInAnonymously()`. Supabase creates a real authenticated user with a UUID and returns a JWT signed with an ECC P-256 key. Every subsequent API request attaches this token as `Authorization: Bearer <token>`. The Go backend validates the token against Supabase's JWKS endpoint, extracts the user ID, and applies it to all database queries. No login page, no passwords.

If you clear your browser storage, a new anonymous session is created — your previous tasks won't be visible because they're tied to the old user ID.

---

## Drag and drop

Cards are draggable by grabbing anywhere on the card surface. The board uses `@dnd-kit` with a `PointerSensor` (activates after 5px of movement, which prevents accidental drags when clicking). Keyboard navigation is also supported via `KeyboardSensor`.

When you start dragging, the original card's status is captured in a ref before any optimistic updates happen. The board updates in real time as you drag (via `onDragOver`). When you drop, `onDragEnd` compares the current status against the captured original and calls the API's move endpoint only if the column actually changed. Dropping outside a valid target reverts the board to its previous state.

---

## Deployment

The frontend deploys to Vercel. Set these environment variables in Vercel's dashboard:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_URL   ← your Render URL, e.g. https://nextplay-kanban-api.onrender.com
```

