import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { getVisitorSubjectKey } from "../services/demoStatePersistence";
import { useAuth } from "../contexts/AuthContext";

export function ProductEnquiryForm({ productId, productName }: { productId: string; productName: string }) {
  const travellerKey = getVisitorSubjectKey();
  const { session } = useAuth();
  const [message, setMessage] = useState(`I am interested in ${productName}. Please let me know the next step.`);
  const mutation = trpc.productEnquiry.create.useMutation({ onSuccess: () => toast.success("Your enquiry has been sent to the Artisan."), onError: (error) => toast.error(error.message || "Your enquiry could not be sent.") });
  const submit = (event: FormEvent) => { event.preventDefault(); if (message.trim().length < 2) return; mutation.mutate({ productId, travellerKey, travellerName: session?.role === "traveller" ? session.name : "Traveller", message: message.trim() }); };
  return <form className="product-enquiry-form" onSubmit={submit}><label htmlFor="product-enquiry-message">Interested in this piece?</label><textarea id="product-enquiry-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} /><button className="button button-primary" type="submit" disabled={mutation.isPending}><Send size={14} />{mutation.isPending ? "Sending…" : "Send purchase enquiry"}</button><small>This sends a saved enquiry to the linked Artisan. It does not place an order or take payment.</small></form>;
}
