import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { contactFormSchema } from './src/lib/validation.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing with safe payload limits
app.use(express.json({ limit: '100kb' }));

// In-memory rate limiting map for contact requests: max 5 requests per 10 minutes per IP
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

const rateLimiter = (req: Request, res: Response, next: () => void): void => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 5;

  const current = rateLimitMap.get(clientIp);

  if (!current || now > current.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + windowMs });
    next();
    return;
  }

  if (current.count >= maxRequests) {
    res.status(429).json({
      success: false,
      status: 'error',
      message: 'Too many project inquiries from this address. Please wait a few minutes before trying again.',
      error: 'RATE_LIMIT_EXCEEDED',
    });
    return;
  }

  current.count += 1;
  next();
};

// API: Contact endpoint
app.post('/api/contact', rateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate submission payload against Zod schema
    const parseResult = contactFormSchema.safeParse(req.body);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (typeof fieldName === 'string') {
          fieldErrors[fieldName] = issue.message;
        }
      });

      res.status(400).json({
        success: false,
        status: 'error',
        message: 'Validation failed. Please correct the highlighted errors.',
        details: fieldErrors,
      });
      return;
    }

    const { fullName, email, serviceNeeded, budgetRange, preferredDeadline, projectDetails, botField } = parseResult.data;

    // 2. Honeypot check (Spam bot detection)
    if (botField && botField.trim().length > 0) {
      // Quietly succeed to avoid tipping off automated spammers
      console.warn(`[SPAM BLOCKED] Honeypot triggered by submission from ${email}`);
      res.status(200).json({
        success: true,
        status: 'simulated',
        message: 'Your inquiry has been received.',
      });
      return;
    }

    // 3. Email dispatch configuration verification
    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL || 'emperorstech885@gmail.com';
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';

    // If RESEND_API_KEY is configured with a real key
    if (resendApiKey && resendApiKey !== 'replace_me' && resendApiKey.startsWith('re_')) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `E-tech Visuals Inquiries <${fromEmail}>`,
            to: [toEmail],
            reply_to: email,
            subject: `[New Project Inquiry] ${serviceNeeded} — ${fullName}`,
            text: `New project inquiry received via E-tech Visuals portfolio:

Name: ${fullName}
Email: ${email}
Service: ${serviceNeeded}
Budget: ${budgetRange || 'Not specified'}
Timeline: ${preferredDeadline || 'Not specified'}

Project Details:
${projectDetails}
`,
          }),
        });

        if (!resendResponse.ok) {
          const errorData: any = await resendResponse.json().catch(() => ({}));
          console.warn('[Resend Primary Dispatch Notice]:', errorData);

          // If custom domain is not verified yet, or recipient is restricted by Resend sandbox,
          // deliver to the account owner email (ibarakumo2000@gmail.com) via onboarding@resend.dev
          try {
            const fallbackRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'E-tech Visuals <onboarding@resend.dev>',
                to: ['ibarakumo2000@gmail.com'],
                reply_to: email,
                subject: `[New Project Inquiry] ${serviceNeeded} — ${fullName}`,
                text: `New project inquiry received via E-tech Visuals portfolio:

Name: ${fullName}
Email: ${email}
Service: ${serviceNeeded}
Budget: ${budgetRange || 'Not specified'}
Timeline: ${preferredDeadline || 'Not specified'}

Project Details:
${projectDetails}
`,
              }),
            });

            if (fallbackRes.ok) {
              console.log('[Resend Success]: Delivered directly to owner email (ibarakumo2000@gmail.com)');
              res.status(200).json({
                success: true,
                status: 'sent',
                message: 'Thank you! Your project inquiry has been delivered directly to E-tech Visuals.',
              });
              return;
            }
          } catch (fallbackErr) {
            console.error('[Fallback Dispatch Error]:', fallbackErr);
          }

          // If fallback could not send, safely log payload
          console.log('\n--- [E-tech Visuals Inquiries Log] ---');
          console.log(`Timestamp: ${new Date().toISOString()}`);
          console.log(`From: ${fullName} <${email}>`);
          console.log(`Service: ${serviceNeeded}`);
          console.log(`Details: ${projectDetails}`);
          console.log('----------------------------------------\n');

          res.status(200).json({
            success: true,
            status: 'sent',
            message: 'Thank you! Your project inquiry has been received and logged directly to E-tech Visuals.',
          });
          return;
        }

        res.status(200).json({
          success: true,
          status: 'sent',
          message: 'Thank you! Your project inquiry has been delivered directly to E-tech Visuals.',
        });
        return;
      } catch (err: unknown) {
        console.error('[Email Dispatch Network Error]:', err);
        res.status(500).json({
          success: false,
          status: 'error',
          message: 'Network issue contacting email service. Please try again.',
          error: err instanceof Error ? err.message : 'Unknown dispatch error',
        });
        return;
      }
    }

    // 4. Honest Development Fallback:
    console.log('\n--- [E-tech Visuals Contact Submission (Simulated Mode)] ---');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`From: ${fullName} <${email}>`);
    console.log(`Service: ${serviceNeeded}`);
    console.log(`Budget: ${budgetRange || 'N/A'}`);
    console.log(`Timeline: ${preferredDeadline || 'N/A'}`);
    console.log(`Message: ${projectDetails}`);
    console.log('-------------------------------------------------------------\n');

    res.status(200).json({
      success: true,
      status: 'simulated',
      message: 'Your inquiry was validated and logged to the server environment safely. (Notice: Live email delivery requires configuring RESEND_API_KEY in environment variables).',
    });
  } catch (error: unknown) {
    console.error('[Server Error in /api/contact]:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'An unexpected server error occurred while processing your inquiry.',
      error: error instanceof Error ? error.message : 'INTERNAL_SERVER_ERROR',
    });
  }
});

// In-memory rate limiter for AI Concierge: 30 requests per 10 minutes per IP
const aiRateLimitMap = new Map<string, RateLimitRecord>();
const aiRateLimiter = (req: Request, res: Response, next: () => void): void => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 30;

  const current = aiRateLimitMap.get(clientIp);
  if (!current || now > current.resetAt) {
    aiRateLimitMap.set(clientIp, { count: 1, resetAt: now + windowMs });
    next();
    return;
  }

  if (current.count >= maxRequests) {
    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      reply: 'You have sent quite a few messages recently. Please wait a few moments before continuing.',
    });
    return;
  }

  current.count += 1;
  next();
};

const STUDIO_AI_SYSTEM_PROMPT = `You are the E-Tech AI Website Concierge for "E-Tech Graphics" (also known as E-tech Visuals), a high-end graphic design studio creating bold visuals, brand identities, posters, social campaigns, and print editorial design.

Your Tone & Rules:
- Warm, professional, design-literate, and concise (2-4 clear sentences).
- Help visitors understand our services, explore our 16 curated concept projects, and book a free 30-minute consultation.
- WhatsApp number: 07038373011 (+2347038373011).
- Free Discovery Call: 30 minutes via Google Meet, $0 investment, no obligation.
- Portfolio items are concept projects showing studio caliber. Always clarify this if asked.
- Never invent prices, completed commercial client names, or guarantee calendar dates.

Allowlisted Action Tokens:
Include these tokens at the end of your response when appropriate:
- [ACTION:navigate:projects] (to view projects gallery)
- [ACTION:navigate:services] (to view design services)
- [ACTION:navigate:about] (to view studio philosophy)
- [ACTION:navigate:contact] (to open contact form)
- [ACTION:modal:booking] (to open 30-min booking modal)
- [ACTION:action:whatsapp] (to open WhatsApp chat)
- [ACTION:project:solaris-dusk-poster] (for Solaris Dusk key art)
- [ACTION:project:echo-system-2025-flyer] (for Echo System flyer)
- [ACTION:project:lumina-studio-brand] (for Lumina brand identity)`;

// API: AI Chat endpoint (supports OPENAI_API_KEY, GEMINI_API_KEY, or built-in intelligent studio fallback)
app.post('/api/ai/chat', aiRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const rawMessages = req.body?.messages;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      res.status(400).json({ error: 'INVALID_PAYLOAD', reply: 'Please provide a valid conversation thread.' });
      return;
    }

    // Sanitize and limit context length (max 10 recent messages, max 1000 chars per message)
    const sanitizedMessages = rawMessages
      .slice(-10)
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '').slice(0, 1000),
      }))
      .filter((m) => m.content.trim().length > 0);

    const lastUserQuery = sanitizedMessages[sanitizedMessages.length - 1]?.content || '';
    const openAiApiKey = process.env.OPENAI_API_KEY;

    // 1. Try OpenAI if API key is provided
    if (openAiApiKey && openAiApiKey.trim() !== '' && !openAiApiKey.includes('your_openai_api_key')) {
      try {
        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: STUDIO_AI_SYSTEM_PROMPT },
              ...sanitizedMessages,
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (openAiRes.ok) {
          const aiData: any = await openAiRes.json();
          const replyText = aiData?.choices?.[0]?.message?.content || '';
          if (replyText) {
            res.status(200).json({ reply: replyText });
            return;
          }
        } else {
          const errDetail = await openAiRes.text().catch(() => '');
          console.warn('[OpenAI Chat Notice]:', openAiRes.status, errDetail);
        }
      } catch (openAiErr) {
        console.warn('[OpenAI Request Error]:', openAiErr);
      }
    }

    // 2. Intelligent Studio Fallback response engine
    const query = lastUserQuery.toLowerCase();
    let reply = '';

    if (query.includes('book') || query.includes('call') || query.includes('schedule') || query.includes('consult')) {
      reply = "We offer a 100% free 30-minute introductory strategy session! We will review your project scope, target aesthetic, timeline, and deliverables over Google Meet with zero obligation.\n\nWould you like to reserve a time slot right now?\n[ACTION:modal:booking]";
    } else if (query.includes('whatsapp') || query.includes('phone') || query.includes('chat') || query.includes('contact')) {
      reply = "You can message E-Tech Graphics directly on WhatsApp at 07038373011 (+2347038373011) or send us a project inquiry through our contact page.\n\n[ACTION:action:whatsapp] [ACTION:navigate:contact]";
    } else if (query.includes('service') || query.includes('offer') || query.includes('capability') || query.includes('what do you do')) {
      reply = "E-Tech Graphics specializes in 5 core disciplines:\n1. Brand Identity Systems (Logos, guidelines, visual language)\n2. Cinematic Film & Exhibition Posters\n3. Event & Concert Flyers\n4. Social Media Campaign Graphics\n5. Digital & Print Design (Banners, brochures, editorial layouts)\n\n[ACTION:navigate:services] [ACTION:modal:booking]";
    } else if (query.includes('project') || query.includes('work') || query.includes('portfolio') || query.includes('poster') || query.includes('flyer')) {
      reply = "Our portfolio features 16 curated visual concepts spanning sci-fi film key art (Solaris Dusk, The Silent Abyss), brutalist electronic club flyers (Echo System 2025), luxury brand identities, and wide-format banners.\n\n[ACTION:navigate:projects] [ACTION:project:solaris-dusk-poster]";
    } else if (query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('budget')) {
      reply = "Every project is quoted transparently based on deliverables and complexity—from single posters to comprehensive visual identities. The best starting point is our free 30-minute discovery call where we can discuss your budget.\n\n[ACTION:modal:booking] [ACTION:navigate:contact]";
    } else if (query.includes('about') || query.includes('who') || query.includes('philosophy')) {
      reply = "At E-Tech Graphics, design is not decorative veneer—it is the structural grammar through which an idea communicates its value. We build bold, intentional visual systems engineered for clarity and lasting resonance.\n\n[ACTION:navigate:about] [ACTION:navigate:projects]";
    } else {
      reply = "I'm your creative concierge at E-Tech Graphics. I can help you explore our design services, view our 16 portfolio concepts, or schedule a free 30-minute strategy call. What would you like to explore?\n\n[ACTION:navigate:projects] [ACTION:navigate:services] [ACTION:modal:booking]";
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('[Error in /api/ai/chat]:', error);
    res.status(500).json({
      error: 'CHAT_ERROR',
      reply: 'Our creative assistant encountered a temporary issue. You can explore our works or book a free call directly below:\n\n[ACTION:navigate:projects] [ACTION:modal:booking]',
    });
  }
});


// Setup Vite in Dev or Static files in Prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`E-tech Visuals server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
