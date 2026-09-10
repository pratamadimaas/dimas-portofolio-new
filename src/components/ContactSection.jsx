import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, Instagram } from 'lucide-react';
import { identity } from '../data/portfolioData';

function TikTokIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15.5 3.5c.6 2.2 2.1 3.6 4.3 3.9" />
      <path d="M19.8 7.8v3.3c-1.9 0-3.6-.6-5-1.6v6.7a5.2 5.2 0 1 1-4.5-5.16" />
    </svg>
  );
}

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', message: '' });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSent(true);
  };

  return (
    <section id="contact" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-12 items-start">
        
        {/* Left Column: Transmission Context */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Secure transmission
          </h2>
          <p className="mt-3 text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm text-sm md:text-base">
            Untuk proyek enterprise, konsultasi arsitektur perbendaharaan, atau inisiatif rekayasa software — kirim pesan langsung.
          </p>

          <a 
            href={`mailto:${identity?.email || 'contact@example.com'}`}
            className="font-mono text-sm inline-block mt-6 text-slate-800 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 underline underline-offset-4 decoration-slate-300 dark:decoration-zinc-700"
          >
            {identity?.email || 'contact@example.com'}
          </a>

          {/* Social Links */}
          <div className="flex items-center gap-5 mt-6">
            {identity?.socials?.instagram && (
              <a
                href={identity.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors duration-200"
              >
                <Instagram size={15} strokeWidth={1.8} />
                <span>Instagram</span>
              </a>
            )}

            {identity?.socials?.tiktok && (
              <a
                href={identity.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors duration-200"
              >
                <TikTokIcon width={14} height={14} />
                <span>TikTok</span>
              </a>
            )}
          </div>
        </motion.div>

        {/* Right Column: Terminal Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          onSubmit={submit}
          className="rounded-2xl p-6 md:p-8 font-mono text-sm bg-white/60 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3 mb-6">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
            </div>
          </div>

          <label className="block mb-5">
            <span className="block text-xs uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
              identity.name
            </span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-transparent border-b border-slate-200 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none py-2 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 transition-colors duration-200"
              placeholder="e.g. Sam"
            />
          </label>

          <label className="block mb-8">
            <span className="block text-xs uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
              payload.message
            </span>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-transparent border-b border-slate-200 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none py-2 resize-none text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 transition-colors duration-200"
              placeholder="Describe the system or initiative you need built..."
            />
          </label>

          <button
            type="submit"
            disabled={sent}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-mono font-medium transition-all duration-200 ${
              sent
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 active:scale-95'
            }`}
          >
            {sent ? <Check size={14} /> : <Send size={14} />}
            {sent ? 'Payload Transmitted' : 'Send Transmission'}
          </button>
        </motion.form>

      </div>
    </section>
  );
}