import { Camera, Compass, Edit3, ImagePlus, Loader2, LogOut, Save, ShieldCheck } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { toast } from "sonner";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/AuthContext";
import { trpc } from "../lib/trpc";
import { getVisitorSubjectKey } from "../services/demoStatePersistence";

type TravellerProfileRecord = {
  travellerKey: string;
  displayName: string;
  profilePhotoUrl: string;
  introduction: string;
  preferences: string;
};

export const travellerPhotoValidationError = (file: Pick<File, "type" | "size">) => {
  if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) return "Choose a JPG, PNG, or WebP image.";
  if (file.size > 2 * 1024 * 1024) return "Choose an image smaller than 2 MB.";
  return null;
};

export default function TravellerProfile() {
  const { session, logout, updateSessionName } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const travellerKey = getVisitorSubjectKey();
  const fallbackName = session?.name || "Aarav";
  const utils = trpc.useUtils();
  const profileQuery = trpc.travellerProfile.get.useQuery({ travellerKey });
  const createProfile = trpc.travellerProfile.getOrCreate.useMutation({ onSuccess: () => utils.travellerProfile.get.invalidate({ travellerKey }) });
  const [editing, setEditing] = useState(() => new URLSearchParams(search).get("edit") === "name");
  const [form, setForm] = useState<TravellerProfileRecord>({ travellerKey, displayName: fallbackName, profilePhotoUrl: "", introduction: "A curious traveller following living craft stories across India.", preferences: "Handmade traditions, intimate workshops, and cultural detours." });

  useEffect(() => { if (profileQuery.isSuccess && !profileQuery.data && !createProfile.isPending) createProfile.mutate({ travellerKey, displayName: fallbackName }); }, [createProfile, fallbackName, profileQuery.data, profileQuery.isSuccess, travellerKey]);
  useEffect(() => { if (profileQuery.data) setForm(profileQuery.data as TravellerProfileRecord); }, [profileQuery.data]);
  useEffect(() => { if (new URLSearchParams(search).get("edit") === "name") setEditing(true); }, [search]);

  const saveProfile = trpc.travellerProfile.update.useMutation({
    onSuccess: async (profile) => {
      await Promise.all([utils.travellerProfile.get.invalidate({ travellerKey }), utils.booking.listForTraveller.invalidate({ travellerKey }), utils.booking.listForArtisan.invalidate()]);
      updateSessionName(profile.displayName);
      setEditing(false);
      toast.success("Traveller profile saved. Your bookings now use this identity.");
    },
    onError: (error) => toast.error(error.message || "Traveller profile could not be saved."),
  });
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const update = (key: keyof TravellerProfileRecord, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); saveProfile.mutate({ ...form, travellerKey, displayName: form.displayName.trim(), profilePhotoUrl: form.profilePhotoUrl.trim(), introduction: form.introduction.trim(), preferences: form.preferences.trim() }); };
  const selectPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0];
    event.target.value = "";
    if (!photo) return;
    const validationError = travellerPhotoValidationError(photo);
    if (validationError) { toast.error(validationError); return; }
    setIsPhotoUploading(true);
    try {
      const body = new FormData();
      body.append("photo", photo, photo.name);
      body.append("travellerKey", travellerKey);
      body.append("displayName", form.displayName.trim() || fallbackName);
      const response = await fetch("/api/upload/traveller-photo", { method: "POST", body });
      const payload = await response.json().catch(() => null) as { profile?: TravellerProfileRecord; error?: string } | null;
      if (!response.ok || !payload?.profile) throw new Error(payload?.error || "Your photo could not be uploaded. Please try again.");
      setForm(payload.profile);
      await Promise.all([utils.travellerProfile.get.invalidate({ travellerKey }), utils.booking.listForTraveller.invalidate({ travellerKey })]);
      toast.success("Your personal photo is saved to your Traveller profile.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your photo could not be uploaded.");
    } finally {
      setIsPhotoUploading(false);
    }
  };
  const profile = profileQuery.data as TravellerProfileRecord | undefined;

  const displayedPhoto = profile?.profilePhotoUrl || form.profilePhotoUrl;
  const displayedName = profile?.displayName ?? fallbackName;
  return <div className="app-shell page-shell traveller-profile"><TopNav /><main><section className="section-pad profile-page"><span className="eyebrow">Traveller profile / owned identity</span><h1>{displayedName.split(" ")[0]}<br /><em>notes.</em></h1><p>Your Traveller identity is saved separately from every Artisan profile. Editing this page never changes the maker connected to an experience.</p><div className="profile-details"><span><ShieldCheck size={14} />Your persistent Traveller profile</span><span><Compass size={14} />Living heritage routes</span><span>Managed booking identity</span></div>{editing ? <form className="role-form traveller-profile-form" onSubmit={submit}><label>Traveller name<input value={form.displayName} onChange={(event) => update("displayName", event.target.value)} /></label><label className="form-wide traveller-photo-upload"><span>Traveller photograph</span><div className="traveller-photo-upload-row"><TravellerPhoto photoUrl={form.profilePhotoUrl} name={form.displayName || fallbackName} /><div><label className="button button-ghost traveller-photo-picker"><ImagePlus size={15} />{isPhotoUploading ? <><Loader2 size={14} className="animate-spin" />Uploading…</> : "Choose your photo"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} disabled={isPhotoUploading} /></label><small>JPG, PNG, or WebP · up to 2 MB. Your image is saved to your own Traveller profile.</small></div></div></label><label className="form-wide">Short introduction<textarea value={form.introduction} onChange={(event) => update("introduction", event.target.value)} /></label><label className="form-wide">Cultural preferences<textarea value={form.preferences} onChange={(event) => update("preferences", event.target.value)} /></label><div className="form-wide form-actions"><button type="button" className="button button-ghost" onClick={() => setEditing(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={saveProfile.isPending || isPhotoUploading}><Save size={15} />{saveProfile.isPending ? "Saving…" : "Save traveller profile"}</button></div></form> : <div className="artisan-managed-profile-grid traveller-managed-profile"><TravellerPhoto photoUrl={displayedPhoto} name={displayedName} /><div><span className="eyebrow">Traveller identity</span><h2>{displayedName}<br /><em>on the trail.</em></h2><p className="body-copy">{profile?.introduction ?? form.introduction}</p><div className="profile-details"><span>{profile?.preferences ?? form.preferences}</span><span>Visible in your booking requests</span></div><button className="button button-primary" onClick={() => setEditing(true)}><Edit3 size={15} />Edit my profile</button></div></div>}<button className="button button-ghost traveller-profile-logout" onClick={() => { logout(); setLocation("/"); }}><LogOut size={15} />Leave demo</button></section></main><MobileBottomNav role="traveller" /></div>;
}

function TravellerPhoto({ photoUrl, name }: { photoUrl: string; name: string }) {
  if (photoUrl) return <img src={photoUrl} alt={`${name} Traveller profile`} />;
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "T";
  return <div className="traveller-photo-empty" aria-label="No Traveller photo yet"><Camera size={22} /><strong>{initials}</strong><span>Add your photo</span></div>;
}
