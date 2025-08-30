import nodemailer from "nodemailer";
import { Resend } from "resend";

import env from "./env";

const resend = new Resend(env.RESEND_API_KEY);

type EmailOptions = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
};

// ethereal email is used for development
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "linwood45@ethereal.email",
    pass: "bcmsvbYrh7FcT3EhBd",
  },
});
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    if (env.NODE_ENV === "production") {
      await resend.emails.send({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    }
    else {
      const info = await transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log("📧 Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  }
  catch (error) {
    console.error(error);
  }
}

export function magicLinkEmailTemplate(url: string) {
  return ` <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1f2937; font-size: 28px; margin: 0;">🎹 PianoPal</h1>
          </div>
          
          <h2 style="color: #374151; font-size: 24px; margin-bottom: 16px;">Welcome back!</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Click the button below to sign in to your PianoPal account:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" 
               style="display: inline-block; background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Sign In to PianoPal
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.4;">
            Or copy and paste this link into your browser:<br>
            <span style="word-break: break-all;">${url}</span>
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This link will expire in 10 minutes for security. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
`;
}
