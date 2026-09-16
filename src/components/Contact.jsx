import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import emailjs from '@emailjs/browser';
import { supabase } from '../supabaseClient';
import styles from './Contact.module.css';

export default function Contact() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const RATE_LIMIT_KEY = 'sk-contact-last-sent';
    const RATE_LIMIT_MS = 60 * 60 * 1000;
    const lastSent = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSent && Date.now() - parseInt(lastSent) < RATE_LIMIT_MS) {
      setRateLimitError('Please wait an hour before sending another message.');
      return;
    }
    
    setSending(true);
    setSubmitError(false);
    setRateLimitError('');
    
    try {
      await Promise.all([
        emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            from_name: formData.name,
            from_email: formData.email,
            message: formData.message,
            to_email: 'atharvahule30@gmail.com'
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        ),
        supabase.from('messages').insert({
          name: formData.name,
          email: formData.email,
          message: formData.message
        })
      ]);
      setSent(true);
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
    } catch (err) {
      if (import.meta.env.PROD) {} else { console.error(err); }
      setSubmitError(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className={styles.contact} ref={ref}>
      <div className="container">
        <motion.span
          className="section-label"
          style={{ color: '#94A3B8' }}
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Contact
        </motion.span>

        <div className={styles.grid}>
          <div className={styles.left}>
            <motion.h2
              className={styles.heading}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Let's build
              <br />
              something.
            </motion.h2>

            <motion.p
              className={styles.subtext}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Open to internships, freelance projects, and interesting conversations about AI
            </motion.p>

            <motion.div
              className={styles.links}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=atharvahule30@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
              >
                <span className={styles.linkIcon}>✉</span>
                <span>atharvahule30@gmail.com</span>
              </a>
              <a
                href="https://github.com/atharvahule24"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <span className={styles.linkIcon}>⌥</span>
                <span>github.com/atharvahule24</span>
              </a>
              <a
                href="https://linkedin.com/in/atharva-hule"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <span className={styles.linkIcon}>in</span>
                <span>linkedin.com/in/atharva-hule</span>
              </a>
            </motion.div>
          </div>

          {/* Contact form */}
          <motion.div
            className={styles.formWrap}
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            {rateLimitError ? (
              <div className={styles.errorMsg}>
                <p>{rateLimitError}</p>
              </div>
            ) : submitError ? (
              <div className={styles.errorMsg}>
                <p>Something went wrong. Email me directly at <a href="mailto:atharvahule30@gmail.com" className={styles.mailtoLink}>atharvahule30@gmail.com</a></p>
              </div>
            ) : sent ? (
              <div className={styles.successMsg}>
                <span style={{ fontSize: '32px' }}>✓</span>
                <p>Message sent. I'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    placeholder="Your name"
                  />
                  {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    placeholder="What's on your mind?"
                  />
                  {errors.message && <span className={styles.errorText}>{errors.message}</span>}
                </div>
                <button type="submit" className={`btn-primary ${styles.submit}`} disabled={sending}>
                  {sending ? (
                    <span className={styles.sendingWrap}>
                      <span className={styles.spinner}></span> SENDING...
                    </span>
                  ) : 'SEND MESSAGE →'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
           <span className={styles.footerBrand}>Atharva Hule</span>
            <span className={styles.footerCopy}>
                © 2026 Atharva Hule · Built with React, Supabase & curiosity.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
