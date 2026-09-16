import BookingForm from "@/components/BookingForm";
import SiteFooter from "@/components/SiteFooter";
import CreatorTag from "@/components/CreatorTag";
import { config } from "@/lib/config";

export default function Home() {
  return (
    <>
      <div className="page-bg" aria-hidden="true">
        <div className="page-bg-texture" />
        <div className="page-bg-grid" />
        <div className="page-bg-perforation line-1" />
        <div className="page-bg-perforation line-2" />
      </div>
      <main className="page">
        <div className="page-grid">
          <section className="header-box">
            <h1>Book 1-2-1 with Jack Abraham</h1>
            <p className="header-tagline">Music&nbsp;-&nbsp;Education&nbsp;-&nbsp;Mentorship</p>
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
            </div>
          </section>
          <BookingForm />
        </div>
      </main>
      <SiteFooter />
      <CreatorTag />
    </>
  );
}
