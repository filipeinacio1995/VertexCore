//lib/cart.ts

export type CartItem = {
  package_id: number;
  name: string;
  price: number; // display only
  quantity: number;
  image?: string; // ✅ added
};

const KEY = "tebex_cart_v1";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:changed"));
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1) {
  const cart = getCart();
  const found = cart.find((c) => c.package_id === item.package_id);

  if (found) return; // ✅ already in cart, do nothing

  cart.push({ ...item, quantity: 1 }); // ✅ always 1
  setCart(cart);
}

export function removeFromCart(package_id: number) {
  setCart(getCart().filter((c) => c.package_id !== package_id));
}

export function clearCart() {
  setCart([]);
}
 

