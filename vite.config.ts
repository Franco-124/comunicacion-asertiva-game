import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import OpenAI from 'openai'
import type { IncomingMessage } from 'http'

// Helper to parse JSON body from standard IncomingMessage
function getRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: unknown) => {
      body += chunk;
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', (err: Error) => {
      reject(err);
    });
  });
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/improve-message' && req.method === 'POST') {
              res.setHeader('Content-Type', 'application/json');
              
              try {
                const bodyText = await getRequestBody(req);
                interface ExpectedBody {
                  original_message?: string;
                  message?: string;
                  user_rewrite?: string;
                  context?: string;
                }
                let body: ExpectedBody = {};
                try {
                  body = JSON.parse(bodyText || '{}') as ExpectedBody;
                } catch {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Invalid JSON request body.' }));
                  return;
                }

                const originalMessage = body.original_message || body.message;
                const userRewrite = body.user_rewrite || '';
                const { context } = body;

                // Validate request messages
                if (originalMessage === undefined || originalMessage === null) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'El mensaje original es requerido.' }));
                  return;
                }

                const trimmedOriginal = originalMessage.trim();
                if (trimmedOriginal.length === 0) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'El mensaje original no puede estar vacío.' }));
                  return;
                }

                if (trimmedOriginal.length > 1500) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'El mensaje original excede los 1500 caracteres.' }));
                  return;
                }

                const trimmedRewrite = userRewrite.trim();
                if (trimmedRewrite.length === 0) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Por favor, escribe tu versión optimizada antes de enviar.' }));
                  return;
                }

                if (trimmedRewrite.length > 1500) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Tu reescritura excede los 1500 caracteres.' }));
                  return;
                }

                // Get API Key
                const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
                if (!apiKey) {
                  console.error('Local Dev Warning: OPENAI_API_KEY environment variable is not defined.');
                  res.statusCode = 500;
                  res.end(JSON.stringify({
                    error: 'OpenAI API key is missing. Please create a .env file with OPENAI_API_KEY=your_key_here'
                  }));
                  return;
                }

                // Context processing
                const validContexts = ['Trabajo', 'University', 'Universidad', 'Family', 'Familia', 'Friends', 'Amigos', 'Customer Service', 'Servicio al Cliente', 'Pareja', 'Other', 'Otro'];
                let selectedContext = 'Otro';
                if (context && typeof context === 'string') {
                  const normalized = context.trim().toLowerCase();
                  const matched = validContexts.find(c => c.toLowerCase() === normalized);
                  if (matched) {
                    selectedContext = matched;
                  }
                }

                // OpenAI Init
                const openai = new OpenAI({ apiKey });
                const model = env.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';

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
                  throw new Error('Empty response from OpenAI');
                }

                // Parse and send
                const parsedResult = JSON.parse(content);
                
                // Add robust default corrections
                const VALID_STYLES = ['Passive', 'Aggressive', 'Passive-Aggressive', 'Assertive'];
                if (!parsedResult.communication_style || !VALID_STYLES.includes(parsedResult.communication_style)) {
                  parsedResult.communication_style = 'Assertive';
                }
                const cleanScore = (val: unknown) => {
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

                res.statusCode = 200;
                res.end(JSON.stringify(parsedResult));

              } catch (err: unknown) {
                console.error('Local Dev API Error:', err);
                const errorObj = err as { status?: number; message?: string };
                res.statusCode = typeof errorObj.status === 'number' ? errorObj.status : 500;
                res.end(JSON.stringify({
                  error: typeof errorObj.message === 'string' ? errorObj.message : 'An unexpected error occurred while analyzing your message.'
                }));
              }
            } else {
              next();
            }
          });
        }
      }
    ]
  }
})

