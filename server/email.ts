import { Resend } from 'resend';

let resend: Resend | undefined;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn('RESEND_API_KEY not set; emails will not be sent.');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const emailData: any = {
      from: params.from,
      to: params.to,
      subject: params.subject,
    };
    
    if (params.html) {
      emailData.html = params.html;
    } else if (params.text) {
      emailData.text = params.text;
    }
    
    if (resend) {
      await resend.emails.send(emailData);
      return true;
    } else {
      console.info('Email skipped: RESEND_API_KEY not configured');
      return false;
    }
  } catch (error) {
    console.error('Resend email error:', error);
    return false;
  }
}

export async function notifyGraceOfNewSubscriber(subscriberEmail: string): Promise<boolean> {
  const emailContent = {
    to: 'graceperiodartist@gmail.com',
    from: 'Grace Period <onboarding@resend.dev>',
    subject: '🎵 Amazing! New Grace Period subscriber!',
    text: `Hey Grace!

Exciting news! Someone just joined the Grace Period family! 🎉

New subscriber: ${subscriberEmail}

Your music is reaching more people every day. Keep creating that magic! ✨

Time: ${new Date().toLocaleString()}

Much love,
Your Grace Period website 💕`,
    html: `
      <div style="font-family: 'Piazzolla', serif; color: #3d405b; line-height: 1.6; max-width: 600px;">
        <h2 style="color: #e22a43; font-size: 24px; margin-bottom: 20px;">🎵 Amazing! New Grace Period subscriber!</h2>
        
        <p style="font-size: 18px; margin-bottom: 20px;">Hey Grace!</p>
        
        <p style="margin-bottom: 20px;">Exciting news! Someone just joined the Grace Period family! 🎉</p>
        
        <div style="background: #f4f1de; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <strong style="color: #e22a43;">New subscriber:</strong> ${subscriberEmail}
        </div>
        
        <p style="margin-bottom: 20px;">Your music is reaching more people every day. Keep creating that magic! ✨</p>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Time: ${new Date().toLocaleString()}<br>
          Much love,<br>
          <strong style="color: #e22a43;">Your Grace Period website 💕</strong>
        </p>
      </div>
    `
  };

  return sendEmail(emailContent);
}