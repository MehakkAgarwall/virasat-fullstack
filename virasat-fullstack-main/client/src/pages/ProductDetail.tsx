import { ArrowRight, MapPin, PackageOpen } from "lucide-react";
import { Link, useRoute } from "wouter";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { ProductEnquiryForm } from "../components/ProductEnquiryForm";
import { TopNav } from "../components/TopNav";
import { trpc } from "../lib/trpc";

function price(value: number) { return `₹${value.toLocaleString("en-IN")}`; }

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id ?? "";
  const query = trpc.product.get.useQuery({ productId }, { enabled: Boolean(productId) });
  const product = query.data;
  if (query.isLoading) return <div className="app-shell product-detail-page"><TopNav /><main><section className="product-hero section-pad"><div className="container"><span className="eyebrow">Studio object</span><h1>Opening the<br /><em>maker’s catalogue.</em></h1></div></section></main><MobileBottomNav role="traveller" /></div>;
  if (!product) return <div className="app-shell product-detail-page"><TopNav /><main><section className="product-hero section-pad"><div className="container"><span className="eyebrow">Product record</span><h1>This piece<br /><em>is not available.</em></h1><p>It may no longer be published by its Artisan. Explore another living craft or return to the maker’s public studio profile.</p><Link href="/explore" className="button button-primary">Explore crafts <ArrowRight size={15} /></Link></div></section></main><MobileBottomNav role="traveller" /></div>;
  return <div className="app-shell product-detail-page"><TopNav /><main><section className="product-hero section-pad"><div className="container product-detail-grid"><div className="product-image-stage"><img src={product.imageUrl} alt={product.name} /><span className="product-object-label">Published studio object</span></div><div className="product-detail-copy"><span className="eyebrow">Carry the craft home</span><h1>{product.name}</h1><p className="product-price">{price(product.price)} <small>Price published by the maker</small></p><div className="product-provenance-stitch"><span>Craft #{product.craftId}</span><i /><span>Maker</span><i /><span>Studio object</span></div><p className="product-detail-lede">{product.description}</p><div className="made-along-route"><MapPin size={15} /><div><span>Made by the maker you met</span><strong>{product.artisanName}</strong></div></div><p className="cart-note">{product.quantity > 0 ? `${product.quantity} published available` : "Availability to confirm with the maker"}</p><ProductEnquiryForm productId={product.id} productName={product.name} /></div></div></section><section className="product-provenance-section section-pad section-ivory"><div className="container product-provenance-grid"><div><span className="eyebrow">Made by the maker you met</span><h2>A craft object<br /><em>with a living source.</em></h2></div><div><dl><div><dt>Craft relationship</dt><dd>Numeric Railway craft record #{product.craftId}</dd></div><div><dt>Publishing studio</dt><dd>{product.studioName}</dd></div><div><dt>Availability</dt><dd>{product.quantity > 0 ? `${product.quantity} published available` : "Ask the maker"}</dd></div></dl><Link href={`/maker/artisan-studio`} className="underlined-link">Visit the maker profile <ArrowRight size={14} /></Link></div></div></section></main><MobileBottomNav role="traveller" /></div>;
}
