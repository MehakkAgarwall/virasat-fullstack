// Virāsat Traveller bookings: shared Artisan reservations with a controlled reset for repeatable judging demonstrations.
import { ArrowRight, Check, MapPin, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import { getVisitorSubjectKey } from "../services/demoStatePersistence";
import { travellerDemoService } from "../services/travellerDemoService";
import { trpc } from "../lib/trpc";
import { BOOKING_SYNC_INTERVAL_MS, bookingStatusLabel } from "../services/bookingSync";

export function removeDemoBookingCopy(title: string) {
  return `Remove “${title}” from this demo ledger? The linked Artisan inbox will update too, and you can book the experience again.`;
}

export default function TravellerBookings() {
  const [state] = useState(() => travellerDemoService.getState());
  const travellerKey = getVisitorSubjectKey();
  const utils = trpc.useUtils();
  const persistedBookingsQuery = trpc.booking.listForTraveller.useQuery({ travellerKey }, { refetchInterval: BOOKING_SYNC_INTERVAL_MS, refetchOnWindowFocus: true });
  const resetBooking = trpc.booking.removeForTraveller.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.booking.listForTraveller.invalidate({ travellerKey }), utils.booking.listForArtisan.invalidate()]);
      toast.success("Demo booking removed. This experience is ready to book again.");
    },
    onError: (error) => toast.error(error.message || "The booking could not be removed."),
  });
  const persistedBookings = persistedBookingsQuery.data ?? [];
  const requestRemoval = (bookingId: string, title: string) => {
    if (!window.confirm(removeDemoBookingCopy(title))) return;
    resetBooking.mutate({ bookingId, travellerKey });
  };

  return <div className="app-shell page-shell traveller-bookings"><TopNav /><main><section className="section-pad traveller-ledger-hero"><div className="container"><span className="eyebrow"><span className="eyebrow-stitch" />Traveller ledger</span><h1>Things to meet,<br /><em>make, and carry.</em></h1><p>Workshop bookings, Artisan identity, location, time, and response status are read from the managed application database.</p></div></section><section className="section-pad section-ivory"><div className="container traveller-ledger-grid"><section><div className="content-panel-head"><div><span className="eyebrow">Workshop reservations</span><h2>Time with the maker.</h2><p className="booking-sync-note">This ledger checks the shared booking record every few seconds.</p></div></div>{persistedBookingsQuery.isLoading ? <p className="body-copy">Loading managed bookings…</p> : persistedBookings.length ? <div className="traveller-ledger-list">{persistedBookings.map((item) => { const title = item.experience?.title ?? "Managed experience"; return <article key={item.booking.id}><span className="ledger-icon"><Check size={16} /></span><div><strong>{title}</strong><small>{item.booking.bookingDate} · {item.booking.bookingTime} · {item.experience?.artisanName ?? "Artisan profile"} · {item.experience?.location ?? "Location pending"}</small></div><div className="ledger-booking-actions"><i>{bookingStatusLabel(item.booking.status)}</i><button type="button" className="ledger-remove-button" disabled={resetBooking.isPending} onClick={() => requestRemoval(item.booking.id, title)}><Trash2 size={13} />{resetBooking.isPending ? "Removing…" : "Remove demo booking"}</button></div></article>; })}</div> : <div className="traveller-empty-note"><Sparkles size={18} /><div><strong>No shared workshop reserved yet.</strong><p>Open a published Artisan experience to create a request the Artisan can review.</p></div><Link href="/maker/artisan-studio" className="underlined-link">Meet a published Artisan <ArrowRight size={14} /></Link></div>}</section><section><div className="content-panel-head"><div><span className="eyebrow">Objects held close</span><h2>Cart &amp; pickup.</h2></div></div><div className="traveller-ledger-list">{state.cartProductIds.length ? <article><span className="ledger-icon"><ShoppingBag size={16} /></span><div><strong>{state.cartProductIds.length} object{state.cartProductIds.length === 1 ? "" : "s"} saved to cart</strong><small>Local demo cart · review with the maker later</small></div></article> : null}{state.pickupProductIds.length ? <article><span className="ledger-icon"><MapPin size={16} /></span><div><strong>{state.pickupProductIds.length} pickup intention{state.pickupProductIds.length === 1 ? "" : "s"}</strong><small>Held for a future Cultural Trail</small></div></article> : null}{!state.cartProductIds.length && !state.pickupProductIds.length ? <div className="traveller-empty-note"><ShoppingBag size={18} /><div><strong>No objects added yet.</strong><p>Keep a craft object in your cart or mark it for pickup during a future journey.</p></div><Link href="/product/lacquered-elephant" className="underlined-link">See the craft object <ArrowRight size={14} /></Link></div> : null}</div></section></div></section></main><MobileBottomNav role="traveller" /></div>;
}
