import BookingForm from "@/components/BookingForm";
import SiteCreditBar from "@/components/SiteCreditBar";
import { config } from "@/lib/config";

export default function Home() {
  const raw = (process.env.CALENDAR_PROVIDER ?? "google").toLowerCase();
  const provider: "google" | "microsoft" = raw === "microsoft" ? "microsoft" : "google";
  const meetingFormat = provider === "microsoft" ? "Microsoft Teams" : "Google Meet";

  return (
    <>
      <nav className="site-nav">
        <a href={config.owner.siteUrl} className="nav-logo">{config.owner.name}</a>
        {config.owner.navLinks.length > 0 && (
          <ul className="nav-links">
            {config.owner.navLinks.map((link) => (
              <li key={link.href}><a href={link.href}>{link.label}</a></li>
            ))}
            <li className="nav-cta-item"><a href="#" className="nav-cta">Book a 1-2-1</a></li>
          </ul>
        )}
      </nav>

      <main className="page">
        <div className="page-grid">
          <section className="header-box">
            <h1>{config.owner.bookingHeading}</h1>
            <p className="header-tagline">{config.owner.bookingTagline}</p>
          </section>

          <section className="intro-box">
            <div className="intro-copy">
              {config.owner.intro.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
              <p>You will get a calendar invite with a {meetingFormat} link.</p>
            </div>
            <div className="session-facts">
              <div>
                <span>Length</span>
                <span>{config.durationMinutes} minutes</span>
              </div>
              <div>
                <span>Format</span>
                <span>{meetingFormat}</span>
              </div>
              <div>
                <span>Timezone shown</span>
                <span>{config.timezone}</span>
              </div>
              <div>
                <span>Cost</span>
                <span>Free</span>
              </div>
            </div>
          </section>

          <BookingForm provider={provider} />
        </div>
      </main>

      <SiteCreditBar />
    </>
  );
}
