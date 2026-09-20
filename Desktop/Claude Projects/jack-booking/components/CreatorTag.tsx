"use client";

import { useEffect, useRef, useState } from "react";

export default function CreatorTag() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        e.target !== btnRef.current
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="creator-tag"
        aria-expanded={open}
        aria-controls="creatorPanel"
        onClick={() => setOpen((o) => !o)}
      >
        About the creator
      </button>

      <div
        ref={panelRef}
        id="creatorPanel"
        className={`creator-panel${open ? " open" : ""}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="creator-panel-close"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          &times;
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="creator-avatar" src="/img/jack-headshot.jpg" alt="Jack Abraham" width={60} height={60} />

        <div className="creator-name">Jack Abraham</div>
        <div className="creator-title">Music Consultant, Educator &amp; Mentor</div>
        <p className="creator-blurb">If you're enjoying this tool, drop me a line.</p>

        <div className="creator-links">
          <a className="creator-link-btn" href="mailto:jack@jackabraham.studio">
            Email me
          </a>
          <div className="creator-social-row">
            <a
              className="creator-social"
              href="https://www.linkedin.com/in/jackcabraham/"
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a
              className="creator-social"
              href="https://github.com/Jackalackalack"
              target="_blank"
              rel="noopener"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24">
                <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"></path>
              </svg>
            </a>
            <a
              className="creator-social"
              href="https://jackabraham.studio"
              target="_blank"
              rel="noopener"
              aria-label="Website"
            >
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </a>
            <a
              className="creator-social"
              href="https://www.instagram.com/jackalackalack/"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
