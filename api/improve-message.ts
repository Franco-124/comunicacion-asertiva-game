import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Allowed communication styles
const VALID_STYLES = ['Passive', 'Aggressive', 'Passive-Aggressive', 'Assertive'];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 1. Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed. This endpoint only supports POST requests.',
    });
  }

  try {
    // 3. Extract and validate request body
    const body = req.body;
    if (!body) {
      return res.status(400).json({ error: 'Missing request body.' });
    }

    // Support both 'original_message' (game flow) and 'message' (fallback/previous flow)
    const originalMessage = body.original_message || body.message;
    const userRewrite = body.user_rewrite || '';
    const { context } = body;

    // Check original message presence
    if (originalMessage === undefined || originalMessage === null) {
      return res.status(400).json({ error: 'Original message field is required.' });
    }

    if (typeof originalMessage !== 'string') {
      return res.status(400).json({ error: 'Original message must be a string.' });
    }

    const trimmedOriginal = originalMessage.trim();
    if (trimmedOriginal.length === 0) {
      return res.status(400).json({ error: 'Original message cannot be empty.' });
    }

    if (trimmedOriginal.length > 1500) {
      return res.status(400).json({
        error: `Original message exceeds the maximum limit of 1500 characters.`
      });
    }

    // Check user rewrite presence and length
    if (typeof userRewrite !== 'string') {
      return res.status(400).json({ error: 'User rewrite must be a string.' });
    }

    const trimmedRewrite = userRewrite.trim();
    if (trimmedRewrite.length === 0) {
      return res.status(400).json({ error: 'Por favor, escribe tu versión optimizada antes de enviar.' });
    }

    if (trimmedRewrite.length > 1500) {
      return res.status(400).json({
        error: `Tu mensaje excede el límite máximo de 1500 caracteres (actualmente ${trimmedRewrite.length} caracteres).`
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

    // 4. Verify OpenAI API Key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Configuration Error: OPENAI_API_KEY is not defined.');
      return res.status(500).json({
        error: 'OpenAI API key is missing on the server. Please contact support or configure your environment variables.'
      });
    }

    // 5. Initialize OpenAI Client
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

    // 6. Call OpenAI API
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

    // 7. Parse and validate JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch {
      console.error('Failed to parse OpenAI JSON response:', content);
      return res.status(502).json({
        error: 'El modelo de IA generó una respuesta inválida. Por favor, intenta de nuevo.'
      });
    }

    // Validate fields inside the parsed JSON response
    const {
      communication_style,
      empathy_score,
      respect_score,
      clarity_score,
      assertiveness_subscore,
      assertiveness_score,
      issues,
      improved_message,
      explanation
    } = parsedResult;

    // Coerce communication style
    if (!communication_style || typeof communication_style !== 'string') {
      parsedResult.communication_style = 'Assertive';
    } else if (!VALID_STYLES.includes(communication_style)) {
      const matchedStyle = VALID_STYLES.find(s => s.toLowerCase() === communication_style.toLowerCase());
      parsedResult.communication_style = matchedStyle || 'Assertive';
    }

    // Coerce scores
    const cleanScore = (val: unknown) => {
      const num = typeof val === 'number' ? val : parseInt(String(val), 10);
      return isNaN(num) ? 50 : Math.max(0, Math.min(100, num));
    };

    parsedResult.empathy_score = cleanScore(empathy_score);
    parsedResult.respect_score = cleanScore(respect_score);
    parsedResult.clarity_score = cleanScore(clarity_score);
    parsedResult.assertiveness_subscore = cleanScore(assertiveness_subscore);
    parsedResult.assertiveness_score = cleanScore(assertiveness_score);

    // If overall score is missing, calculate average
    if (!assertiveness_score) {
      parsedResult.assertiveness_score = Math.round(
        (parsedResult.empathy_score + parsedResult.respect_score + parsedResult.clarity_score + parsedResult.assertiveness_subscore) / 4
      );
    }

    if (!Array.isArray(issues)) {
      parsedResult.issues = [];
    }

    if (!improved_message || typeof improved_message !== 'string') {
      parsedResult.improved_message = trimmedOriginal;
    }

    if (!explanation || typeof explanation !== 'string') {
      parsedResult.explanation = 'Tu mensaje ha sido evaluado por tu coach de comunicación.';
    }

    // 8. Return response
    return res.status(200).json(parsedResult);

  } catch (error: unknown) {
    console.error('Error handling improve-message API request:', error);
    
    // Check for specific OpenAI error types if possible
    const status = (error && typeof error === 'object' && 'status' in error) ? (error as { status?: number }).status : undefined;
    
    if (status === 429) {
      return res.status(429).json({
        error: 'El servicio de IA está recibiendo demasiadas consultas. Espera un momento y vuelve a intentarlo.'
      });
    }
    
    if (status === 401) {
      return res.status(500).json({
        error: 'Error de autenticación: La clave API de OpenAI del servidor no es válida.'
      });
    }

    return res.status(500).json({
      error: 'Ocurrió un error inesperado al analizar tu mensaje. Por favor, intenta más tarde.'
    });
  }
}
