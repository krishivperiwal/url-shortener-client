# URL Shortener Client

React frontend for the URL Shortener API. Built with Vite, React, and Tailwind CSS.

## Live Demo
[url-shortener-client.vercel.app](https://url-shortener-client.vercel.app)

## Features
- JWT authentication with protected routes
- Shorten any URL instantly from the dashboard
- Copy short URL to clipboard with one click
- Per-URL analytics — total clicks, days active, avg clicks/day
- Click history timeline with timestamps
- Line chart visualization using Chart.js

## Tech Stack
- React 18 + Vite
- React Router v6
- Axios with JWT interceptor
- React Hook Form
- Context API for global auth state
- Tailwind CSS v3
- Chart.js for analytics visualization

## Pages
| Page | Route | Description |
|------|-------|-------------|
| Login | /login | JWT login |
| Signup | /signup | Register account |
| Dashboard | /dashboard | Create and manage short URLs |
| Analytics | /analytics/:shortId | Click analytics with chart |

## Setup

```bash
git clone https://github.com/krishivperiwal/url-shortener-client
cd url-shortener-client
npm install
npm run dev
```

Make sure the backend is running on `http://localhost:5000`.

## Backend
API repo: [url-shortener-api](https://github.com/krishivperiwal/url-shortener-api)
