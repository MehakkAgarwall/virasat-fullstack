export const BOOKING_SYNC_INTERVAL_MS = 4_000;

export type BookingLifecycleStatus = "pending" | "accepted" | "rejected";

export function bookingStatusLabel(status: BookingLifecycleStatus) {
  if (status === "accepted") return "Experience Confirmed";
  if (status === "rejected") return "Request Declined";
  return "Pending Artisan Confirmation";
}

export function bookingRequestLabel(status: BookingLifecycleStatus) {
  if (status === "accepted") return "Experience Confirmed";
  if (status === "rejected") return "Request Declined";
  return "New Experience Request";
}
