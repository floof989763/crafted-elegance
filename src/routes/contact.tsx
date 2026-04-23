import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Your name").max(120),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Tell us a little").max(4000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — The Woods" },
      {
        name: "description",
        content: "Inquire about a piece, a commission, or a visit to the atelier.",
      },
      { property: "og:title", content: "Contact — The Woods" },
      {
        property: "og:description",
        content: "Send us a note. We answer every letter, slowly and personally.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = inquirySchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
      status: "new",
    });
    setSubmitting(false);

    if (error) {
      setErrors({ message: "Something went wrong. Please try again." });
      return;
    }

    setSuccess(true);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <SiteShell>
      <section className="pt-40 md:pt-48 pb-12">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl text-ink leading-[0.92] max-w-4xl">
            Write us a<br />
            <em className="text-brass">letter.</em>
          </h1>
          <p className="mt-8 max-w-md text-muted-foreground">
            About a piece, a commission, a visit to the atelier — every note is read
            and answered by a real person, often within a day.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 space-y-10">
            <Info icon={MapPin} title="The atelier" lines={["The Woods Atelier", "Nakhasa Bazar, Saharanpur", "Uttar Pradesh, India · By appointment"]} />
            <Info icon={Mail} title="Email" lines={["mohdumar20052004@gmail.com"]} />
            <Info icon={Phone} title="Telephone" lines={["+91 70557 62173"]} />
            <div className="hairline" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Studio hours are Tuesday through Saturday, 10am – 5pm. Visits are by
              appointment only — we keep our space quiet for the work.
            </p>
          </div>

          <div className="lg:col-span-8">
            {success ? (
              <div className="border border-border rounded-sm p-12 md:p-16 text-center">
                <CheckCircle2 className="w-10 h-10 text-brass mx-auto" strokeWidth={1.2} />
                <h2 className="mt-6 font-display text-4xl text-ink">Letter received.</h2>
                <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                  Thank you. We'll write back personally, often within a day or two.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-10 text-xs uppercase tracking-[0.28em] text-brass luxe-link"
                >
                  Send another note
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <Field label="Name" error={errors.name}>
                    <input
                      value={form.name}
                      onChange={onChange("name")}
                      className="field-input"
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={onChange("email")}
                      className="field-input"
                      autoComplete="email"
                    />
                  </Field>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <Field label="Telephone (optional)" error={errors.phone}>
                    <input
                      value={form.phone}
                      onChange={onChange("phone")}
                      className="field-input"
                      autoComplete="tel"
                    />
                  </Field>
                  <Field label="Subject (optional)" error={errors.subject}>
                    <input
                      value={form.subject}
                      onChange={onChange("subject")}
                      className="field-input"
                    />
                  </Field>
                </div>
                <Field label="Message" error={errors.message}>
                  <textarea
                    value={form.message}
                    onChange={onChange("message")}
                    rows={8}
                    className="field-input resize-none"
                  />
                </Field>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-cream text-ink text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Sending…" : "Send the letter"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .field-input {
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 1px solid var(--color-border);
          padding: 0.75rem 0;
          color: var(--color-foreground);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.4s var(--ease-luxe);
        }
        .field-input:focus {
          border-bottom-color: var(--color-accent);
        }
      `}</style>
    </SiteShell>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-3">{label}</span>
      {children}
      {error && <span className="text-destructive text-xs mt-2 block">{error}</span>}
    </label>
  );
}

function Info({
  icon: Icon,
  title,
  lines,
}: {
  icon: typeof Mail;
  title: string;
  lines: string[];
}) {
  return (
    <div className="space-y-3">
      <Icon className="w-5 h-5 text-brass" strokeWidth={1.4} />
      <p className="eyebrow">{title}</p>
      {lines.map((l, i) => (
        <p key={i} className="text-sm text-ink/80">
          {l}
        </p>
      ))}
    </div>
  );
}
