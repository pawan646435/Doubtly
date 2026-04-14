# /home/pawankumar/Desktop/Doubtly/README.md

<div align="center">

# ✦ Doubtly — AI Doubt Solver

**An AI-powered EdTech application that adapts its explanations to coding, math, reasoning, science, and theory questions.**

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)
![NVIDIA](https://img.shields.io/badge/Google-Gemini_%2B_Kimi-4285F4)

</div>

---

## 🎯 What is Doubtly?

Doubtly is a full-stack web application that allows students to:
- **Upload an image** of a question and extract text via OCR (Tesseract.js)
- **Type any question** (math, coding, reasoning, science, theory)
- **Get AI-powered adaptive answers** based on the question type
- **Receive proper code with explanation** for programming questions
- **Receive step-by-step derivations** for math questions
- **Receive clue-by-clue logic breakdowns** for reasoning questions
- **Ask follow-up questions** for deeper understanding
- **Toggle ELI5 mode** for simplified explanations
- **Dedicated Coding Page** with a specialized code-editor UI specifically for programming doubts
- **Dedicated Coding Page** with a specialized code-editor UI specifically for programming doubts
- **Get practice questions** for additional learning
- **Review past doubts** in a searchable history

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server
| **Node-Cache** | API response caching to reduce costs |
| **Node-Cache** | API response caching to reduce costs | |
| **MongoDB + Mongoose** | Database & ODM |
| **Tesseract.js** | OCR (text extraction from images) |
| **Google Gemini + NVIDIA Kimi API** | AI model access + routing (Gemini 1.5 Flash, Kimi-k2-instruct) |
| **Multer** | File upload handling |
| **express-rate-limit** | API rate limiting |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Framer Motion** | Animations & transitions |
| **React Router v6** | Client-side routing |
| **react-markdown** | Markdown rendering |
| **KaTeX** | Math equation rendering |
| **react-dropzone** | Drag & drop file upload |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **MongoDB** running locally or a MongoDB Atlas connection string
- **Google Gemini + NVIDIA Kimi API Keys** (from [build.nvidia.com](https://build.nvidia.com))
  - `NVIDIA_API_KEY` for Gemma
  - `NVIDIA_QWEN_API_KEY` for Qwen (recommended for best routing)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Doubtly
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your MONGODB_URI + NVIDIA keys
# - GEMINI_API_KEY (Google)
# - KIMI_API_KEY (NVIDIA / openai SDK)
# Optional: DB_FALLBACK_MODE=file to run without local MongoDB
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start the Application
Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## ▲ Deploying To Vercel

This repo is structured as a monorepo, so deploy it as **two Vercel projects**:

1. **Backend project**
   Root Directory: `backend`
2. **Frontend project**
   Root Directory: `frontend`

### Backend project settings

- Framework Preset: `Other`
- Root Directory: `backend`
- Required environment variables:
  - `MONGODB_URI`
  - `GEMINI_API_KEY`
  - `KIMI_API_KEY`
  - `CLIENT_URL` = your deployed frontend URL
  - `DB_FALLBACK_MODE` = `disabled`

After deploy, your API base URL will look like:

```bash
https://your-backend-project.vercel.app/api
```

### Frontend project settings

- Framework Preset: `Vite`
- Root Directory: `frontend`
- Required environment variables:
  - `VITE_API_BASE_URL` = `https://your-backend-project.vercel.app/api`

The frontend includes a `vercel.json` rewrite so React Router routes such as `/history` work in production.

### Important Vercel notes

- Vercel Functions are **ephemeral**, so local file storage is not suitable for production history.
- This app now expects **MongoDB** in production.
- Image OCR uploads are handled in memory so they can run inside a serverless function.

---

## 📁 Project Structure

```
Doubtly/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   └── Doubt.js           # Mongoose schema
│   ├── routes/
│   │   └── doubts.js          # API routes
│   ├── controllers/
│   │   └── doubtController.js # Route handlers
│   ├── middleware/
│   │   └── upload.js          # Multer file upload
│   ├── services/
│   │   ├── ocrService.js      # Tesseract.js OCR
│   │   └── aiService.js       # Dual-model routing (Gemma + Qwen)
│   ├── .env.example           # Environment template
│   └── package.json
│
├── frontend/
│   ├── index.html             # HTML entry point
│   ├── vite.config.js         # Vite configuration
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # App with routing
│   │   ├── index.css          # Global design system
│   │   ├── App.css            # App layout styles
│   │   ├── context/
│   │   │   └── DoubtContext.jsx   # Global state management
│   │   ├── services/
│   │   │   └── api.js             # API client
│   │   ├── components/
│   │   │   ├── Navbar/            # Navigation bar
│   │   │   ├── ImageUpload/       # Drag & drop upload
│   │   │   ├── ResponseArea/      # AI response display
│   │   │   ├── FollowUpChat/      # Follow-up chat
│   │   │   ├── LoadingSpinner/    # Orbital loader
│   │   │   └── ParticleBackground/ # Ambient background
│   │   └── pages/
│   │       ├── HomePage/          # Landing page
│   │       ├── SolverPage/        # Main solver
│   │       └── HistoryPage/       # Past doubts
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/doubts/solve` | Solve a doubt (text/image) |
| `GET` | `/api/doubts/history` | Get past doubts (paginated) |
| `GET` | `/api/doubts/:id` | Get single doubt details |
| `POST` | `/api/doubts/:id/followup` | Ask a follow-up question |
| `DELETE` | `/api/doubts/:id` | Delete a doubt |
| `GET` | `/api/health` | Health check |

---

## 🧠 Adaptive Answer Modes

Doubtly now formats responses differently depending on the detected or selected question type:

| Type | Response Style |
|------|----------------|
| `coding` | Problem understanding, solution strategy, runnable code, code walkthrough, and complexity notes |
| `math` | Step-by-step derivation, formula reasoning, and final result |
| `reasoning` | Given clues, deduction flow, elimination logic, and final conclusion |
| `science` | Concept explanation, core principle, and structured answer |
| `theory` | Clear notes, real-world intuition, and exam-ready summary |
| `general` | Clean structured explanation with key concepts and final answer |

Users can explicitly choose a category on the solver page, and the backend also applies lightweight question-type detection when the category is left broad.

---

## 🤖 AI Model Routing & Caching

Doubtly utilizes a dual-model approach along with in-memory caching to optimize both response quality and API costs.

### Caching
All AI explanations and follow-ups are cached using `node-cache` (1-hour TTL). If a user asks the exact same question or follow-up, Doubtly serves the response instantly from memory, avoiding duplicate API calls.

### Model Routing
| Provider | Model | Best For | 
|----------|-------|----------|
| Gemma | `google/gemma-4-31b-it` | Fast, structured math/reasoning/general explanations |
| Qwen | `qwen/qwen3.5-122b-a10b` | Coding-heavy tasks and detailed theory/comparison answers |

The chosen model is stored with each saved doubt (`aiProvider`, `aiModel`) so follow-ups and practice questions continue using the same model that solved the original doubt.

---

## 🎨 Design System

**Aesthetic Direction:** Cosmic Luxury — A futuristic, space-inspired dark theme

- **Color Palette:** Deep space blacks, electric cyan, violet, amber accents
- **Typography:** Space Grotesk (display), Inter (body), JetBrains Mono (code)
- **Effects:** Glassmorphism, orbital animations, floating orbs, ambient noise texture
- **Interactions:** Spring animations, glowing hover states, micro-interactions

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Text input → AI explanation | ✅ |
| Image upload → OCR → AI explanation | ✅ |
| Adaptive response modes by question type | ✅ |
| Auto model routing (Gemma/Qwen) | ✅ |
| Coding answers with proper code blocks | ✅ |
| Math answers with step-by-step solutions | ✅ |
| Reasoning answers with logic breakdowns | ✅ |
| Key concepts extraction | ✅ |
| Final answer highlight | ✅ |
| ELI5 (Explain Like I'm 5) mode | ✅ |
| Follow-up question chat | ✅ |
| Practice question generation | ✅ |
| Query history & search | ✅ |
| Category filtering (`general`, `math`, `coding`, `reasoning`, `science`, `theory`) | ✅ |
| Responsive design | ✅ |
| Premium animations | ✅ |

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `DB_FALLBACK_MODE` | `file` uses local JSON storage when MongoDB is unavailable | No |
| `NVIDIA_API_KEY` | Google Gemini + NVIDIA Kimi API key (Gemma) | Yes* |
| `NVIDIA_QWEN_API_KEY` | Google Gemini + NVIDIA Kimi API key (Qwen) | No (recommended) |
| `NVIDIA_API_URL` | NVIDIA chat completions endpoint | No |
| `NVIDIA_MODEL` | NVIDIA-hosted model ID | No |
| `NVIDIA_QWEN_MODEL` | NVIDIA-hosted Qwen model ID | No |
| `NVIDIA_ENABLE_THINKING` | Enable Gemma thinking mode | No |
| `NVIDIA_QWEN_ENABLE_THINKING` | Enable Qwen thinking mode | No |
| `NVIDIA_EXPLANATION_TIMEOUT_MS` | Timeout for main solve request | No |
| `NVIDIA_FOLLOWUP_TIMEOUT_MS` | Timeout for follow-up requests | No |
| `NVIDIA_PRACTICE_TIMEOUT_MS` | Timeout for practice generation | No |
| `PORT` | Backend server port (default: 5000) | No |
| `CLIENT_URL` | Frontend URL for CORS (default: http://localhost:5173) | No |

`*` At least one of `NVIDIA_API_KEY` or `NVIDIA_QWEN_API_KEY` must be set. For best routing, set both.

---

## 📝 License

This project is for educational purposes. Built with ❤️ using AI.
