import { ChangeEvent, FormEvent, useState } from "react";
import { ArrowRight, BookOpen, Camera, Compass, Copy, Feather, Flower2, Heart, ImagePlus, MapPinned, Pin, Save, Send, Share2, Sparkles, Stamp, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import { trpc } from "../lib/trpc";
import { getVisitorSubjectKey } from "../services/demoStatePersistence";

const noteImages = {
  maker: "/manus-storage/virasat-maker-at-work_7e0e99ef.jpg",
  process: "/manus-storage/virasat-craft-process-collage_42d5548c.jpg",
  route: "/manus-storage/virasat-sunset-route-landscape_f7be90bf.jpg",
};

export const REVIEW_PHOTO_MAX_BYTES = 2 * 1024 * 1024;
const REVIEW_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function reviewPhotoValidationError(file: File) {
  if (!REVIEW_PHOTO_TYPES.includes(file.type)) return "Choose a JPG, PNG, or WebP image.";
  if (file.size > REVIEW_PHOTO_MAX_BYTES) return "Choose an image smaller than 2 MB.";
  return "";
}

export const readingNotes = [
  { number: "01", eyebrow: "A route becomes a record", title: "Begin with the place, then stay for the practice.", body: "Cultural travel becomes more meaningful when a detour leads to a material, a craft tradition, and the people who keep its knowledge in motion.", image: noteImages.route, href: "/planner", action: "Open the Cultural Trail", icon: MapPinned },
  { number: "02", eyebrow: "Material study", title: "The hand is part of every object’s memory.", body: "From pigment and clay to fibre and metal, each collection record is an invitation to look more closely at process, place, and material language.", image: noteImages.process, href: "/explore", action: "Browse the living collection", icon: Sparkles },
  { number: "03", eyebrow: "A living archive", title: "Recognition should lead back to the craft story.", body: "GI and ODOP provenance on selected records is presented as a starting point: follow it to the craft, then to the published maker and cultural context where available.", image: noteImages.maker, href: "/craft/api-105", action: "Read a provenance-led story", icon: BookOpen },
];

export const travellerJournalCopy = {
  eyebrow: "Your field journal",
  prompt: "What stayed with you?",
  privacy: "Private to this Traveller profile",
  empty: "Your saved reflections will appear here, in the order you write them.",
};

function displayJournalDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function parseJsonResponse(raw: string) {
  try { return JSON.parse(raw) as { reviewPhotoUrl?: string; error?: string }; } catch { return { error: "The photo service returned an unexpected response. Please try again." }; }
}

export default function HeritageNotes() {
  const travellerKey = getVisitorSubjectKey();
  const utils = trpc.useUtils();
  const [reflection, setReflection] = useState("");
  const [shareToBoard, setShareToBoard] = useState(false);
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [reviewPhotoError, setReviewPhotoError] = useState("");
  const journalQuery = trpc.travellerJournal.list.useQuery({ travellerKey });
  const sharedBoardQuery = trpc.travellerJournal.listShared.useQuery();
  const saveReflection = trpc.travellerJournal.create.useMutation({
    onSuccess: async () => {
      setReflection(""); setShareToBoard(false); setReviewPhotoUrl(""); setReviewPhotoError("");
      await Promise.all([utils.travellerJournal.list.invalidate({ travellerKey }), utils.travellerJournal.listShared.invalidate()]);
      toast.success("Your field note has been saved.");
    },
    onError: () => toast.error("Your reflection could not be saved. Please try again."),
  });
  const publishReflection = trpc.travellerJournal.publish.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.travellerJournal.list.invalidate({ travellerKey }), utils.travellerJournal.listShared.invalidate()]);
      toast.success("Your note is now on the Shared Trail Board.");
    },
    onError: () => toast.error("This reflection could not be shared. Please try again."),
  });

  const selectReviewPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0];
    event.target.value = "";
    if (!photo) return;
    const validationError = reviewPhotoValidationError(photo);
    if (validationError) { setReviewPhotoError(validationError); return; }
    setIsUploadingPhoto(true); setReviewPhotoError("");
    try {
      const formData = new FormData();
      formData.append("travellerKey", travellerKey);
      formData.append("photo", photo);
      const response = await fetch("/api/upload/trail-review-photo", { method: "POST", body: formData });
      const payload = parseJsonResponse(await response.text());
      if (!response.ok || !payload.reviewPhotoUrl) throw new Error(payload.error || "Your review photo could not be saved.");
      setReviewPhotoUrl(payload.reviewPhotoUrl);
      toast.success("Review photo added. It remains private until you choose to share the note.");
    } catch (error) { setReviewPhotoError(error instanceof Error ? error.message : "Your review photo could not be saved."); }
    finally { setIsUploadingPhoto(false); }
  };

  const submitReflection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = reflection.trim();
    if (content.length < 2 || saveReflection.isPending || isUploadingPhoto) return;
    saveReflection.mutate({ travellerKey, content, reviewPhotoUrl, shareToBoard });
  };

  const shareStory = async (entry: { content: string; travellerName: string; reviewPhotoUrl: string }) => {
    const url = `${window.location.origin}/notes#shared-trail-board`;
    const text = `${entry.travellerName}'s Virāsat trail note: “${entry.content}”${entry.reviewPhotoUrl ? `\nPhoto: ${window.location.origin}${entry.reviewPhotoUrl}` : ""}`;
    try {
      if (navigator.share) { await navigator.share({ title: "A Virāsat trail note", text, url }); toast.success("Choose a social app in the sharing panel."); }
      else { await navigator.clipboard.writeText(`${text}\n${url}`); toast.success("Story link copied. You can paste it into your social app."); }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("This story could not be shared right now.");
    }
  };

  const entries = journalQuery.data ?? [];
  const sharedEntries = sharedBoardQuery.data ?? [];
  const isSaving = saveReflection.isPending || isUploadingPhoto;

  return <div className="app-shell page-shell heritage-notes-page"><TopNav /><main>
    <section className="heritage-notes-hero section-pad"><div className="container heritage-notes-hero-grid"><div><span className="eyebrow">Virāsat field notes / volume 01</span><h1>Notes for<br /><em>slower journeys.</em></h1><p>Small observations from the Cultural Trail—about place, material, provenance, and the living practices that turn travel into a deeper encounter.</p><div className="heritage-notes-index"><span>Route</span><i /><span>Material</span><i /><span>Maker</span><i /><span>Memory</span></div></div><aside><span className="eyebrow">Reading room</span><strong>Not a feed.<br />A companion for<br /><em>looking closer.</em></strong><small>Read-only editorial notes connected to the live craft collection.</small></aside></div></section>
    <section className="heritage-notes-intro"><div className="container"><p><span>“</span>Every craft carries the memory of the hands that shaped it—and every route can make room to meet that memory.</p></div></section>
    <section className="heritage-journal-section"><div className="container heritage-journal-grid"><div className="heritage-journal-copy"><span className="eyebrow"><Feather size={13} /> {travellerJournalCopy.eyebrow}</span><h2>Leave a thought<br /><em>along the trail.</em></h2><p>This is a private writing space for your own impressions, memories, questions, cultural reflections, and review photos. Nothing reaches the public board unless you choose it.</p><div className="heritage-journal-rule"><span>Route</span><i /><span>Memory</span><i /><span>Reflection</span></div><a href="#shared-trail-board" className="heritage-board-jump"><Pin size={13} /> View the Shared Trail Board <ArrowRight size={13} /></a></div><div className="heritage-journal-surface"><form onSubmit={submitReflection}><label htmlFor="traveller-reflection">{travellerJournalCopy.prompt}</label><textarea id="traveller-reflection" value={reflection} maxLength={2500} onChange={(event) => setReflection(event.target.value)} placeholder="Write a moment, a material, a question, or a memory from the trail…" aria-describedby="journal-helper" />
      <div className="heritage-review-photo-control"><div><span className="eyebrow"><Camera size={13} /> Optional review photo</span><p>Add your own image of a moment from the trail. It remains private with this note unless you share it.</p></div>{reviewPhotoUrl ? <div className="heritage-review-photo-preview"><img src={reviewPhotoUrl} alt="Your selected review" /><button type="button" onClick={() => setReviewPhotoUrl("")} aria-label="Remove selected review photo"><X size={14} /></button></div> : <label className="heritage-review-photo-picker"><ImagePlus size={16} /><span>{isUploadingPhoto ? "Adding photo…" : "Add your photo"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectReviewPhoto} disabled={isUploadingPhoto} /></label>}</div>{reviewPhotoError ? <p className="heritage-journal-error">{reviewPhotoError}</p> : null}
      <label className="heritage-journal-share-toggle" htmlFor="share-reflection"><input id="share-reflection" type="checkbox" checked={shareToBoard} onChange={(event) => setShareToBoard(event.target.checked)} /><span><Share2 size={14} /> Put this name-and-photo story on the Traveller-visible Trail Board</span></label><div className="heritage-journal-form-foot"><span id="journal-helper">Leave this unticked to keep your writing, name, and photo private</span><button className="button button-primary" type="submit" disabled={reflection.trim().length < 2 || isSaving}><Save size={14} />{isUploadingPhoto ? "Adding photo…" : saveReflection.isPending ? "Saving…" : shareToBoard ? "Save & share" : "Save private note"}</button></div></form>
      {entries.length ? <div className="heritage-journal-entries" aria-live="polite"><div className="heritage-journal-entries-head"><span className="eyebrow">Your recent notes</span><span>{entries.length} saved</span></div>{entries.map((entry) => <article key={entry.id}>{entry.reviewPhotoUrl ? <img className="heritage-private-note-photo" src={entry.reviewPhotoUrl} alt="Your private review" /> : null}<time dateTime={new Date(entry.createdAt).toISOString()}>{displayJournalDate(entry.createdAt)}</time><p>{entry.content}</p><div className="heritage-journal-entry-actions">{entry.isShared ? <span className="heritage-journal-shared"><Heart size={12} /> On the Shared Trail Board</span> : <button type="button" onClick={() => publishReflection.mutate({ travellerKey, reflectionId: entry.id })} disabled={publishReflection.isPending}><Send size={12} />{publishReflection.isPending ? "Sharing…" : "Share to board"}</button>}</div></article>)}</div> : <div className="heritage-journal-empty"><span>01</span><p>{travellerJournalCopy.empty}</p></div>}</div></div></section>
    <section id="shared-trail-board" className="shared-trail-board-section"><div className="container"><div className="shared-trail-board-head"><div><span className="eyebrow"><Pin size={13} /> Traveller-visible / opt-in stories</span><h2>The Shared<br /><em>Trail Board.</em></h2><p>A living wall of moments shared by fellow Travellers. A name, profile photo, review photo, and social-sharing action appear only after the note owner deliberately publishes it.</p></div><div className="shared-trail-board-stickers" aria-hidden="true"><span className="board-sticker board-sticker-sun"><Sparkles size={24} /></span><span className="board-sticker board-sticker-flower"><Flower2 size={25} /></span><span className="board-sticker board-sticker-stamp"><Stamp size={23} /></span><i /></div></div><div className="shared-trail-board-frame"><div className="shared-trail-board-frame-head"><span><Pin size={13} /> Virāsat shared moments</span><span>{sharedEntries.length} {sharedEntries.length === 1 ? "story" : "stories"} pinned</span></div>{sharedBoardQuery.isLoading ? <div className="shared-trail-board-empty"><Sparkles size={20} /><p>Gathering the shared trail stories…</p></div> : sharedBoardQuery.isError ? <div className="shared-trail-board-empty"><Stamp size={20} /><p>The board could not be opened right now. Your private journal remains available above.</p></div> : sharedEntries.length ? <div className="shared-trail-board-notes">{sharedEntries.map((entry, index) => <article className={`shared-trail-note shared-trail-note-${index % 4}`} key={entry.id}><span className="shared-trail-note-pin" aria-hidden="true" /><div className="shared-trail-note-sticker" aria-hidden="true">{index % 3 === 0 ? <Flower2 size={17} /> : index % 3 === 1 ? <Sparkles size={17} /> : <Heart size={17} />}</div>{entry.reviewPhotoUrl ? <img className="shared-trail-review-photo" src={entry.reviewPhotoUrl} alt={`${entry.travellerName}'s shared trail moment`} /> : null}<p>{entry.content}</p><footer><span className="shared-trail-traveller"><span className="shared-trail-avatar">{entry.travellerProfilePhotoUrl ? <img src={entry.travellerProfilePhotoUrl} alt="" /> : entry.travellerName.slice(0, 1).toUpperCase()}</span>{entry.travellerName}</span><time dateTime={new Date(entry.sharedAt ?? entry.createdAt).toISOString()}>{displayJournalDate(entry.sharedAt ?? entry.createdAt)}</time></footer><button className="shared-trail-share-button" type="button" onClick={() => shareStory(entry)}><Share2 size={13} /> Share story</button></article>)}</div> : <div className="shared-trail-board-empty"><Stamp size={22} /><p>The board is waiting for its first shared moment. Select the sharing checkbox when saving a note above to pin it here for other Travellers.</p></div>}</div></div></section>
    <section className="heritage-notes-list section-pad"><div className="container"><div className="heritage-notes-list-head"><div><span className="eyebrow">Three ways in</span><h2>Read the trail<br /><em>before you travel.</em></h2></div><p>These notes are a guide to using Virāsat’s existing route, collection, and provenance paths—not a replacement for them.</p></div><div className="heritage-notes-grid">{readingNotes.map((note) => { const Icon = note.icon; return <article key={note.number} className="heritage-note-card"><div className="heritage-note-image"><img src={note.image} alt="" /><span>{note.number}</span></div><div className="heritage-note-copy"><span className="eyebrow"><Icon size={13} /> {note.eyebrow}</span><h3>{note.title}</h3><p>{note.body}</p><Link href={note.href} className="underlined-link">{note.action} <ArrowRight size={14} /></Link></div></article>; })}</div></div></section>
    <section className="heritage-notes-closing"><div className="container"><div><span className="eyebrow">Continue the reading</span><h2>A note is only the beginning.<br /><em>The trail is where it becomes real.</em></h2></div><Link href="/planner" className="button button-primary"><Compass size={15} />Trace a cultural route</Link></div></section>
  </main><MobileBottomNav role="traveller" /></div>;
}
