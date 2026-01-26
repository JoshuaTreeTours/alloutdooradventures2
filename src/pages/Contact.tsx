import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { Link } from "wouter";

import Seo from "../components/Seo";
import { getStaticPageSeo } from "../utils/seo";

type ContactField = "name" | "email" | "subject" | "message" | "website";

type ContactFormState = Record<ContactField, string>;

type ContactErrors = Partial<Record<ContactField, string>>;

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 80;
const EMAIL_MAX_LENGTH = 120;
const SUBJECT_MAX_LENGTH = 120;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 1200;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getTrimmedValue = (value: string) => value.trim();

export default function Contact() {
  const seo = getStaticPageSeo("/contact");

  const [formState, setFormState] = useState<ContactFormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const updateField = (field: ContactField, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (values: ContactFormState) => {
    const nextErrors: ContactErrors = {};
    const trimmedName = getTrimmedValue(values.name);
    const trimmedEmail = getTrimmedValue(values.email);
    const trimmedSubject = getTrimmedValue(values.subject);
    const trimmedMessage = getTrimmedValue(values.message);

    if (!trimmedName) {
      nextErrors.name = "Name is required.";
    } else if (trimmedName.length < NAME_MIN_LENGTH) {
      nextErrors.name = "Name must be at least 2 characters.";
    } else if (trimmedName.length > NAME_MAX_LENGTH) {
      nextErrors.name = `Name must be ${NAME_MAX_LENGTH} characters or fewer.`;
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (trimmedEmail.length > EMAIL_MAX_LENGTH) {
      nextErrors.email = `Email must be ${EMAIL_MAX_LENGTH} characters or fewer.`;
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (trimmedSubject.length > SUBJECT_MAX_LENGTH) {
      nextErrors.subject = `Subject must be ${SUBJECT_MAX_LENGTH} characters or fewer.`;
    }

    if (!trimmedMessage) {
      nextErrors.message = "Message is required.";
    } else if (trimmedMessage.length < MESSAGE_MIN_LENGTH) {
      nextErrors.message = "Message must be at least 10 characters.";
    } else if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
      nextErrors.message = `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`;
    }

    return nextErrors;
  };

  const focusFirstError = (nextErrors: ContactErrors) => {
    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (nextErrors.subject) {
      subjectRef.current?.focus();
      return;
    }
    if (nextErrors.message) {
      messageRef.current?.focus();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setStatusMessage(null);

    const validationErrors = validateForm(formState);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      focusFirstError(validationErrors);
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          subject: formState.subject,
          message: formState.message,
          website: formState.website,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed.");
      }

      const payload: { ok?: boolean } = await response.json();

      if (!payload.ok) {
        throw new Error("Submission failed.");
      }

      setStatus("success");
      setStatusMessage("Thanks! Your message has been sent.");
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
      });
      setErrors({});
      requestAnimationFrame(() => statusRef.current?.focus());
    } catch (error) {
      setStatus("error");
      setStatusMessage("Something went wrong. Please try again soon.");
      requestAnimationFrame(() => statusRef.current?.focus());
    }
  };

  return (
    <>
      {seo ? (
        <Seo
          title={seo.title}
          description={seo.description}
          url={seo.url}
          image={seo.image}
        />
      ) : null}
      <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          Contact
        </p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Contact Outdoor Adventures
        </h1>
        <p className="mt-4 text-sm text-[#405040] md:text-base">
          All Outdoor Adventures is a Santa Barbara–based service business
          offering curated tours and custom journeys worldwide.
        </p>
        <p className="mt-4 text-sm text-[#405040] md:text-base">
          We design custom journeys, private group experiences, and multi-day
          adventures tailored to your pace and interests. Tell us what you&apos;re
          dreaming about, and we&apos;ll build a plan around it.
        </p>

        <section className="mt-10 rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-[#2f4a2f]">Send a message</h2>
          <p className="mt-2 text-sm text-[#405040]">
            Share the dates, group size, and the highlights you&apos;d love to include.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                Name
                <input
                  ref={nameRef}
                  name="name"
                  type="text"
                  value={formState.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  autoComplete="name"
                  maxLength={NAME_MAX_LENGTH}
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#1f2a1f] shadow-sm focus:border-[#2f4a2f] focus:outline-none"
                />
                {errors.name ? (
                  <span
                    id="contact-name-error"
                    className="text-xs font-medium text-[#b91c1c]"
                  >
                    {errors.name}
                  </span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                Email
                <input
                  ref={emailRef}
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  autoComplete="email"
                  maxLength={EMAIL_MAX_LENGTH}
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#1f2a1f] shadow-sm focus:border-[#2f4a2f] focus:outline-none"
                />
                {errors.email ? (
                  <span
                    id="contact-email-error"
                    className="text-xs font-medium text-[#b91c1c]"
                  >
                    {errors.email}
                  </span>
                ) : null}
              </label>
            </div>

            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
              Subject (optional)
              <input
                ref={subjectRef}
                name="subject"
                type="text"
                value={formState.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                autoComplete="off"
                maxLength={SUBJECT_MAX_LENGTH}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#1f2a1f] shadow-sm focus:border-[#2f4a2f] focus:outline-none"
              />
              {errors.subject ? (
                <span
                  id="contact-subject-error"
                  className="text-xs font-medium text-[#b91c1c]"
                >
                  {errors.subject}
                </span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
              Message
              <textarea
                ref={messageRef}
                name="message"
                value={formState.message}
                onChange={(event) => updateField("message", event.target.value)}
                autoComplete="off"
                rows={6}
                maxLength={MESSAGE_MAX_LENGTH}
                required
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#1f2a1f] shadow-sm focus:border-[#2f4a2f] focus:outline-none"
              />
              {errors.message ? (
                <span
                  id="contact-message-error"
                  className="text-xs font-medium text-[#b91c1c]"
                >
                  {errors.message}
                </span>
              ) : null}
            </label>

            <label className="sr-only">
              Website
              <input
                name="website"
                type="text"
                value={formState.website}
                onChange={(event) => updateField("website", event.target.value)}
                autoComplete="off"
                tabIndex={-1}
              />
            </label>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center justify-center rounded-full bg-[#2f4a2f] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#294129] disabled:cursor-not-allowed disabled:bg-[#8aa08a]"
                >
                  {status === "submitting" ? "Sending..." : "Send message"}
                </button>
                <p className="mt-2 text-xs text-[#7a8a6b]">
                  Spam is filtered automatically.
                </p>
              </div>
              <p className="text-xs text-[#7a8a6b]">
                We&apos;ll reply by email as soon as possible.
              </p>
            </div>

            <p
              ref={statusRef}
              tabIndex={-1}
              aria-live="polite"
              className={`text-sm font-medium ${
                status === "error" ? "text-[#b91c1c]" : "text-[#2f4a2f]"
              } ${statusMessage ? "block" : "sr-only"}`}
            >
              {statusMessage}
            </p>
          </form>
        </section>

        <section className="mt-12 rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-[#2f4a2f]">
            What happens next
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-[#405040]">
            <li>• A planning specialist reviews your request within 1 business day.</li>
            <li>• We curate a short list of trusted guides and partners.</li>
            <li>• You receive a tailored itinerary with clear pricing and timing.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/journeys">
              <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                Explore Journeys
              </a>
            </Link>
            <Link href="/tours">
              <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                Browse Tours
              </a>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
