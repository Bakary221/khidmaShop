import { categoriesSeed, productsSeed } from "@/services/mock-db";
import { Product, ProductFilters } from "@/types/product";
import { delay } from "@/utils/delay";
import { createId } from "@/utils/id";
import { getSafeStorage } from "@/utils/storage";

const STORAGE_KEY = "khidma-products";

function loadProducts() {
  const storage = getSafeStorage();
  const raw = storage.getItem(STORAGE_KEY);

  if (!raw) return [...productsSeed];

  try {
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) && parsed.length ? parsed : [...productsSeed];
  } catch {
    return [...productsSeed];
  }
}

function persistProducts(nextProducts: Product[]) {
  const storage = getSafeStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify(nextProducts));
}

let products: Product[] = loadProducts();

export async function listProducts(filters?: ProductFilters) {
  await delay(500);

  const search = filters?.search?.trim().toLowerCase();

  return products.filter((product) => {
    if (!filters?.includeInactive && !product.active) return false;

    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search);
    const matchesCategory = !filters?.categoryId || product.categoryId === filters.categoryId;
    const matchesBrand = !filters?.brand || product.brand.toLowerCase() === filters.brand.toLowerCase();
    const matchesPrice = !filters?.maxPrice || product.price <= filters.maxPrice;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });
}

export async function getProductById(id: string) {
  await delay(350);
  return products.find((product) => product.id === id) ?? null;
}

export async function listFeaturedProducts() {
  await delay(250);
  return products.filter((product) => product.featured);
}

export async function createProduct(input: Omit<Product, "id" | "slug"> & { slug?: string }) {
  await delay(600);
  const product: Product = {
    ...input,
    id: createId("prd"),
    slug: input.slug ?? input.name.toLowerCase().replace(/\s+/g, "-"),
    active: input.active ?? true,
  };
  products = [product, ...products];
  persistProducts(products);
  return product;
}

export async function updateProduct(id: string, input: Omit<Product, "id" | "slug"> & { slug?: string }) {
  await delay(600);
  products = products.map((product) =>
    product.id === id
      ? {
          ...product,
          ...input,
          id,
          slug: input.slug ?? input.name.toLowerCase().replace(/\s+/g, "-"),
        }
      : product,
  );
  persistProducts(products);
  return products.find((product) => product.id === id) ?? null;
}

export async function toggleProductActive(id: string, active: boolean) {
  await delay(350);
  products = products.map((product) => (product.id === id ? { ...product, active } : product));
  persistProducts(products);
  return products.find((product) => product.id === id) ?? null;
}


export async function deleteProduct(id: string) {
  await delay(400);
  products = products.filter((product) => product.id !== id);
  persistProducts(products);
  return true;
}

export async function listProductBrands() {
  await delay(200);
  return Array.from(new Set(products.map((product) => product.brand)));
}

export async function listProductStats() {
  await delay(200);
  return {
    total: products.length,
    featured: products.filter((product) => product.featured).length,
    categories: categoriesSeed.length,
  };
}

export async function setProductsActiveByCategory(categoryId: string, active: boolean) {
  await delay(250);
  products = products.map((product) => (product.categoryId === categoryId ? { ...product, active } : product));
  persistProducts(products);
  return products.filter((product) => product.categoryId === categoryId);
}

export function getProductSnapshot() {
  return [...products];
}
