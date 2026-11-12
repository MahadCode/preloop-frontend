# PrepLoop

React client for PrepLoop. It talks to the Django API with session cookies and renders the archive, question pages, preparation tools, taxonomy, and moderation queue.

The interface uses React 19, Vite 8, Tailwind CSS 4, React Router 7, Redux Toolkit for the signed-in account, and TinyMCE for question and solution text.

## Requirements

- Node.js with npm
- The PrepLoop API running at `http://127.0.0.1:8000/`
- A TinyMCE API key if you want the rich text editor to load

Dependencies are declared in `package.json` and locked in `package-lock.json`.

## Run locally

Start the API first. The backend README explains migrate, seed, and `runserver`.

From `tech-interview-prep-frontend`:

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

Use `localhost`, not `127.0.0.1`. The API only allows cookies and cross-origin requests from `http://localhost:5173`.

`npm run build` writes the production bundle to `dist`. `npm run preview` serves that bundle. `npm run lint` runs ESLint.

## Environment

Create `.env` in this folder when you need to override the defaults:

```text
VITE_BACKEND_URL=http://localhost:8000/
VITE_TINYMCE_API_KEY=your-tinymce-key
VITE_API_TIMEOUT=60000
```

`VITE_BACKEND_URL` defaults to `http://localhost:8000/` when it is unset. A missing trailing slash is added. The TinyMCE editor needs `VITE_TINYMCE_API_KEY`. Requests wait up to `VITE_API_TIMEOUT` milliseconds, defaulting to 60000, so a sleeping free API host can wake up. Restart `npm run dev` after changing `.env`. Vite reads these values at build time, so a Vercel deploy has to be created again after they change.

## Deploy

`vercel.json` sends every path to `index.html`, which lets a direct visit to `/questions/1` load the app. On Vercel, set `VITE_BACKEND_URL` to the Render origin with a trailing slash, and set `VITE_TINYMCE_API_KEY`. The API’s `FRONTEND_URL` must be this site’s `https` origin.

## Seeded login

After `python manage.py seed` in the backend, sign in with username `preploop` and password `PrepLoop-test-1`. The same password works for `avery`, `jordan`, `moderator`, `admin`, `pending`, and `suspended`.

`moderator` and `admin` can open the review queue. `pending` can see the archive but cannot open verified study tools. `suspended` is kept out of those tools as well.

## What the client covers

| Area | Routes |
| --- | --- |
| Public | `/`, `/about`, `/privacy`, `/terms`, `/login`, `/signup`, `/forgot-password` |
| Email | `/verify-email/:token`, `/reset-password/:token`, `/verification-email-sent` |
| Archive | `/all-questions`, `/questions/:questionId`, `/questions/company/:companyId` |
| Writing | `/add-question`, `/questions/:id/edit`, `/questions/:questionId/submit-solution`, `/questions/:questionId/solutions` |
| Account | `/profile`, `/settings`, `/change-password`, `/delete-account`, `/notifications`, `/my-questions`, `/reports` |
| Preparation | `/dashboard`, `/dashboard/goals`, `/dashboard/progress`, `/dashboard/statistics`, `/practice` |
| Staff | `/taxonomy`, `/moderation`, `/moderation/reports/:id`, `/moderation/questions/:id` |

Company, role, and topic fields search the live taxonomy. A name that is not already there can be created from the question form. List filters search the same records instead of printing every name on the page.

## Project layout

| Path | Contents |
| --- | --- |
| `src/api` | Axios client and one module per backend area |
| `src/features` | Pages grouped by accounts, questions, preparation, taxonomy, and moderation |
| `src/components` | Shared controls, question cards, and the discussion thread |
| `src/layouts` | Marketing shell, app shell, and route guards |
| `src/lib` | Formatting, question filtering, and error text |

Redux stores the signed-in user only. Question lists, goals, and notifications are loaded from the API when a page opens.
