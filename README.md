# ZenTask — A Thoughtfully Engineered Task Management Application

A clean task management application focused on real-world authentication flows, guest-to-user migration, stable loading states, and production-ready frontend–backend integration.

Built with an emphasis on predictable UX and edge-case handling, ZenTask supports:

* 🚀 Demo task logic, inline task editing, dark mode, sorting, search, pagination, progress tracking, checklist management, and productivity dashboards — while maintaining clear state transitions during sign-in, sign-out, initial data loading, and optimistic UI with rollback safety and **in-flight sync locking**.

The project explores practical challenges like:

* 🎯 Delayed backend responses, auth stabilization loaders, sorting/filtering loaders, skeleton loaders during fetch, demo task handling for guests, and smooth UI recovery during state changes — reflecting the realities of deploying full-stack applications in production environments.

---

## 🔗 Live Demo

* **Frontend** : [https://zentask-liard.vercel.app](https://zentask-liard.vercel.app)
* **Backend API** : Deployed on Render

---

## 🖼️ Screenshots

### 🏠 Landing Experience

**Clear value proposition + motivation to start as guest (with dark mode shown)**

![Hero section](./screenshots/hero1.png)
![Hero section (dark mode)](./screenshots/hero2-darkmode.png)

---

### 👤 Guest Mode & Demo Logic

**Zero-friction entry with controlled demo data**

![Guest demo task](./screenshots/guest-mode-demoTask.png)
![Guest interception modal](./screenshots/guest-interception-modal.png)

---

### 🔐 Authentication Flow

**Stable auth transitions without UI flicker**

![Auth stabilizing loader](./screenshots/auth-loader.png)
![Auth modal (sign in / sign up)](./screenshots/auth-modal.png)

---

### 📋 Core Task Management

**Optimistic UI, inline editing, and confirmations (with dark mode)**

![Task list (dark mode)](./screenshots/task-list-darkMode.png)
![Create task modal](./screenshots/create-task-modal.png)
![Delete confirmation modal](./screenshots/delete-confirm-modal.png)

---

### 🧩 Checklists & Progress

**Subtasks with live progress feedback**

![Checklist with progress](./screenshots/checklist-darkMode.png)

---

### ⚡ Searching, Sorting, Limiting & Pagination

**Server + local hybrid handling for instant UX**

![Task filters](./screenshots/tasks-filters.png)
![Pagination](./screenshots/pagination.png)

---

### 📊 Dashboard & Insights

**Real-time productivity metrics from user data (with dark mode)**

![Dashboard overview](./screenshots/dashboard1.png)
![Dashboard charts](./screenshots/dashboard2.png)
![Dashboard loader (dark mode)](./screenshots/dashboard-loader-darkMode.png)
![Dashboard (dark mode)](./screenshots/dashboard-darkMode.png)

---

### 🌀 Loading System (Intentional States)

**Layered loaders for predictable UX**

![Skeleton loader](./screenshots/skeleton-loader.png)
![Skeleton loader (dark mode)](./screenshots/skeleton-loader-darkMode.png)
![Background refetch spinner](./screenshots/spinner-loader.png)

## ✨ Features

### 🔐 Guest Mode (No Signup Required)

* Automatic **guest mode** on first visit with full task access
* One-click migration when user signs in (guest data is merged, not discarded)
* No UI flash during auth transitions

**Result:** users can start working instantly, with zero friction.

 ..................................................................................................

### 🌀 Auth Stabilizing Loader

Instead of rendering incorrect UI and fixing it later, ZenTask uses a dedicated **Auth Stabilizing Loader** that runs while identity and tasks are being resolved.

Used during:

* App startup, sign-in, sign-out, guest ↔ user transition

This avoids:

* Hero flicker, task list jumps, incorrect empty states

..................................................................................................

### 📋 Task Management

* Create / edit / delete with **optimistic UI**
* UI actions disabled during in-flight sync to prevent race conditions
* Instant feedback with backend reconciliation
* Automatic rollback on failure
* Support for done, starred, priority, deadlines, checklist(add/ delete) and tags
* Inline edits
* Confirmation modals before deleting tasks

 ..................................................................................................

### 🧩 Smart Demo Logic

ZenTask injects **exactly one demo task** for new users or guests.

* Shown only once
* Never repeated after deletion (outside guest mode)
* Respects guest & user boundaries

This avoids the “annoying demo task” problem while still being helpful.

..................................................................................................

### ⚡ Sorting, Filtering, Limiting & Search

Sort by:

* Date (asc/desc), priority (asc/desc), deadline (asc/desc) and starred

Filter by:

* Status, search query(tags, title, desc), high priority, due today
* Debounced search input to avoid excessive renders and API calls

Limit results by:

* 2 / 4 / 6 / 8 / 10 / 20 / 30 tasks per page
  
Sorting and filtering are handled both **server-side and locally** for instant UI response.

..................................................................................................

### 📊 Dashboards & Insights

ZenTask includes a dedicated **dashboard screen** that provides visibility into productivity trends:

* Total tasks, completed tasks, pending tasks, high-priority tasks, today’s tasks
* Starred tasks

Charts include:

* 📈 Weekly productivity trends
* 🥧 Task overview (completed vs pending)
* ⏰ Deadline management insights

All charts are derived from real task data and update automatically.

..................................................................................................

### 📊 Progress & Checklists

* Per-task checklists with expand/collapse
* Checklist supports adding, editing, deleting, and toggling items.
* Live progress percentage
* Animated progress bars

Gives a sense of momentum — not just completion.

..................................................................................................

### 🎨 Dark Mode

* Full theme parity (no broken contrasts)
* Loaders, skeletons, and badges adapt correctly
* Softer shadows and colors for long-session comfort

..................................................................................................

### 🪩 Loader System (Intentional, Not Random)

ZenTask uses **layered loaders** , each with a purpose:

| Loader                  | Purpose                               |
| ----------------------- | ------------------------------------- |
| Auth Stabilizing Loader | Identity resolution and initial fetch |
| Skeleton Task Cards     | First load / empty frontend state     |
| Spinner + faded cards   | Background refetch                    |

This hierarchy prevents confusion and improves perceived performance.

> Actions are temporarily disabled during background sync to preserve state integrity.

..................................................................................................

### 📱 Responsive & Minimal UI

Designed to stay readable and usable across all screen sizes.

---

## 🚩 Engineering Focus

* Seamless **guest → authenticated migration**
* No UI flicker during auth changes
* Handling **slow backend responses** (Render cold starts)
* Fine-grained loaders instead of global blocking spinners
* Optimistic UI with rollback safety and sync locking
* Demo logic that never feels spammy
* Stable sorting, filtering, limiting, pagination, and debounced search input
* Proper dark mode implementation
* Aggregated data visualization for dashboards

This project intentionally focuses on problems that appear in real deployments:

> The goal was to build something that behaves correctly under real conditions:
> slow servers, reloads, auth transitions, and partial failures.

---

## 🛠 Tech Stack

### Frontend

* React
* JavaScript (ES6+)
* CSS (custom, no UI framework)

### Backend

* Node.js
* Express.js
* MongoDB & Mongoose

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## ⚙️ Local Setup

```bash

# Clone the repo

git  clone  https://github.com/arun-s3/ZenTask

  

# Frontend

cd  todo

npm  install

npm  start

  

# Backend

cd  ../server

npm  install

npm  run  servStart

```

### Backend `.env`

```

MONGO_URI=your_mongodb_uri

JWTSECRET=your_secret

PORT=your_port

```

### Frontend `.env`

```

REACT_APP_API_URL=http://localhost:backend_port

```

---

## 📦 Project Structure

```

zentask/

├── todo/ # React app

├── server/ # Express API

└── README.md

```

---

## 📄 License

MIT

---
