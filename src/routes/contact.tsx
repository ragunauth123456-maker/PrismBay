import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import LogoHorizontal from '~/components/LogoHorizontal';
import { breadcrumbListScript, twitterMeta } from "~/utils/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact PrismBay — Get Support & Inquiries | PrismBay" },
      { name: "description", content: "Contact the PrismBay team for product inquiries, support questions, licensing information, or partnership opportunities. We respond within 24 hours." },
      { property: "og:title", content: "Contact PrismBay — Get Support & Inquiries | PrismBay" },
      { property: "og:description", content: "Contact the PrismBay team for product inquiries, support questions, licensing information, or partnership opportunities. We respond within 24 hours." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.prismbayai.com/images/og-default.png" },
      { property: "og:url", content: "https://www.prismbayai.com/contact" },
      ...twitterMeta("Contact PrismBay — Get Support & Inquiries | PrismBay", "Contact the PrismBay team for product inquiries, support questions, licensing information, or partnership opportunities. We respond within 24 hours."),
    ],
    links: [
      { rel: "canonical", href: "https://www.prismbayai.com/contact" },
    ],
    scripts: [
      breadcrumbListScript([
        { name: "Home", url: "https://www.prismbayai.com" },
        { name: "Contact", url: "https://www.prismbayai.com/contact" },
      ]),
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Contact</p>
            <h1 className="mt-2 text-3xl font-bold text-neutral-800 sm:text-4xl">Get in touch</h1>
            <p className="mt-4 text-lg text-neutral-500">Have a question about our products, licensing, or anything else? We'd love to hear from you.</p>
          </div>
        </div>
      </section>
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-2xl px-6 py-16">
          {sent ? (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <circle cx="16" cy="16" r="12" stroke="#16B3A7" strokeWidth="2" />
                  <path d="M10 16l4 4 8-8" stroke="#16B3A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-neutral-800">Message Sent</h2>
              <p className="mt-2 text-neutral-600">Thanks for reaching out, {name || "friend"}. We'll get back to you at {email || "your email"} within 1–2 business days.</p>
              <Link to="/" className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600">
                Back to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm space-y-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-700 placeholder:text-neutral-400 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-700 placeholder:text-neutral-400 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-1.5">Subject (optional)</label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-700 placeholder:text-neutral-400 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1.5">Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="How can we help?"
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-700 placeholder:text-neutral-400 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-y"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
              <p className="text-xs text-center text-neutral-400">
                Or email us directly at <a href="mailto:admin@prismbay.com" className="text-brand-600 hover:text-brand-700">admin@prismbay.com</a>
              </p>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
