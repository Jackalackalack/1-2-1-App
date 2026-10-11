import type { Metadata } from "next";
import SiteCreditBar from "@/components/SiteCreditBar";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: `Privacy Policy — ${config.owner.name}`,
  description: "How this booking page uses your information.",
};

const contactEmail = config.owner.email;

const sectionStyle: React.CSSProperties = { marginTop: "2rem" };
const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "1.3rem",
  fontWeight: 400,
  marginBottom: "0.6rem",
};
const textStyle: React.CSSProperties = { color: "var(--color-mid)", lineHeight: 1.7, marginBottom: "0.8rem" };

export default function Privacy() {
  return (
    <>
      <nav className="site-nav">
        <a href="/" className="nav-logo">{config.owner.name}</a>
      </nav>

      <main className="page">
        <article style={{ maxWidth: "720px", paddingBottom: "4rem" }}>
          <section className="header-box">
            <h1>Privacy Policy</h1>
            <p className="header-tagline">Last updated: 11 October 2026</p>
          </section>

          <p style={textStyle}>
            This booking page is run by {config.owner.name} so people can book a 1-2-1 call. This
            policy explains what information the page uses and why.
          </p>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>What I collect</h2>
            <p style={textStyle}>When you book a call, you give me:</p>
            <ul style={{ ...textStyle, paddingLeft: "1.4rem" }}>
              <li>your name</li>
              <li>your email address</li>
              <li>any agenda, questions or notes you choose to add</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>How it&rsquo;s used</h2>
            <p style={textStyle}>
              Your details are used only to arrange the call. When you book, the page creates an
              event in my Google Calendar. The event contains your name, email address and notes,
              plus a Google Meet link. Google Calendar sends you an invitation by email. Your
              details aren&rsquo;t used for marketing, aren&rsquo;t added to any mailing list, and
              aren&rsquo;t sold or shared with anyone else.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>Where it&rsquo;s stored</h2>
            <p style={textStyle}>
              The booking page doesn&rsquo;t keep its own database. Your details are stored only in
              the calendar event in my Google account, under{" "}
              <a href="https://policies.google.com/privacy">Google&rsquo;s privacy policy</a>. To
              stop people misusing the page, your IP address is held in memory for about a minute
              to limit repeated requests, and is not saved.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>Access to my Google Calendar</h2>
            <p style={textStyle}>
              The page connects to my own Google Calendar, never yours. It does two things there:
            </p>
            <ul style={{ ...textStyle, paddingLeft: "1.4rem" }}>
              <li>checks when I&rsquo;m free, so it can show available slots</li>
              <li>creates the event for your booking</li>
            </ul>
            <p style={textStyle}>
              The app&rsquo;s use of information received from Google APIs follows the{" "}
              <a href="https://developers.google.com/terms/api-services-user-data-policy">
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>How long it&rsquo;s kept</h2>
            <p style={textStyle}>
              Booking details stay in my calendar as a record of the meeting. Ask me and I&rsquo;ll
              delete them.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>Your rights</h2>
            <p style={textStyle}>
              Under UK data protection law, you can ask to see, correct or delete the information I
              hold about you. Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>Contact</h2>
            <p style={textStyle}>
              Questions about this policy: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </p>
          </section>
        </article>
      </main>

      <SiteCreditBar />
    </>
  );
}
