import { Category } from "@/types/product";
import { Order } from "@/types/order";
import { Product } from "@/types/product";
import { User } from "@/types/user";

export const categoriesSeed: Category[] = [
  { id: "cat-men", name: "Vêtements homme", slug: "vetements-homme", active: true },
  { id: "cat-shoes", name: "Chaussures", slug: "chaussures", active: true },
  { id: "cat-tech", name: "Électronique", slug: "electronique", active: true },
];

export const productsSeed: Product[] = [
  {
    id: "prd-001",
    name: "Chemise Oxford Premium",
    slug: "chemise-oxford-premium",
    price: 18000,
    images: [
      "/assets/products/chemise-1.jpg",
      "/assets/products/chemise-2.jpg",
    ],
    categoryId: "cat-men",
    categoryName: "Vêtements homme",
    brand: "Khidma",
    description: "Chemise premium en coton, coupe nette, finition minimaliste et durable.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir", "Blanc"],
    featured: true,
    stock: 24,
    rating: 4.8,
    active: true,
  },
  {
    id: "prd-002",
    name: "Sneakers Urbaines",
    slug: "sneakers-urbaines",
    price: 32000,
    images: [
      "/assets/products/sneakers-1.jpg",
      "/assets/products/sneakers-2.jpg",
    ],
    categoryId: "cat-shoes",
    categoryName: "Chaussures",
    brand: "Khidma",
    description: "Sneakers sobres et confortables pour un usage quotidien.",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Noir", "Gris"],
    featured: true,
    stock: 18,
    rating: 4.7,
    active: true,
  },
  {
    id: "prd-003",
    name: "Smartwatch Minimal",
    slug: "smartwatch-minimal",
    price: 45000,
    images: [
      "/assets/products/watch-1.jpg",
      "/assets/products/watch-2.jpg",
    ],
    categoryId: "cat-tech",
    categoryName: "Électronique",
    brand: "Nova",
    description: "Montre connectée avec suivi d'activité et autonomie fiable.",
    sizes: ["Unique"],
    colors: ["Noir", "Argent"],
    featured: true,
    stock: 13,
    rating: 4.6,
    active: true,
  },
  {
    id: "prd-004",
    name: "Polo Premium",
    slug: "polo-premium",
    price: 15000,
    images: [
      "/assets/products/polo-1.jpg",
    ],
    categoryId: "cat-men",
    categoryName: "Vêtements homme",
    brand: "Studio",
    description: "Polo structuré, facile à porter, avec une silhouette propre.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blanc", "Noir", "Gris"],
    featured: false,
    stock: 32,
    rating: 4.5,
    active: true,
  },
  {
    id: "prd-005",
    name: "Casque Audio Pro",
    slug: "casque-audio-pro",
    price: 38000,
    images: [
      "/assets/products/headphone-1.jpg",
    ],
    categoryId: "cat-tech",
    categoryName: "Électronique",
    brand: "Soundly",
    description: "Casque sans fil au son équilibré et au design discret.",
    sizes: ["Unique"],
    colors: ["Noir"],
    featured: false,
    stock: 11,
    rating: 4.4,
    active: true,
  },
];

export const usersSeed: User[] = [
  {
    id: "usr-001",
    name: "Aminata Koné",
    phone: "0700000001",
    role: "client",
    address: "Cocody, Abidjan",
    createdAt: "2026-03-20T08:30:00.000Z",
  },
  {
    id: "usr-002",
    name: "Moussa Traoré",
    phone: "0700000002",
    role: "admin",
    address: "Plateau, Abidjan",
    createdAt: "2026-03-19T10:30:00.000Z",
  },
  {
    id: "usr-003",
    name: "Sara Diabaté",
    phone: "0700000003",
    role: "client",
    address: "Marcory, Abidjan",
    createdAt: "2026-03-18T14:10:00.000Z",
  },
  {
    id: "usr-004",
    name: "Ousmane Kouassi",
    phone: "0700000004",
    role: "client",
    address: "Yopougon, Abidjan",
    createdAt: "2026-03-17T12:00:00.000Z",
  },
];

export const ordersSeed: Order[] = [
  {
    id: "ord-1001",
    customerName: "Aminata Koné",
    phone: "0700000001",
    address: "Cocody, Abidjan",
    latitude: 5.3509,
    longitude: -4.0031,
    status: "confirmee",
    createdAt: "2026-03-25T10:20:00.000Z",
    total: 50000,
    items: [
      {
        id: "cart-1",
        product: productsSeed[0],
        quantity: 2,
        size: "M",
        color: "Noir",
      },
    ],
  },
  {
    id: "ord-1002",
    customerName: "Moussa Traoré",
    phone: "0700000002",
    address: "Plateau, Abidjan",
    latitude: 5.3202,
    longitude: -4.0165,
    status: "en_attente",
    createdAt: "2026-03-26T14:45:00.000Z",
    total: 77000,
    items: [
      {
        id: "cart-2",
        product: productsSeed[1],
        quantity: 1,
        size: "42",
        color: "Noir",
      },
      {
        id: "cart-3",
        product: productsSeed[2],
        quantity: 1,
      },
    ],
  },
];

export const authOtpDemo = "123456";
