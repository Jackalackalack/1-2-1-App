import BookingForm from "@/components/BookingForm";
import SiteCreditBar from "@/components/SiteCreditBar";
import { config } from "@/lib/config";

export default function Home() {
  return (
    <>
      <nav className="site-nav">
        <a href="https://jackabraham.studio" className="nav-logo">Jack Abraham</a>
        <ul className="nav-links">
          <li><a href="https://jackabraham.studio/#music">Music</a></li>
          <li><a href="https://jackabraham.studio/#education">Education</a></li>
          <li><a href="https://jackabraham.studio/#mentorship">Mentorship</a></li>
          <li><a href="https://jackabraham.studio/blog/">Blog</a></li>
          <li><a href="https://jackabraham.studio/ai-tools/index.html">AI Tools</a></li>
          <li><a href="mailto:jack@jackabraham.studio">Contact</a></li>
          <li className="nav-cta-item"><a href="#" className="nav-cta">Book a 1-2-1</a></li>
        </ul>
      </nav>

      <main className="page">
        <div className="page-grid">
          <section className="header-box">
            <h1>Book a 1-2-1 with Jack Abraham</h1>
            <p className="header-tagline">Music&nbsp;·&nbsp;Education&nbsp;·&nbsp;Mentorship</p>
          </section>

          <section className="intro-box">
            <div className="intro-copy">
              <p>Hello and welcome,</p>
              <p>To book a 1-2-1 with me select a slot from the available options.</p>
              <p>You will get a calendar invite with a Google Meet link.</p>
              <p>
                Please share an agenda and any questions or topics before we
                speak so we can use our time as effectively as possible.
              </p>
              <p>I look forward to speaking with you.</p>
              <p>Jack</p>
            </div>
            <div className="session-facts">
              <div>
                <span>Length</span>
                <span>{config.durationMinutes} minutes</span>
              </div>
              <div>
                <span>Format</span>
                <span>Google Meet</span>
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

          <BookingForm />
        </div>
      </main>

      <SiteCreditBar />
    </>
  );
}
