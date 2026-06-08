import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file during local runs
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve __dirname in ES modules environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Enable CORS and Preflight OPTIONS for external API requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Message Evaluation API Endpoint
app.post('/api/improve-message', async (req, res) => {
  try {
    const { original_message, message, user_rewrite, context } = req.body;
    
    // Fallback for original message mapping
    const originalMessage = original_message || message;
    const userRewrite = user_rewrite || '';

    // Validate original message
    if (originalMessage === undefined || originalMessage === null) {
      return res.status(400).json({ error: 'El mensaje original es requerido.' });
    }

    const trimmedOriginal = originalMessage.trim();
    if (trimmedOriginal.length === 0) {
      return res.status(400).json({ error: 'El mensaje original no puede estar vacío.' });
    }

    if (trimmedOriginal.length > 1500) {
      return res.status(400).json({
        error: `El mensaje original excede los 1500 caracteres.`
      });
    }

    // Validate user rewrite
    const trimmedRewrite = userRewrite.trim();
    if (trimmedRewrite.length === 0) {
      return res.status(400).json({ error: 'Por favor, escribe tu versión optimizada antes de enviar.' });
    }

    if (trimmedRewrite.length > 1500) {
      return res.status(400).json({
        error: `Tu reescritura excede los 1500 caracteres.`
      });
    }

    // Context validation
    const validContexts = ['Trabajo', 'University', 'Universidad', 'Family', 'Familia', 'Friends', 'Amigos', 'Customer Service', 'Servicio al Cliente', 'Pareja', 'Other', 'Otro'];
    let selectedContext = 'Otro';
    if (context && typeof context === 'string') {
      const normalized = context.trim().toLowerCase();
      const matched = validContexts.find(c => c.toLowerCase() === normalized);
      if (matched) {
        selectedContext = matched;
      }
    }

    // Verify API Key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Production Error: OPENAI_API_KEY is not defined.');
      return res.status(500).json({
        error: 'La clave API de OpenAI no está configurada en el servidor.'
      });
    }

    // Initialize OpenAI Client
    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const systemPrompt = `You are an expert in assertive communication, emotional intelligence, interpersonal communication, and conflict resolution.

You will evaluate a player's attempt to rewrite a poorly written message into an assertive one.

Original Message (Poorly Written): "${trimmedOriginal}"
Context: "${selectedContext}"
Player's Rewritten Version: "${trimmedRewrite}"

Evaluate the player's rewritten version based on 4 sub-scores (0-100):
1. Empatía (Empathy): Does the rewritten message show understanding of the other person's perspective, feelings, or situation?
2. Respeto (Respect): Is the tone respectful, constructive, and free of blame, sarcasm, insults, or passive-aggressive elements?
3. Claridad (Clarity): Is the message clear, direct, and understandable? Does it state the request or boundary without beating around the bush?
4. Asertividad (Assertiveness): Does it effectively and firmly express the sender's own needs, boundaries, or feelings while maintaining politeness?

Compute the overall Assertiveness Score (0-100) as the average of these four scores.

Classify the player's rewritten version as EXACTLY one of:
* Passive
* Aggressive
* Passive-Aggressive
* Assertive

Provide the feedback in Spanish.

Your response must be in JSON format matching the following schema:
{
  "communication_style": string,
  "empathy_score": number,
  "respect_score": number,
  "clarity_score": number,
  "assertiveness_subscore": number,
  "assertiveness_score": number,
  "issues": string[],
  "improved_message": string,
  "explanation": string
}

Instructions for fields:
- "communication_style": Must be EXACTLY one of: "Passive", "Aggressive", "Passive-Aggressive", "Assertive"
- "issues": Any remaining communication issues in the PLAYER's rewritten version. Return an empty array if the player's version is already excellent.
- "improved_message": Your own ultimate masterfully rewritten assertive version of the ORIGINAL poorly written message.
- "explanation": A detailed, encouraging feedback message in Spanish explaining:
  1. What they did well (e.g. they showed empathy or stated their request clearly).
  2. What could be improved in their rewrite (referencing the scores).
  3. Why the AI's suggested "improved_message" is optimal.
  Always write in a constructive, coaching tone. Never shame the user.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Evalúa mi reescritura.\nMensaje original: "${trimmedOriginal}"\nMi reescritura: "${trimmedRewrite}"\nContexto: ${selectedContext}` }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response content received from OpenAI.');
    }

    // Parse and validate JSON response
    const parsedResult = JSON.parse(content);
    
    // Add robust defaults
    const VALID_STYLES = ['Passive', 'Aggressive', 'Passive-Aggressive', 'Assertive'];
    if (!parsedResult.communication_style || !VALID_STYLES.includes(parsedResult.communication_style)) {
      parsedResult.communication_style = 'Assertive';
    }
    
    const cleanScore = (val) => {
      const num = typeof val === 'number' ? val : parseInt(String(val), 10);
      return isNaN(num) ? 50 : Math.max(0, Math.min(100, num));
    };

    parsedResult.empathy_score = cleanScore(parsedResult.empathy_score);
    parsedResult.respect_score = cleanScore(parsedResult.respect_score);
    parsedResult.clarity_score = cleanScore(parsedResult.clarity_score);
    parsedResult.assertiveness_subscore = cleanScore(parsedResult.assertiveness_subscore);
    parsedResult.assertiveness_score = cleanScore(parsedResult.assertiveness_score);

    if (!parsedResult.assertiveness_score) {
      parsedResult.assertiveness_score = Math.round(
        (parsedResult.empathy_score + parsedResult.respect_score + parsedResult.clarity_score + parsedResult.assertiveness_subscore) / 4
      );
    }

    if (!Array.isArray(parsedResult.issues)) {
      parsedResult.issues = [];
    }

    if (!parsedResult.improved_message) {
      parsedResult.improved_message = trimmedOriginal;
    }

    if (!parsedResult.explanation) {
      parsedResult.explanation = 'Tu mensaje ha sido evaluado.';
    }

    return res.status(200).json(parsedResult);

  } catch (error) {
    console.error('Server API Error:', error);
    const status = (error && typeof error === 'object' && 'status' in error) ? error.status : undefined;
    
    if (status === 429) {
      return res.status(429).json({
        error: 'El servicio de OpenAI está sobrecargado. Intenta de nuevo en unos momentos.'
      });
    }
    
    if (status === 401) {
      return res.status(500).json({
        error: 'Error de credenciales de OpenAI en el servidor.'
      });
    }

    return res.status(500).json({
      error: 'Ocurrió un error inesperado al evaluar tu mensaje. Por favor, intenta de nuevo.'
    });
  }
});

// Serve compiled static React app assets
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all other client requests to index.html (SPA Router support)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
