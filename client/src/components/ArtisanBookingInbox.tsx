import { CheckCircle2, Clock3, Inbox, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { BOOKING_SYNC_INTERVAL_MS, bookingRequestLabel } from "../services/bookingSync";

type BookingFilter = "all" | "pending" | "accepted";

const filterCopy: Record<BookingFilter, { title: string; description: string; empty: string }> = {
  all: { title: "All managed requests", description: "Every shared booking stored for this Artisan.", empty: "No persisted Traveller bookings have reached this Artisan yet." },
  pending: { title: "Awaiting your confirmation", description: "These Traveller requests need one clear Artisan response.", empty: "There are no pending Traveller requests at the moment." },
  accepted: { title: "Accepted visits", description: "These are the shared bookings you have already confirmed.", empty: "No Traveller visits have been accepted yet." },
};

export function ArtisanBookingInbox({ artisanKey }: { artisanKey: string }) {
  const [filter, setFilter] = useState<BookingFilter>("all");
  const utils = trpc.useUtils();
  const bookingsQuery = trpc.booking.listForArtisan.useQuery({ artisanKey }, { refetchInterval: BOOKING_SYNC_INTERVAL_MS, refetchOnWindowFocus: true });
  const updateStatus = trpc.booking.updateStatus.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.booking.listForArtisan.invalidate({ artisanKey }),
        utils.booking.listForTraveller.invalidate(),
        utils.experience.listForArtisan.invalidate({ artisanKey }),
      ]);
      setFilter("all");
      toast.success("Booking response saved. The Traveller status is now synchronized.");
    },
    onError: (error) => toast.error(error.message || "This booking response could not be saved."),
  });
  const bookings = bookingsQuery.data ?? [];
  const counts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter((item) => item.booking.status === "pending").length,
    accepted: bookings.filter((item) => item.booking.status === "accepted").length,
  }), [bookings]);
  const filteredBookings = useMemo(() => filter === "all" ? bookings : bookings.filter((item) => item.booking.status === filter), [bookings, filter]);
  const activeCopy = filterCopy[filter];
  const cards = [
    { id: "all" as const, count: counts.all, label: "persisted experience bookings", icon: Inbox },
    { id: "pending" as const, count: counts.pending, label: "awaiting artisan confirmation", icon: Clock3 },
    { id: "accepted" as const, count: counts.accepted, label: "accepted visits", icon: CheckCircle2 },
  ];

  return <section className="role-page artisan-booking-inbox" aria-live="polite">
    <div className="workspace-hero compact"><div><span className="eyebrow">Shared bookings / managed source</span><h2>Your booking <em>inbox.</em></h2><p>Each Traveller request is one shared booking record. Select a summary card to focus the matching set, then accept or decline pending requests.</p></div></div>
    <div className="interest-detail-grid booking-summary-actions" aria-label="Booking summary filters">{cards.map((card) => { const Icon = card.icon; const active = filter === card.id; return <button key={card.id} type="button" className={active ? "booking-summary-card booking-summary-card-active" : "booking-summary-card"} onClick={() => setFilter(card.id)} aria-pressed={active}><span className="booking-summary-icon"><Icon size={17} /></span><span className="interest-large">{card.count}</span><span>{card.label}</span><small>{active ? "Showing these requests" : "Open matching requests"}</small></button>; })}</div>
    <section className="traveller-signal-panel"><div><span className="eyebrow">{activeCopy.title}</span><h3>{filter === "all" ? <>One request,<br /><em>one shared status.</em></> : filter === "pending" ? <>Ready for<br /><em>your response.</em></> : <>Visits you have<br /><em>confirmed.</em></>}</h3><p className="booking-filter-description">{activeCopy.description}</p></div>{bookingsQuery.isLoading ? <p className="body-copy">Loading persisted bookings…</p> : filteredBookings.length ? <div className="traveller-signal-list">{filteredBookings.map((item) => <article key={item.booking.id}><span className="booking-request-state">{bookingRequestLabel(item.booking.status)}</span><strong>{item.experience?.title ?? "Published experience"}</strong><small><Users size={13} />{item.booking.travellerName} · {item.booking.bookingDate} · {item.booking.bookingTime}</small><small className="booking-request-craft">{item.experience?.location ?? "Location pending"} · {item.experience?.artisanName ?? "Artisan profile loading"}</small>{item.booking.status === "pending" && <div className="booking-action-row"><button className="button button-primary" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ bookingId: item.booking.id, artisanKey, status: "accepted" })}>Accept request</button><button className="button button-ghost" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ bookingId: item.booking.id, artisanKey, status: "rejected" })}>Decline</button></div>}</article>)}</div> : <div className="booking-filter-empty"><Inbox size={20} /><div><strong>{activeCopy.empty}</strong><p>Choose another summary card to see a different live booking set.</p></div></div>}<small className="traveller-signal-note">This inbox checks the shared booking source every few seconds. The booking row, current profile name, and response status stay managed in the application database.</small></section>
  </section>;
}
