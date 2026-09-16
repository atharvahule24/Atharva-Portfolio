# Atharva Hule --- Portfolio

A modern, motion-rich, and responsive developer portfolio built with React and Vite. The portfolio showcases my projects, technical skills, resume, and contact information, with Supabase powering the content management system and EmailJS handling contact-form notifications.

## 🚀 Core Architecture & Tech Stack

### Frontend Frameworks

- **React 19 + Vite 8**: Fast development workflow, HMR, and optimized production builds.
- **React Router v7**: Client-side routing for the portfolio, project details, skills, certifications, and admin pages.
- **Vanilla CSS Modules**: Component-scoped styling with flexible responsive layouts.

### Logic & UI

- **Framer Motion**: Smooth entrance animations, transitions, and interactive UI effects.
- **GSAP**: Available for advanced animation workflows within the project.
- **HTML5 Canvas API**: Used by the neural-network background visual for an interactive animated experience.
- **Lucide React**: Icon library used throughout the interface.
- **React Markdown + remark-gfm**: Markdown rendering support for project content.

### Backend & Services

- **Supabase**: PostgreSQL-backed data storage, authentication, Row Level Security (RLS), and the admin dashboard.
- **EmailJS**: Client-side email delivery for the portfolio contact form.
- **Vercel**: Production deployment and automatic deployments from the GitHub repository.
- **GitHub**: Source-code hosting and version control.

---

## 🎨 Highlighted Features

### 🔐 Dynamic Administration Panel

Built-in secured dashboard at `/admin`, authenticated through Supabase Auth. The dashboard provides management interfaces for **Projects**, **Skills**, **Certifications**, **Stats**, and **Messages**.

The admin workflow has been tested in the production deployment, including project updates through the dashboard.

### 📂 Project Showcase

The portfolio currently highlights:

- **Solar Power Prediction System** --- Full-stack machine-learning web application for solar generation prediction, analytics, weather integration, and an AI assistant.
- **Green Finance** --- Carbon Footprint Monitoring & Carbon Credit Management Platform with carbon tracking, carbon-credit lifecycle management, double-entry ledger functionality, and infrastructure telemetry.

### 📧 Contact Form

The contact section uses **EmailJS + Gmail** to send portfolio enquiries directly to the configured email address. Supabase is also integrated for message persistence.

### 📊 Supabase-Driven Content

Projects, skills, certifications, statistics, and messages are structured as database-backed content, allowing portfolio information to be managed through the admin dashboard instead of requiring direct frontend edits for every content change.

### 📈 SEO & Discoverability

- Production metadata configured in `index.html`.
- Canonical URL configured for the deployed portfolio.
- Open Graph and Twitter metadata included.
- `robots.txt` and `sitemap.xml` included under `public/assets/`.
- Optimized Vite production build generated in the `dist/` directory.

### 🌓 Adaptive Theming

Global CSS variables support the portfolio's warm, research-notebook visual style together with a dark-mode interface.

### 📱 Responsive Interface

The portfolio is designed to adapt across desktop and mobile layouts, including the navigation, project pages, skills, contact section, and admin dashboard.

---

## 🗃️ Database Structure

The Supabase database is organized around the following tables:

- `projects` --- Project titles, descriptions, technology stacks, links, ordering, milestones, lessons, and status.
- `skills` --- Skill names organized by category.
- `certifications` --- Certification metadata and verification information.
- `stats` --- Portfolio statistics such as project, DSA, and certification counts.
- `messages` --- Contact-form submissions and message status.

Row Level Security (RLS) is enabled on the portfolio content tables. Public visitors can read the portfolio content, while administrative operations are performed through the authenticated admin workflow.

---

## 🛠️ Setup & Installation

Follow the local workflow below to run the portfolio in development.

### Prerequisites

- Node.js (v18.x or higher recommended)
- NPM

### 1. Clone and Initialize

```bash
git clone https://github.com/atharvahule24/Atharva-Portfolio.git
cd Atharva-Portfolio/frontend
npm install
