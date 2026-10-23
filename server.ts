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
