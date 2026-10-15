# ExamCraft — Technical Assessment & Examination Platform

[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Production-black?logo=vercel&logoColor=white)](https://examcraft-studio-teal.vercel.app)
[![API Layer](https://img.shields.io/badge/Architecture-REST%20API%20Engine-0ea5e9)](https://examcraft-studio-teal.vercel.app)

A modern full-stack technical assessment platform designed to deliver, evaluate, and manage timed programming and technical evaluations. Built with Next.js and TypeScript, featuring a simulated REST API execution layer and instant scoring telemetry.

---

## 🌐 Live Production Demo

- **Production URL:** [https://examcraft-studio-teal.vercel.app](https://examcraft-studio-teal.vercel.app)
- **Deployment Platform:** Vercel Edge Network

---

## ✨ Key Features

- **Interactive Examination Engine:** Timed assessment interface with progress indicators, multi-format question types, and real-time state tracking.
- **Simulated REST API Layer:** Client-side mock REST endpoints allowing fast, predictable data retrieval and submission cycles without heavy server overhead.
- **Cinematic Visual Presentation:** Tailored modern dark-mode aesthetic with custom splash animations and responsive navigation.
- **Immediate Result Breakdown:** Post-submission assessment telemetry calculating accuracy, completion speed, and competency performance.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router / Pages) | Server-rendered React framework and routing architecture |
| **Language** | TypeScript (99.5%) | End-to-end type safety for exam schemas, timers, and submissions |
| **State & Context** | React Hooks & Context API | Centralized exam timer, question queue, and answer persistence |
| **Styling** | Tailwind CSS / PostCSS | Responsive dark-mode interface and adaptive typography |
| **Hosting** | Vercel Edge Network | Sub-second global CDN edge caching and SSL certification |

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- `npm` or `bun`

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/alexyadao/examcraft.git
cd examcraft
