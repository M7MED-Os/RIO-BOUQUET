export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  images: string[];
  category?: string;
  views_count?: number;
  created_at: string;
}
