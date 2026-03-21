import Cookies from 'js-cookie';

export interface CookieCartItem {
  productId: string;
  quantity: number;
}

const CART_COOKIE_NAME = 'silk haus_cart';

export function getCart(): CookieCartItem[] {
  const cartJson = Cookies.get(CART_COOKIE_NAME);
  if (!cartJson) return [];
  try {
    return JSON.parse(cartJson);
  } catch {
    return [];
  }
}

export function addToCart(productId: string, qty: number = 1): void {
  const cart = getCart();
  const existingItemIndex = cart.findIndex((item) => item.productId === productId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += qty;
  } else {
    cart.push({ productId, quantity: qty });
  }

  Cookies.set(CART_COOKIE_NAME, JSON.stringify(cart), { expires: 30 }); // 30 days
}

export function removeFromCart(productId: string): void {
  const cart = getCart();
  const updatedCart = cart.filter((item) => item.productId !== productId);
  Cookies.set(CART_COOKIE_NAME, JSON.stringify(updatedCart), { expires: 30 });
}

export function updateQuantity(productId: string, qty: number): void {
  const cart = getCart();
  const existingItemIndex = cart.findIndex((item) => item.productId === productId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity = Math.max(1, qty);
    Cookies.set(CART_COOKIE_NAME, JSON.stringify(cart), { expires: 30 });
  }
}

export function clearCart(): void {
  Cookies.remove(CART_COOKIE_NAME);
}

export function getCartCount(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}
