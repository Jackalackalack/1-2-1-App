"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "@/components/DatePicker";

type SlotsByDay = { dayKey: string; dayLabel: string; slots: string[] }[];

function groupByLocalDay(slots: string[]): SlotsByDay {
  const map = new Map<string, string[]>();
  for (const iso of slots) {
    const d = new Date(iso);
    const dayKey = d.toDateString();
    if (!map.has(dayKey)) map.set(dayKey, []);
    map.get(dayKey)!.push(iso);
  }
  return Array.from(map.entries()).map(([dayKey, daySlots]) => ({
    dayKey,
    dayLabel: new Date(daySlots[0]).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    slots: daySlots,
  }));
}

export default function BookingForm({ provider = "google" }: { provider?: "google" | "microsoft" }) {
  const availabilityEndpoint = provider === "microsoft" ? "/api/ms-availability" : "/api/availability";
  const bookEndpoint = provider === "microsoft" ? "/api/ms-book" : "/api/book";
  const meetLabel = provider === "microsoft" ? "Teams link" : "Meet link";

  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState(""); // honeypot, kept empty by real visitors
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ joinLink: string | null } | null>(null);

  useEffect(() => {
    fetch(availabilityEndpoint)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSlots(data.slots);
        const grouped = groupByLocalDay(data.slots);
        if (grouped.length > 0) setActiveDay(grouped[0].dayKey);
      })
      .catch((err) => setLoadError(err.message ?? "Could not load availability"));
  }, [availabilityEndpoint]);

  const grouped = useMemo(() => groupByLocalDay(slots ?? []), [slots]);
  const activeDaySlots = grouped.find((g) => g.dayKey === activeDay)?.slots ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !name || !email) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(bookEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, startTime: selectedSlot, notes, company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setConfirmation({ joinLink: data.meetLink ?? data.teamsLink ?? null });
    } catch (err: any) {
      setSubmitError(err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <section className="booking-panel">
        <div className="confirmation">
          <h2>Booked</h2>
          <p>
            You are on the calendar. A confirmation with the calendar invite is on
            its way to your email.
          </p>
          {confirmation.joinLink && (
            <p>
              {meetLabel}: <a href={confirmation.joinLink}>{confirmation.joinLink}</a>
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="booking-panel">
      <h2 className="panel-heading">Pick a time</h2>

      {loadError && <p className="error-message">{loadError}</p>}

      {!loadError && slots === null && <p className="empty-note">Loading availability…</p>}

      {!loadError && slots !== null && grouped.length === 0 && (
        <p className="empty-note">No open slots in the coming weeks. Check back soon.</p>
      )}

      {grouped.length > 0 && (
        <>
          <DatePicker
            availableDayKeys={new Set(grouped.map((g) => g.dayKey))}
            selectedDayKey={activeDay}
            onSelectDay={setActiveDay}
          />

          <div className="slot-grid">
            {activeDaySlots.map((iso) => (
              <button
                key={iso}
                type="button"
                className="slot-button"
                data-selected={iso === selectedSlot}
                onClick={() => setSelectedSlot(iso)}
              >
                {new Date(iso).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </button>
            ))}
            {activeDay && activeDaySlots.length === 0 && (
              <p className="empty-note">No slots on this date.</p>
            )}
          </div>
        </>
      )}

      {selectedSlot && (
        <>
          <p className="selected-summary">
            {new Date(selectedSlot).toLocaleString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>

          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="hp-field" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="notes">Agenda, questions or a link to documents (optional)</label>
              <textarea
                id="notes"
                placeholder="What would you like to cover? Paste a link (e.g. a Google Doc) rather than attaching a file."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="field-hint">
                This is a text field, not a file upload. Whatever you type here is
                added directly to the calendar invite Jack receives.
              </p>
            </div>
            {submitError && <p className="error-message">{submitError}</p>}
            <button className="submit-button" type="submit" disabled={submitting}>
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
