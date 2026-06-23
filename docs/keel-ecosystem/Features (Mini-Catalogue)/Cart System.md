# Cart System

## CartContext

Located in `src/context/CartContext.jsx`. Wraps the entire app and provides:

| Method | Description |
|---|---|
| `addToCart(item, size, color)` | Adds item with optional variant selections |
| `removeFromCart(id)` | Removes item by cart ID |
| `updateQuantity(id, delta)` | Increment/decrement quantity |
| `clearCart()` | Empty the cart |
| `cartItems` | Array of cart items |
| `cartTotal` | Calculated total |
| `cartCount` | Number of items |
| `setCartOpen(bool)` | Open/close the cart drawer |

### Cart Item Schema

```js
{
  id: "unique-cart-id",    // Generated with crypto.randomUUID()
  item: { /* original catalogue item */ },
  size: "M",               // Selected size (nullable)
  color: "Red",            // Selected color (nullable)
  quantity: 1,
}
```

### Persistence

Cart is saved to `localStorage` under key `mini-catalogue-cart`. Restored on app load.

## CartDrawer

Slide-out drawer component:
- Lists all items with image, name, size/color, quantity controls
- Shows per-item total and cart total
- "Checkout via WhatsApp" button — generates a message with all items and opens `wa.me` link
- Close on backdrop click or X button
- Animated with framer-motion (`slideIn` from right)

### WhatsApp Checkout

The "Order via WhatsApp" button builds a message string:

```
Hello! I'd like to order:

1. Floral Summer Dress (Size: M, Color: Red) x1 - Ksh 2,500
2. Leather Crossbody Bag x2 - Ksh 6,400

Total: Ksh 8,900
```

Then opens `https://wa.me/254712345678?text=...encoded...`.

## CartDrawer Component

- Uses `useCart()` context
- `XMarkIcon` (Heroicons) for close button
- `MinusIcon` / `PlusIcon` for quantity controls
- `TrashIcon` for remove
- Responsive: full width on mobile, max-w-md on desktop
- Stacks below navbar on mobile, beside on desktop

## Key Files

| File | Purpose |
|---|---|
| `src/context/CartContext.jsx` | Cart state, localStorage, methods |
| `src/components/CartDrawer.jsx` | Slide-out cart UI |
