// ── Database row types ──────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  email_verified_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  price_cents: number;
  currency: string;
  category_id: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  thumbnail_url: string | null;
  demo_video_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  status: string;
  total_cents: number;
  currency: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  price_cents: number;
  quantity: number;
  created_at: string;
}

export interface DownloadToken {
  id: string;
  order_item_id: string;
  token: string;
  downloads_used: number;
  max_downloads: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string;
  body: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  expires_at: string;
  created_at: string;
}

// ── Public-safe user types (no password hash) ──────────────────────────

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  email_verified_at: string | null;
  created_at: string;
}

export interface PublicAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
}

// ── API request/response types ─────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: PublicUser;
}

export interface AdminAuthResponse {
  admin: PublicAdmin;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
