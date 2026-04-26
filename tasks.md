# 🌸 Flower Shop Web App — Full Execution Plan

> **Target Stack:** Next.js (App Router) · Tailwind CSS · Supabase (Postgres + Storage + Auth)
> **Audience:** Junior developer or AI agent executing tasks step-by-step
> **Convention:** Complete tasks in order. Do not skip sections.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Database Setup (Supabase)](#2-database-setup-supabase)
3. [Auth Setup (Admin)](#3-auth-setup-admin)
4. [Storage Setup (Images)](#4-storage-setup-images)
5. [Frontend Pages](#5-frontend-pages)
6. [Admin Dashboard Features](#6-admin-dashboard-features)
7. [WhatsApp Integration](#7-whatsapp-integration)
8. [Deployment](#8-deployment)
9. [Optional Enhancements](#9-optional-enhancements)

---

## 1. Project Setup

### 1.1 Initialize Next.js Project

- [x] Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` inside `d:\flowers_project`
- [x] Confirm the project boots with `npm run dev` and is accessible at `http://localhost:3000`
- [x] Delete the default boilerplate content from `src/app/page.tsx` and `src/app/globals.css`

### 1.2 Install Dependencies

- [x] Install Supabase client: `npm install @supabase/supabase-js @supabase/ssr`
- [x] Install utility libraries: `npm install clsx lucide-react`
- [x] (Optional) Install form handling: `npm install react-hook-form`

### 1.3 Environment Variables

- [x] Create a `.env.local` file at the project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_WHATSAPP_PHONE=<phone-number-with-country-code>   # e.g. 9665XXXXXXXX
```

- [x] Add `.env.local` to `.gitignore` (Next.js does this by default — verify it)
- [x] Create a `.env.example` file with the same keys but empty values (for documentation)

### 1.4 Supabase Client Setup

- [x] Create file: `src/lib/supabase/client.ts`
  - Export a browser-side Supabase client using `createBrowserClient` from `@supabase/ssr`
- [x] Create file: `src/lib/supabase/server.ts`
  - Export a server-side Supabase client using `createServerClient` from `@supabase/ssr` (reads cookies)
- [x] Create file: `src/lib/supabase/middleware.ts`
  - Export a helper that refreshes the auth session on every request

### 1.5 Middleware (Auth Guard)

- [x] Create file: `src/middleware.ts`
  - Use the Supabase middleware helper to refresh sessions
  - Protect all routes under `/admin/*` — redirect unauthenticated users to `/admin/login`
  - Allow all other routes to pass through without restriction

### 1.6 Suggested File & Folder Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (font, metadata)
│   ├── page.tsx                    # Home page (product listing)
│   ├── products/
│   │   └── [id]/
│   │       └── page.tsx            # Product detail page
│   └── admin/
│       ├── layout.tsx              # Admin layout (sidebar/topbar)
│       ├── login/
│       │   └── page.tsx            # Admin login page
│       ├── dashboard/
│       │   └── page.tsx            # Admin product list
│       ├── products/
│       │   ├── new/
│       │   │   └── page.tsx        # Add new product form
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx    # Edit product form
│       └── actions.ts              # Server Actions for admin mutations
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── WhatsAppButton.tsx
│   ├── ImageUploader.tsx
│   └── AdminProductTable.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── whatsapp.ts                 # WhatsApp link generator utility
│   └── utils.ts                   # General helpers (formatPrice, etc.)
├── types/
│   └── product.ts                  # TypeScript Product type
└── middleware.ts
```

---

## 2. Database Setup (Supabase)

### 2.1 Create Supabase Project

- [x] Go to https://supabase.com and create a new project
- [x] Note the **Project URL** and **Anon Key** from Project Settings → API
- [x] Note the **Service Role Key** (keep it secret — only for server-side admin use)

### 2.2 Create the `products` Table

- [x] Open the Supabase **SQL Editor** and run the following:

```sql
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2),          -- nullable, no payment required
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

- [x] Verify the table appears under **Table Editor**

### 2.3 Enable Row Level Security (RLS)

- [x] Enable RLS on the `products` table:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

- [x] Create a **public read** policy (everyone can view products):

```sql
CREATE POLICY "Allow public read"
  ON products
  FOR SELECT
  USING (true);
```

- [x] Create **admin write** policies (only authenticated users can INSERT/UPDATE/DELETE):

```sql
CREATE POLICY "Allow authenticated insert"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);
```

> **Security Note:** These policies allow ANY authenticated user to mutate data.
> If you only want a specific admin email, add `auth.email() = 'admin@yourshop.com'` to the `USING` clause.

### 2.4 Define TypeScript Type

- [x] Create file: `src/types/product.ts`

```ts
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
}
```

---

## 3. Auth Setup (Admin)

### 3.1 Create Admin User in Supabase

- [x] Go to **Authentication → Users** in the Supabase dashboard
- [x] Click **Add user** and create an admin account with an email and strong password
- [x] Do NOT expose this user registration flow publicly — there is no sign-up page

### 3.2 Admin Login Page

- [x] Create `src/app/admin/login/page.tsx`
- [x] Build a login form with:
  - Email input field
  - Password input field
  - Submit button labeled "Sign In"
  - Error message display area
- [x] On form submit, call `supabase.auth.signInWithPassword({ email, password })`
- [x] On success, redirect to `/admin/dashboard`
- [x] On failure, display a user-friendly error: `"Invalid credentials. Please try again."`

### 3.3 Admin Logout

- [x] Add a "Sign Out" button to the admin layout
- [x] On click, call `supabase.auth.signOut()` then redirect to `/admin/login`

### 3.4 Session Protection via Middleware

- [x] Verify that `src/middleware.ts` intercepts `/admin/*` routes
- [x] If no active session exists, redirect to `/admin/login`
- [x] If session exists, allow access to the dashboard

### 3.5 Edge Cases

- [ ] Handle expired sessions gracefully — auto redirect to login
- [ ] Ensure the login page itself is NOT protected (exclude `/admin/login` from the middleware guard)
- [ ] Do not show the admin nav or any admin UI to non-authenticated users

---

## 4. Storage Setup (Images)

### 4.1 Create Storage Bucket

- [ ] In Supabase dashboard, go to **Storage → Buckets**
- [ ] Click **New Bucket**
- [ ] Name it `product-images`
- [ ] Set it to **Public** (so product images are accessible via URL without auth)
- [ ] Click **Create Bucket**

### 4.2 Storage Policies

- [ ] Allow public to read files (already inherited from public bucket):

```sql
CREATE POLICY "Allow public read on product-images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');
```

- [ ] Allow authenticated users to upload:

```sql
CREATE POLICY "Allow authenticated upload to product-images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');
```

- [ ] Allow authenticated users to delete their uploads:

```sql
CREATE POLICY "Allow authenticated delete from product-images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
```

### 4.3 Image Upload Logic

- [x] Create a reusable `src/components/ImageUploader.tsx` component
- [ ] The component must:
  - Render a file `<input accept="image/*">`
  - Show an image preview using `URL.createObjectURL()` before upload
  - Upload to Supabase Storage on form submit (not on file select)
  - Return the public URL after upload
- [ ] File naming convention: use a unique name to avoid collisions:
  - Format: `<uuid>-<timestamp>.<ext>`
  - Use `crypto.randomUUID()` for the uuid part
- [ ] Accepted formats: `.jpg`, `.jpeg`, `.png`, `.webp`
- [ ] Maximum file size check: reject files larger than **5 MB** with a clear error message

### 4.4 Edge Cases for Images

- [ ] If no image is uploaded, `image_url` must be saved as `null` in the database
- [ ] Display a placeholder/fallback image (e.g., a flower icon SVG) when `image_url` is null
- [ ] When a product is deleted, also delete the corresponding file from `product-images` bucket
- [ ] When a product image is replaced (during edit), delete the old file from storage before uploading the new one

---

## 5. Frontend Pages

### 5.1 Root Layout (`src/app/layout.tsx`)

- [ ] Set `<html lang="ar" dir="rtl">` for Arabic RTL support
- [ ] Import and apply a Google Font suitable for Arabic + Latin (e.g., `Noto Sans Arabic` or `Cairo`)
- [ ] Add global metadata: site title, description, favicon
- [ ] Include a global `<header>` with the shop name/logo and navigation
- [ ] Include a global `<footer>` with contact info and WhatsApp number

### 5.2 Home Page (`src/app/page.tsx`)

- [ ] Fetch all products from the `products` table server-side using the Supabase server client
- [ ] Sort by `created_at DESC` (newest first)
- [ ] Render products inside a `<ProductGrid>` component
- [ ] Handle the empty state: display a friendly message if no products exist yet
- [ ] The page must be a **Server Component** for optimal SEO and performance

### 5.3 Product Card Component (`src/components/ProductCard.tsx`)

- [ ] Display:
  - Product image (with fallback placeholder)
  - Product name
  - Price (formatted, shown only if not null)
  - "View Details" button → links to `/products/[id]`
  - "Order via WhatsApp" button → opens WhatsApp link
- [ ] Implement hover effects (subtle scale or shadow transition)
- [ ] Ensure the card is fully responsive (mobile-first)

### 5.4 Product Grid Component (`src/components/ProductGrid.tsx`)

- [ ] Render a responsive CSS grid:
  - Mobile: 1 column
  - Tablet (sm): 2 columns
  - Desktop (lg): 3–4 columns
- [ ] Map over the `products` array and render a `<ProductCard>` for each

### 5.5 Product Detail Page (`src/app/products/[id]/page.tsx`)

- [ ] Fetch a single product by `id` from the database server-side
- [ ] If product is not found, call `notFound()` to render the Next.js 404 page
- [ ] Display:
  - Full-size product image (with fallback)
  - Product name (`<h1>`)
  - Product description (full text)
  - Price (if available)
  - A prominent "Order via WhatsApp" button
- [ ] Add page-level metadata using `generateMetadata()` for SEO:
  - Title: `<Product Name> — Flower Shop`
  - Description: first 160 characters of the product description
- [ ] Add a "Back to Products" link

### 5.6 Error & Loading States

- [ ] Create `src/app/loading.tsx` — skeleton loader or spinner for the home page
- [ ] Create `src/app/error.tsx` — friendly error UI with a refresh button
- [ ] Create `src/app/not-found.tsx` — custom 404 page with a link back to home

### 5.7 Responsive Design Requirements

- [ ] Test all pages on mobile (320px), tablet (768px), and desktop (1280px) viewpoints
- [ ] Ensure touch targets (buttons) are at least 44×44px on mobile
- [ ] Ensure text is readable without horizontal scrolling on small screens

---

## 6. Admin Dashboard Features

### 6.1 Admin Layout (`src/app/admin/layout.tsx`)

- [ ] Wrap all admin pages in a layout that:
  - Shows a sidebar or top navigation with links to: Dashboard, Add Product
  - Displays the logged-in admin email
  - Includes a "Sign Out" button
- [ ] Use a `dir="ltr"` override for the admin panel (LTR layout is common for dashboards)

### 6.2 Product Listing Dashboard (`src/app/admin/dashboard/page.tsx`)

- [ ] Fetch all products from the `products` table
- [ ] Render inside `<AdminProductTable>` component with columns:
  - Thumbnail image
  - Name
  - Price (or "Not set")
  - Created At (formatted date)
  - Actions: Edit | Delete
- [ ] Add an "Add New Product" button linking to `/admin/products/new`

### 6.3 Admin Product Table Component (`src/components/AdminProductTable.tsx`)

- [ ] Render a styled HTML `<table>` with alternating row colors
- [ ] Each row has Edit and Delete action buttons
- [ ] Delete button triggers a confirmation dialog before proceeding
- [ ] After successful delete, refresh the product list (use `router.refresh()`)

### 6.4 Add Product Page (`src/app/admin/products/new/page.tsx`)

- [ ] Render a product form with these fields:
  - Name (required, text)
  - Description (optional, textarea)
  - Price (optional, number input, placeholder: "Leave empty if price not shown")
  - Image (file upload, handled by `<ImageUploader>`)
- [ ] On submit (via Server Action in `actions.ts`):
  1. Upload image to Supabase Storage → get public URL
  2. Insert new row into `products` table
  3. Redirect to `/admin/dashboard` on success
- [ ] Show inline validation errors (e.g., "Name is required")
- [ ] Show a success toast/message after product is created

### 6.5 Edit Product Page (`src/app/admin/products/[id]/edit/page.tsx`)

- [ ] Fetch the existing product data by `id`
- [ ] Pre-fill the form with existing values
- [ ] Show existing image with option to replace it
- [ ] On submit (via Server Action in `actions.ts`):
  1. If a new image was selected: upload new image, delete old image from storage
  2. Update the product row in the database
  3. Redirect to `/admin/dashboard` on success

### 6.6 Delete Product (Server Action)

- [ ] In `src/app/admin/actions.ts`, create a `deleteProduct(id: string)` Server Action:
  1. Fetch the product to get `image_url`
  2. Extract the storage path from the URL
  3. Delete the file from the `product-images` bucket
  4. Delete the row from the `products` table
  5. Call `revalidatePath('/admin/dashboard')` to refresh the cache

### 6.7 Server Actions File (`src/app/admin/actions.ts`)

- [ ] Create the following Server Actions (all marked `'use server'`):
  - `createProduct(formData: FormData)` — handles insert
  - `updateProduct(id: string, formData: FormData)` — handles update
  - `deleteProduct(id: string)` — handles delete
- [ ] Each action must verify the user is authenticated before proceeding (use the server client)
- [ ] Return structured error/success responses

### 6.8 Security Best Practices for Admin

- [ ] Never expose the Supabase Service Role Key to the client
- [ ] All mutations must go through Server Actions (server-side only)
- [ ] Validate all form inputs on the server before database operations
- [ ] Sanitize text inputs to prevent XSS
- [ ] Use HTTPS in production (enforced by Vercel/hosting)

---

## 7. WhatsApp Integration

### 7.1 WhatsApp Utility Function

- [ ] Create file: `src/lib/whatsapp.ts`
- [ ] Export a function `generateWhatsAppLink(product: Product): string` that:
  1. Builds a human-friendly message (Arabic or bilingual):

  ```
  مرحباً 👋، أريد طلب هذا المنتج:

  🌸 الاسم: {product.name}
  🔑 الرقم: {product.id}
  💰 السعر: {product.price ?? "يُحدد عند التواصل"}

  أرجو التواصل معي للتأكيد. شكراً!
  ```

  2. Encodes the message using `encodeURIComponent()`
  3. Returns: `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`

- [ ] The phone number must be read from `process.env.NEXT_PUBLIC_WHATSAPP_PHONE`
- [ ] Phone number format: country code without `+` or `00` (e.g., `966512345678`)

### 7.2 WhatsApp Button Component (`src/components/WhatsAppButton.tsx`)

- [ ] Accept `product: Product` as a prop
- [ ] Call `generateWhatsAppLink(product)` to get the URL
- [ ] Render an `<a>` tag with:
  - `href={whatsappLink}`
  - `target="_blank"`
  - `rel="noopener noreferrer"`
- [ ] Style with a green WhatsApp-branded color (`#25D366`)
- [ ] Include the WhatsApp icon (SVG or from `lucide-react`)
- [ ] Label the button: "اطلب الآن عبر واتساب" (Order Now via WhatsApp)

### 7.3 Edge Cases for WhatsApp

- [ ] If `price` is null, the message should say "السعر يُحدد عند التواصل" instead of showing null/undefined
- [ ] Ensure the encoded URL does not break on special characters (Arabic text, emojis, line breaks)
- [ ] Test the link on both WhatsApp Web (desktop) and WhatsApp App (mobile)
- [ ] Verify the phone number is set correctly — if missing, log a warning and disable the button

---

## 8. Deployment

### 8.1 Prepare for Production

- [ ] Ensure all environment variables are set and documented in `.env.example`
- [ ] Run `npm run build` locally and fix any TypeScript or build errors
- [ ] Run `npm run lint` and fix all ESLint warnings/errors

### 8.2 Deploy to Vercel (Recommended)

- [ ] Push the project to a GitHub repository
- [ ] Go to https://vercel.com and import the GitHub project
- [ ] In the Vercel project settings, add all environment variables from `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_WHATSAPP_PHONE`
- [ ] Deploy and verify the production URL works

### 8.3 Post-Deployment Checklist

- [ ] Verify the home page loads products from Supabase
- [ ] Verify the admin login works at `/admin/login`
- [ ] Verify creating, editing, and deleting products works
- [ ] Verify image uploads work in production
- [ ] Test WhatsApp link on mobile — ensure it opens the app
- [ ] Test WhatsApp link on desktop — ensure it opens WhatsApp Web
- [ ] Verify unauthenticated users cannot access `/admin/dashboard`
- [ ] Verify the 404 page works for invalid product URLs

### 8.4 Custom Domain (Optional)

- [ ] In Vercel project settings, go to **Domains**
- [ ] Add your custom domain (e.g., `flowershop.com`)
- [ ] Update DNS records as instructed by Vercel
- [ ] Verify HTTPS is active on the custom domain

---

## 9. Optional Enhancements

> These tasks are NOT required for the MVP but add significant value.

### 9.1 Product Categories

- [ ] Add a `category` column (TEXT) to the `products` table
- [ ] Add a category filter/tabs UI on the home page
- [ ] Add a category selector in the admin product form

### 9.2 Product Search

- [ ] Add a search input on the home page
- [ ] Filter products by name client-side (for small catalogs) or use Supabase full-text search for larger ones

### 9.3 Featured / Out-of-Stock Products

- [ ] Add an `is_featured` (BOOLEAN) column to highlight products
- [ ] Add an `in_stock` (BOOLEAN) column to show/hide products from the public listing
- [ ] Show a "Out of Stock" badge on unavailable products

### 9.4 Product Ordering / Sorting

- [ ] Add drag-and-drop reordering of products in the admin dashboard
- [ ] Store an `order_index` (INTEGER) column in the `products` table

### 9.5 SEO & Performance

- [ ] Add `robots.txt` and `sitemap.xml` using Next.js built-in support
- [ ] Add Open Graph meta tags for product pages (for social sharing previews)
- [ ] Optimize images using Next.js `<Image>` component with `priority` for above-the-fold content

### 9.6 Analytics

- [ ] Integrate Vercel Analytics or a privacy-friendly tool like Plausible
- [ ] Track "Order via WhatsApp" button clicks as conversion events

### 9.7 Multi-language Support

- [ ] Use `next-intl` or `next-i18next` for Arabic/English language toggling
- [ ] Store translations in `messages/ar.json` and `messages/en.json`

### 9.8 Rate Limiting & Abuse Prevention

- [ ] Add rate limiting on admin login attempts via Supabase Auth settings (lockout after N failed attempts)
- [ ] Consider using Vercel Edge Middleware for additional request throttling

---

## Definition of Done

A task is considered complete when:

1. The feature works correctly in the browser (both mobile and desktop)
2. No TypeScript errors (`npm run build` succeeds)
3. No console errors in the browser dev tools
4. Edge cases (missing image, empty fields, invalid IDs) are handled gracefully
5. Admin-only features are inaccessible to unauthenticated users

---

*Generated: 2026-04-25 | Version: 1.0*
