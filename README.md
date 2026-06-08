# Assertive Communication Coach 🧠💬

An interactive, AI-powered communication trainer designed to help users transform their messages into clear, respectful, and assertive dialogue. It provides instant analysis, communication style classification, scoring, actionable feedback, and educational explanations to teach users *why* and *how* to set healthy boundaries.

---

## 🌟 Key Features

- **AI-Powered Communication Analysis**: Classifies messages as **Passive**, **Aggressive**, **Passive-Aggressive**, or **Assertive**.
- **Assertiveness Scoring (0-100)**: Evaluates message tone and gives detailed scoring with colored progress indicators.
- **Motivational Badges (Gamification)**: Rewards users with badges like *Communication Explorer*, *Developing Communicator*, *Confident Communicator*, or *Assertiveness Master* based on their score.
- **Educational Explanations**: Teaches communication science and interpersonal dynamics, explaining the core issues and how the improved message resolves them.
- **Instant Rewriting**: Rewrites messages to match assertive communication principles while maintaining the user's intent.
- **Context Awareness**: Optimizes feedback for specific situations: *Work*, *University*, *Family*, *Friends*, *Customer Service*, or *Other*.
- **Quick-Load Presets**: Let users immediately test the app with typical passive or aggressive messages.
- **Coach Session Logs**: Stores recent session analyses in client-side storage (`localStorage`) so users can track their progress without needing account registration.
- **100% Stateless & Private**: No databases, no user accounts, and no authentication required.

---

## 🛠️ Tech Stack

### Frontend
- **React 19**: Responsive view rendering.
- **Vite**: Ultra-fast build tool and local development server.
- **TypeScript**: Typesafe code structure.
- **Tailwind CSS**: Modern utility-first styling with smooth gradient themes and glassmorphism panels.
- **Lucide React**: Clean and elegant iconography.

### Backend & API
- **Vercel Serverless Functions**: Node.js/TypeScript functions deployed automatically on Vercel's edge network.
- **OpenAI Node SDK**: Powering message evaluation and rewrites using standard GPT models (`gpt-4o-mini`).

### Local Development Support
- **Vite Dev Server API Middleware**: A custom Vite configuration middleware that runs the API routes locally during `npm run dev`. This means you can run, test, and develop the entire application (including the AI backend) without installing or running the Vercel CLI locally!

---

## 🚀 Local Development Setup

Follow these steps to get the project running locally in seconds.

### 1. Clone the repository and enter the directory:
```bash
cd assertive-communication-coach
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Configure Environment Variables:
Copy the template `.env.example` file to create a `.env` file in the root:
```bash
copy .env.example .env
```
Open the `.env` file and replace `your_openai_api_key_here` with your actual OpenAI API Key:
```env
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_OPENAI_KEY_HERE
OPENAI_MODEL=gpt-4o-mini
```

### 4. Run the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The app is now fully functional, and calls to `/api/improve-message` will execute locally using the API key from your `.env` file.

---

## ☁️ Deployment

The application is fully optimized to be deployed instantly on Vercel.

### Option 1: Vercel CLI (Recommended)
Make sure you have the [Vercel CLI](https://vercel.com/cli) installed, then run the following in the project root:

```bash
# Login to Vercel (if not already logged in)
vercel login

# Deploy the project
vercel deploy --prod
```

During the deployment process:
1. Accept the defaults to set up the project.
2. After deployment, navigate to your Vercel Dashboard, select your project, go to **Settings** ➔ **Environment Variables**, and add:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `OPENAI_MODEL`: `gpt-4o-mini` (Optional, defaults to `gpt-4o-mini`)
3. Redeploy or restart the deployment to apply the environment variables.

### Option 2: Vercel Git Integration
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the repository into your Vercel Dashboard.
3. Vercel will auto-detect the **Vite** preset.
4. Add the `OPENAI_API_KEY` to the **Environment Variables** section before clicking **Deploy**.
5. Vercel will automatically build the React app and deploy the backend Serverless Function in the `api` folder.

---

## 🔒 Security & Input Validation

- **No Exposed API Keys**: The frontend makes standard client calls to `/api/improve-message`. The OpenAI API key is kept completely secret on the server environment.
- **Input Character Limit**: The backend and frontend enforce a strict maximum length of **1500 characters** to prevent abuse and manage API token costs.
- **Input Sanitization**: Validates parameters on the server-side, verifying data types and checking for empty requests before forwarding to the AI completion service.
- **Errors Gracefully Handled**: Rate limits, missing keys, and parsing failures return user-friendly, descriptive errors without crashing the app.
