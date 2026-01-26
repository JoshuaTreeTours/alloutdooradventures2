import nodemailer from "nodemailer";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 80;
const EMAIL_MAX_LENGTH = 120;
const SUBJECT_MAX_LENGTH = 120;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 1200;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
};

type RateLimitEntry = {
  count: number;
  start: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const getTrimmedString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const isJsonContentType = (contentType?: string | string[]) => {
  if (!contentType) {
    return false;
  }

  const header = Array.isArray(contentType) ? contentType[0] : contentType;
  return header.toLowerCase().includes("application/json");
};

const getClientIp = (request: any) => {
  const forwarded = request.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0]?.trim() || "unknown";
  }
  return request.socket?.remoteAddress || "unknown";
};

const isRateLimited = (ip: string) => {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, start: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
};

const sendWithResend = async (options: {
  apiKey: string;
  to: string;
  from: string;
  subject: string;
  text: string;
  replyTo: string;
}) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      reply_to: options.replyTo,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend error: ${response.status} ${details}`);
  }
};

const sendWithSmtp = async (options: {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo: string;
  secure: boolean;
}) => {
  const transport = nodemailer.createTransport({
    host: options.host,
    port: options.port,
    secure: options.secure,
    auth: {
      user: options.user,
      pass: options.pass,
    },
  });

  await transport.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    replyTo: options.replyTo,
  });
};

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") {
    response.status(405).json({ ok: false });
    return;
  }

  if (!isJsonContentType(request.headers?.["content-type"])) {
    response.status(415).json({ ok: false });
    return;
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    response.status(429).json({ ok: false });
    return;
  }

  let payload: ContactPayload = {};
  if (request.body && typeof request.body === "object") {
    payload = request.body;
  } else if (typeof request.body === "string") {
    try {
      payload = JSON.parse(request.body) as ContactPayload;
    } catch (error) {
      console.warn("Contact form received invalid JSON.", { error });
      response.status(400).json({ ok: false });
      return;
    }
  } else if (request.body) {
    payload = request.body as ContactPayload;
  }

  const name = getTrimmedString(payload.name);
  const email = getTrimmedString(payload.email);
  const subject = getTrimmedString(payload.subject);
  const message = getTrimmedString(payload.message);
  const website = getTrimmedString(payload.website);

  if (website) {
    response.status(200).json({ ok: true });
    return;
  }

  const errors: string[] = [];

  if (!name) {
    errors.push("Name is required.");
  } else if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    errors.push("Invalid name length.");
  }

  if (!email) {
    errors.push("Email is required.");
  } else if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.push("Invalid email.");
  }

  if (subject.length > SUBJECT_MAX_LENGTH) {
    errors.push("Invalid subject length.");
  }

  if (!message) {
    errors.push("Message is required.");
  } else if (
    message.length < MESSAGE_MIN_LENGTH ||
    message.length > MESSAGE_MAX_LENGTH
  ) {
    errors.push("Invalid message length.");
  }

  if (errors.length > 0) {
    response.status(400).json({ ok: false });
    return;
  }

  const contactToEmail = process.env.CONTACT_TO_EMAIL || "";
  const resendApiKey = process.env.RESEND_API_KEY || "";
  const smtpHost = process.env.SMTP_HOST || "";
  const smtpPort = Number(process.env.SMTP_PORT || "0");
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";
  const smtpFrom = process.env.SMTP_FROM || "";
  const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

  const messageSubject = subject || `New contact request from ${name}`;
  const messageText = `Name: ${name}\nEmail: ${email}\nSubject: ${subject || "(none)"}\n\n${message}`;

  const sender =
    smtpFrom || "All Outdoor Adventures <no-reply@alloutdooradventures.com>";

  const smtpConfigured = Boolean(
    smtpHost && smtpPort && smtpUser && smtpPass && contactToEmail
  );

  const resendConfigured = Boolean(resendApiKey && contactToEmail);

  if (!resendConfigured && !smtpConfigured) {
    console.warn(
      "Contact form submission received but no email provider is configured.",
      {
        name,
        email,
        subject,
        messageLength: message.length,
      }
    );
    response.status(200).json({ ok: true });
    return;
  }

  try {
    if (resendConfigured) {
      await sendWithResend({
        apiKey: resendApiKey,
        to: contactToEmail,
        from: sender,
        subject: messageSubject,
        text: messageText,
        replyTo: email,
      });
    } else if (smtpConfigured) {
      await sendWithSmtp({
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        pass: smtpPass,
        from: sender,
        to: contactToEmail,
        subject: messageSubject,
        text: messageText,
        replyTo: email,
        secure: smtpSecure,
      });
    }

    response.status(200).json({ ok: true });
  } catch (error) {
    console.warn("Contact form delivery failed.", {
      error,
      provider: resendConfigured ? "resend" : "smtp",
    });
    response.status(500).json({ ok: false });
  }
}
