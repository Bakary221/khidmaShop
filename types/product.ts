export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categoryId: string;
  categoryName: string;
  brand: string;
  description: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  stock: number;
  rating: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  brand?: string;
  maxPrice?: number;
};
