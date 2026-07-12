import { Resend } from "resend";

let client: Resend | null = null;

const getClient = (): Resend => {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY no configurada");
    client = new Resend(apiKey);
  }
  return client;
};

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

const sendEmail = async ({ to, subject, html }: SendEmailParams): Promise<void> => {
  const { error } = await getClient().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Error enviando email: ${error.message}`);
  }
};

export const ResendService = { sendEmail };