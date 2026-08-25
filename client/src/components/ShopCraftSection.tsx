import { ArrowRight, PackageOpen } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";

export type PublishedProductCard = { id: string; artisanKey: string; craftId: number; name: string; description: string; price: number; imageUrl: string; quantity: number; available: number; artisanName: string; studioName: string };

function price(value: number) { return `₹${value.toLocaleString("en-IN")}`; }
export function productAvailability(quantity: number) { return quantity > 0 ? `${quantity} published available` : "Availability to confirm"; }

export function ProductCards({ products }: { products: PublishedProductCard[] }) {
  return <div className="shop-craft-grid">{products.map((product) => <article className="shop-craft-card" key={product.id}><img src={product.imageUrl} alt={product.name} /><div><span className="eyebrow">Made by {product.studioName}</span><h3>{product.name}</h3><p>{product.description}</p><div className="shop-craft-meta"><b>{price(product.price)}</b><span>{productAvailability(product.quantity)}</span></div><Link href={`/product/${product.id}`} className="underlined-link">View product <ArrowRight size={14} /></Link></div></article>)}</div>;
}

export function ShopCraftSection({ craftId, title = "Shop this craft", copy = "Handcrafted pieces published by the makers connected to this living craft." }: { craftId: number | null | undefined; title?: string; copy?: string }) {
  const query = trpc.product.listByCraft.useQuery({ craftId: craftId ?? 1 }, { enabled: Boolean(craftId) });
  const products = (query.data ?? []) as PublishedProductCard[];
  if (!craftId) return null;
  return <section className="shop-craft-section section-pad section-ivory"><div className="container"><div className="shop-craft-heading"><div><span className="eyebrow">Carry the craft home</span><h2>{title}<br /><em>from the maker.</em></h2></div><p>{copy}</p></div>{query.isLoading ? <p className="shop-craft-state">Looking for published studio pieces…</p> : products.length ? <ProductCards products={products} /> : <div className="shop-craft-empty"><PackageOpen size={21} /><div><b>No products published yet.</b><p>This craft’s story is still available to explore; a studio product will appear here only when a linked Artisan publishes one.</p></div></div>}</div></section>;
}

export function ArtisanProductShelf({ artisanKey }: { artisanKey: string }) {
  const query = trpc.product.listPublishedForArtisan.useQuery({ artisanKey });
  const products = (query.data ?? []) as PublishedProductCard[];
  return <section className="shop-craft-section artisan-product-shelf section-pad section-ivory"><div className="container"><div className="shop-craft-heading"><div><span className="eyebrow">Take a piece of the experience home</span><h2>Made by the<br /><em>maker you met.</em></h2></div><p>Discover handcrafted pieces published by this same studio. Enquiries go directly to the linked Artisan—there is no cart or payment step here.</p></div>{query.isLoading ? <p className="shop-craft-state">Looking for published studio pieces…</p> : products.length ? <ProductCards products={products} /> : <div className="shop-craft-empty"><PackageOpen size={21} /><div><b>No products published yet.</b><p>This Artisan has not published a Traveller-visible product catalogue.</p></div></div>}</div></section>;
}
