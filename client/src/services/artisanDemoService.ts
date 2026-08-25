// Local Artisan product/order convenience state. Shared experiences and Traveller bookings use managed database procedures instead.
import { publishDemoState } from "./demoStatePersistence";

export type ArtisanProduct = { id: string; name: string; category: string; description: string; price: number; stock: number; views: number; status: "Live" | "Draft" | "Low stock" };
export type ArtisanOrder = { id: string; guest: string; item: string; amount: number; state: "Ready" | "Confirmed" | "Booked" | "Completed" };
export type ArtisanDemoState = { products: ArtisanProduct[]; orders: ArtisanOrder[] };

const STORAGE_KEY = "virasat-artisan-demo-state";
const initial = (): ArtisanDemoState => ({
  products: [
    { id: "elephant", name: "Lacquered wooden elephant", category: "Woodcraft", description: "A hand-turned companion with a warm lacquer finish.", price: 450, stock: 18, views: 284, status: "Live" },
    { id: "spinning-top", name: "Wooden spinning top", category: "Woodcraft", description: "A playful turned object with a warm lacquer finish.", price: 220, stock: 42, views: 163, status: "Live" },
    { id: "starter-set", name: "Maker starter set", category: "Workshop set", description: "A small material kit inspired by a working craft table.", price: 980, stock: 7, views: 81, status: "Low stock" },
  ],
  orders: [
    { id: "KT-1028", guest: "Aditi Rao", item: "Lacquered wooden elephant", amount: 900, state: "Confirmed" },
    { id: "KT-1027", guest: "Meera Nair", item: "Toy-making workshop", amount: 1200, state: "Booked" },
    { id: "KT-1026", guest: "Ryan Shah", item: "Wooden spinning top", amount: 440, state: "Ready" },
  ],
});
const read = (): ArtisanDemoState => { if (typeof window === "undefined") return initial(); try { return { ...initial(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<ArtisanDemoState>) }; } catch { return initial(); } };
const write = (state: ArtisanDemoState) => { if (typeof window !== "undefined") { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); publishDemoState("artisan", state); } return state; };

export const artisanDemoService = {
  getState: read,
  saveProduct(product: Omit<ArtisanProduct, "id" | "views" | "status"> & { id?: string }) { const state = read(); const id = product.id || `product-${Date.now()}`; const next: ArtisanProduct = { ...product, id, views: state.products.find((item) => item.id === id)?.views ?? 0, status: product.stock <= 8 ? "Low stock" : "Live" }; return write({ ...state, products: state.products.some((item) => item.id === id) ? state.products.map((item) => item.id === id ? next : item) : [next, ...state.products] }); },
  deleteProduct(id: string) { const state = read(); return write({ ...state, products: state.products.filter((item) => item.id !== id) }); },
  adjustStock(id: string, delta: number) { const state = read(); return write({ ...state, products: state.products.map((item) => item.id === id ? { ...item, stock: Math.max(0, item.stock + delta), status: Math.max(0, item.stock + delta) <= 8 ? "Low stock" : "Live" } : item) }); },
  updateOrder(id: string) { const state = read(); const sequence: ArtisanOrder["state"][] = ["Ready", "Confirmed", "Booked", "Completed"]; return write({ ...state, orders: state.orders.map((order) => order.id === id ? { ...order, state: sequence[(sequence.indexOf(order.state) + 1) % sequence.length] } : order) }); },
};
