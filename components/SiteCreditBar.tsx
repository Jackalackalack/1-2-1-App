import { config } from "@/lib/config";

export default function SiteCreditBar() {
  const { name, siteUrl, githubUrl, linkedinUrl } = config.owner;

  return (
    <div className="site-credit-bar">
      <span>
        Built by{" "}
        <a href={siteUrl} target="_blank" rel="noopener">
          {name}
        </a>
      </span>
      <span className="credit-icons">
        {githubUrl && (
          <a href={githubUrl} target="_blank" rel="noopener" aria-label="GitHub">
            <svg viewBox="0 0 24 24">
              <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"></path>
            </svg>
          </a>
        )}
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noopener" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
        )}
      </span>
    </div>
  );
}
