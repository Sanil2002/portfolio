"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { contact, profile, socials } from "@/content/content";
import { bezier } from "@/lib/motion";
import { play } from "@/lib/sound";
import { Magnetic } from "@/components/ui/Magnetic";
import { TextReveal } from "@/components/ui/TextReveal";

type Fields = { name: string; email: string; message: string; company: string };
type Errors = Partial<Record<keyof Fields, string>>;

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Please enter a valid email.";
  if (f.message.trim().length < 10) e.message = "A few more words, please (10+ characters).";
  return e;
}

export function Contact() {
  const [f, setF] = useState<Fields>({ name: "", email: "", message: "", company: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.company) return; // honeypot: bots fill hidden fields
    const v = validate(f);
    setErrors(v);
    if (Object.keys(v).length) {
      document.getElementById(`c-${Object.keys(v)[0]}`)?.focus();
      return;
    }
    if (!FORMSPREE_ID) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${encodeURIComponent(FORMSPREE_ID)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: f.name, email: f.email, message: f.message }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      play("success");
    } catch {
      setStatus("error");
    }
  };

  const field = "w-full rounded-2xl border bg-ink-2 px-5 py-4 text-bone placeholder:text-mute/70 outline-none transition-colors focus:border-blaze";

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden py-[clamp(5rem,12vh,14rem)]">
      <div className="wrap">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-mute">Contact · {profile.availability}</p>
        <h2 id="contact-title" className="display text-[clamp(3.5rem,13vw,24rem)]">
          <TextReveal as="span" text={contact.headline[0]} className="block" />
          <TextReveal as="span" text={contact.headline[1]} accent={[contact.headline[1]]} className="block" />
        </h2>
        <p className="mt-6 max-w-[34rem] text-[clamp(1.1rem,1.6vw,2rem)] text-bone/80">{contact.sub}</p>

        <div className="mt-[clamp(3rem,8vh,8rem)] grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[26rem]">
            <AnimatePresence mode="wait">
              {status === "done" ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: bezier.expo }}
                  className="flex h-full min-h-[26rem] flex-col items-start justify-center rounded-[2rem] bg-blaze p-10 text-ink"
                  role="status"
                >
                  <p className="display text-[clamp(3rem,6vw,9rem)]">{contact.success}</p>
                  <p className="mt-3 text-lg">Thanks, {f.name.split(" ")[0]} — I&apos;ll get back to you soon.</p>
                  <button
                    type="button"
                    onClick={() => { setF({ name: "", email: "", message: "", company: "" }); setStatus("idle"); }}
                    className="mt-8 rounded-full border border-ink/30 px-6 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-ink hover:text-blaze"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" exit={{ opacity: 0, y: -12 }} onSubmit={submit} noValidate className="grid gap-5" aria-describedby="c-status">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {(["name", "email"] as const).map((k) => (
                      <div key={k}>
                        <label htmlFor={`c-${k}`} className="mb-2 block text-xs uppercase tracking-[0.25em] text-mute">{k === "name" ? "Your name" : "Email"}</label>
                        <input
                          id={`c-${k}`}
                          name={k}
                          type={k === "email" ? "email" : "text"}
                          autoComplete={k}
                          value={f[k]}
                          onChange={set(k)}
                          aria-invalid={!!errors[k]}
                          aria-describedby={errors[k] ? `c-${k}-err` : undefined}
                          placeholder={k === "name" ? "Jane Doe" : "jane@company.com"}
                          className={`${field} ${errors[k] ? "border-blaze" : "border-bone/10"}`}
                        />
                        {errors[k] && <p id={`c-${k}-err`} className="mt-2 text-sm text-blaze">{errors[k]}</p>}
                      </div>
                    ))}
                  </div>
                  <div>
                    <label htmlFor="c-message" className="mb-2 block text-xs uppercase tracking-[0.25em] text-mute">Message</label>
                    <textarea
                      id="c-message"
                      name="message"
                      rows={6}
                      value={f.message}
                      onChange={set("message")}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "c-message-err" : undefined}
                      placeholder={contact.messagePlaceholder}
                      className={`${field} resize-y ${errors.message ? "border-blaze" : "border-bone/10"}`}
                    />
                    {errors.message && <p id="c-message-err" className="mt-2 text-sm text-blaze">{errors.message}</p>}
                  </div>
                  {/* Honeypot */}
                  <input type="text" name="company" value={f.company} onChange={set("company")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                  <div className="flex flex-wrap items-center gap-6">
                    <Magnetic>
                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="rounded-full bg-blaze px-10 py-5 text-sm font-semibold uppercase tracking-widest text-ink transition-transform hover:scale-105 disabled:opacity-60"
                      >
                        {status === "sending" ? "Sending…" : "Send message →"}
                      </button>
                    </Magnetic>
                    <p id="c-status" aria-live="polite" className="text-sm text-blaze">
                      {status === "error" && (
                        <>Couldn&apos;t send right now — email me at <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>.</>
                      )}
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <aside className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-mute">Email</p>
              <a href={`mailto:${profile.email}`} className="mt-2 block break-all text-[clamp(1.2rem,1.8vw,2.4rem)] font-medium hover:text-blaze">{profile.email}</a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-mute">Phone</p>
              <a href={profile.phoneHref} className="mt-2 block text-[clamp(1.2rem,1.8vw,2.4rem)] font-medium hover:text-blaze">{profile.phone}</a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-mute">Elsewhere</p>
              <ul className="mt-3 flex flex-wrap gap-3">
                {socials.map((s) => (
                  <li key={s.label}>
                    <Magnetic>
                      <a href={s.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-bone/20 px-5 py-3 text-sm transition-colors hover:border-blaze hover:bg-blaze hover:text-ink">
                        {s.label} <span aria-hidden>↗</span>
                      </a>
                    </Magnetic>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-mute">{profile.location}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
