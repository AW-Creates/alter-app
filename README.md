# 🎓 Altor — "University in a Box" AI Learning Engine

[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=flat-square)](https://web.dev/progressive-web-apps/)

> **Altor** *(Latin: "The Cultivator and Fosterer of the Mind")* is an autonomous self-education web and mobile application inspired by the **A.L.T.E.R. Framework** (*"How To Become Dangerously Self-Educated With AI"*).

---

## 🏛️ The 5 A.L.T.E.R. Pillars in Altor

- **🎓 A — Academic Advisor**: Builds custom multi-phase roadmaps, milestone projects, and the essential **Cut List** (what to explicitly skip to avoid tutorial hell and cognitive fatigue).
- **📚 L — Master Librarian**: Filters 99% of Internet noise to curate the top 1% seminal books, papers, and lectures, backed by a persistent Grounded Knowledge Vault.
- **💡 T — Socratic Midnight Tutor**: Guides you through active inquiry, diagnostic knowledge-gap quizzes, and the **Feynman Technique Studio** (evaluating clarity, accuracy, and blind spots).
- **✍️ E — Analytical Editor**: Rigorously pressure-tests essays, architecture proposals, and mental models through unsparing logic audits, steelmanned counterarguments, and surgical redline diffs.
- **🛋️ R — Lateral Roommate**: Sparks cross-disciplinary brainstorms (e.g. *Your Subject × Evolutionary Biology / Roman Strategy*) and thought experiments.

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/AW-Creates/alter-app.git
cd alter-app
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Configure Gemini AI (Optional)
The app runs out-of-the-box with built-in interactive demo simulations. To unlock live Gemini 2.0/2.5 generation:
1. Click the **API Key** button in the top navigation bar.
2. Enter your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3. The key is stored 100% locally in your browser's `localStorage` for privacy.

---

## 🌐 1-Click Deployment (Netlify & Vercel)

### Netlify
1. Connect your GitHub repository `AW-Creates/alter-app` to Netlify.
2. Netlify will automatically detect `netlify.toml` and deploy with continuous updates!

---

## 📱 Mobile App (Android & iOS)

### Progressive Web App (PWA):
Open the deployed site on Android Chrome or iOS Safari and tap **"Add to Home Screen"** or **"Install App"**.

### Native Android APK (Capacitor):
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Altor" "com.altor.university" --web-dir "dist"
npx cap add android
npx cap open android
```

---

## 📄 License
MIT License. Built for autonomous lifelong learners.
