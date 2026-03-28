"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ElementType, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgePercent,
  CheckSquare,
  ImagePlus,
  Layers3,
  Package,
  Palette,
  Pencil,
  Plus,
  ShoppingBag,
  Tag,
  TextCursorInput,
  Trash2,
  Star,
  Boxes,
  Upload,
  X,
  RefreshCw,
} from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";
import { Modal } from "@/components/ui/Modal";
import { Loader } from "@/components/ui/Loader";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createProduct, deleteProduct, listProducts, updateProduct } from "@/services/product.service";
import { listCategories } from "@/services/category.service";
import { formatCurrency } from "@/utils/format";
import { Product } from "@/types/product";
import { cn } from "@/utils/cn";
import { useToast } from "@/hooks/useToast";

const emptyForm = {
  name: "",
  price: 0,
  images: [""],
  categoryId: "",
  categoryName: "",
  brand: "",
  description: "",
  sizes: "S,M,L",
  colors: "Noir,Blanc",
  featured: false,
  stock: 0,
  rating: 4.5,
};

type ProductForm = typeof emptyForm;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Impossible de lire cette image."));
    reader.readAsDataURL(file);
  });
}

type FieldProps = {
  label: string;
  icon: ElementType;
  className?: string;
  hint?: string;
  children: ReactNode;
};

function Field({ label, icon: Icon, className, hint, children }: FieldProps) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      {hint ? <p className="text-xs leading-5 text-black/45">{hint}</p> : null}
      {children}
    </label>
  );
}

type ProductPreviewProps = {
  image?: string;
  name: string;
  brand: string;
  categoryName: string;
  rating: number;
  price: number;
};

function ProductPreviewCard({ image, name, brand, categoryName, rating, price }: ProductPreviewProps) {
  return (
    <article className="card-base overflow-hidden">
      <div className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-black/5 sm:aspect-[4/5]">
          {image ? (
            <img
              src={image}
              alt={name || "Aperçu produit"}
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-black/45">
              Ajoute une image pour voir l’aperçu exact de la carte produit.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">{brand || "Marque"}</p>
          <div className="block truncate text-sm font-medium leading-5 sm:text-[15px]">{name || "Nom du produit"}</div>
          <div className="flex min-w-0 items-center gap-2 text-[11px] text-black/55 sm:text-xs">
            <Star className="h-3.5 w-3.5 fill-black" />
            <span className="shrink-0">{rating.toFixed(1)}</span>
            <span className="shrink-0">•</span>
            <span className="min-w-0 truncate">{categoryName || "Catégorie"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold leading-none sm:text-base">{formatCurrency(price || 0)}</p>
          <button type="button" className="btn-base w-full bg-black px-3 py-3 text-xs text-white sm:w-auto sm:self-start sm:px-4 sm:py-2">
            <ShoppingBag className="mr-2 h-3.5 w-3.5" />
            Ajouter
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listProducts(),
  });
  const { data: categories = [] } = useQuery({ queryKey: ["admin-categories"], queryFn: listCategories });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const previewImage = form.images[0]?.trim() || "";

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      price: product.price,
      images: product.images.slice(0, 4).length ? product.images.slice(0, 4) : [""],
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      brand: product.brand,
      description: product.description,
      sizes: product.sizes.join(","),
      colors: product.colors.join(","),
      featured: product.featured,
      stock: product.stock,
      rating: product.rating,
    });
    setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const images = form.images.map((item) => item.trim()).filter(Boolean).slice(0, 4);
      if (!images[0]) {
        throw new Error("L'image principale est obligatoire.");
      }

      const category = categories.find((item) => item.id === form.categoryId);
      const payload = {
        name: form.name,
        price: Number(form.price),
        images,
        categoryId: form.categoryId,
        categoryName: category?.name ?? form.categoryName,
        brand: form.brand,
        description: form.description,
        sizes: form.sizes.split(",").map((item) => item.trim()).filter(Boolean),
        colors: form.colors.split(",").map((item) => item.trim()).filter(Boolean),
        featured: form.featured,
        stock: Number(form.stock),
        rating: Number(form.rating),
      };
      return editing ? updateProduct(editing.id, payload) : createProduct(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
      resetForm();
    },
    onError: (err: Error) => toast.error("Produit non enregistré", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const columns = useMemo(
    () => [
      { header: "Produit" },
      { header: "Catégorie" },
      { header: "Prix" },
      { header: "Stock" },
      { header: "Actions" },
    ],
    [],
  );

  const updateImage = async (index: number, file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format invalide", "Choisis une vraie image.");
      return;
    }

    const nextImage = await readFileAsDataUrl(file);
    setForm((current) => {
      const next = [...current.images];
      while (next.length < 1) next.push("");
      next[index] = nextImage;
      return { ...current, images: next.slice(0, 4) };
    });
  };

  const removeImage = (index: number) => {
    setForm((current) => {
      const next = [...current.images];
      if (index === 0) {
        next[0] = "";
      } else {
        next.splice(index, 1);
      }
      if (!next.length) next.push("");
      return { ...current, images: next.slice(0, 4) };
    });
  };

  const appendImage = async (file?: File | null) => {
    if (!file) return;
    const filledCount = form.images.filter(Boolean).length;
    if (filledCount >= 4) {
      toast.error("Maximum atteint", "Un produit peut avoir au maximum 4 images.");
      return;
    }

    const nextImage = await readFileAsDataUrl(file);
    setForm((current) => {
      const next = [...current.images];
      const firstEmpty = next.findIndex((item) => !item);
      const targetIndex = firstEmpty === -1 ? next.length : firstEmpty;
      if (targetIndex >= 4) return current;
      next[targetIndex] = nextImage;
      return { ...current, images: next.slice(0, 4) };
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Produits"
        title="Catalogue Khidma Shop"
        description="Ajoutez, modifiez et organisez les produits de la boutique avec leurs images, tailles, couleurs et catégories."
        action={
          <button onClick={openCreate} className="btn-base bg-black px-4 py-3 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.75rem] border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">Produits</p>
          <p className="mt-2 text-3xl font-semibold">{products.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">Catégories</p>
          <p className="mt-2 text-3xl font-semibold">{categories.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">Vedettes</p>
          <p className="mt-2 text-3xl font-semibold">{products.filter((product) => product.featured).length}</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-black/10 bg-[linear-gradient(135deg,#111111,#2d3138)] px-4 py-4 text-white shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/55">Gestion</p>
            <h2 className="text-lg font-semibold">Visuels, tailles et couleurs des produits</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <ShoppingBag className="h-4 w-4" />
            Boutique cohérente avec le client
          </div>
        </div>
      </div>

      {isLoading ? (
        <Loader className="py-10" />
      ) : (
        <AdminTable
          columns={columns}
          rows={products}
          renderRow={(product) => (
            <>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-black/55">{product.brand}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-black/65">{product.categoryName}</td>
              <td className="px-4 py-4 text-sm font-medium">{formatCurrency(product.price)}</td>
              <td className="px-4 py-4 text-sm text-black/65">
                <span className="inline-flex rounded-full border border-black/10 px-3 py-1 text-xs">{product.stock}</span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(product)} className="rounded-full border border-black/10 p-2 transition hover:bg-black/5">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(product.id)} className="rounded-full border border-black/10 p-2 transition hover:bg-black/5">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </>
          )}
          renderMobileRow={(product) => (
            <div className="card-base overflow-hidden p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="mt-1 text-sm text-black/55">{product.brand}</p>
                  <p className="mt-1 text-xs text-black/45">{product.categoryName}</p>
                </div>
                <p className="font-semibold">{formatCurrency(product.price)}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">Stock {product.stock}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(product)} className="rounded-full border border-black/10 p-2 transition hover:bg-black/5">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(product.id)} className="rounded-full border border-black/10 p-2 transition hover:bg-black/5">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      )}

      <Modal
        open={open}
        title={editing ? "Modifier le produit" : "Ajouter un produit"}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        className="max-w-6xl"
      >
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fcfcfc_100%)] p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-black/45">
                <Package className="h-4 w-4" />
                Informations principales
              </div>
              <p className="mt-2 text-sm text-black/55">Remplis les champs essentiels pour publier un produit propre et cohérent.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom du produit" icon={Package} hint="Choisis un nom clair et vendeur." className="sm:col-span-2">
                <input
                  className="input-base"
                  placeholder="Chemise Oxford Premium"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>

              <Field label="Prix" icon={BadgePercent} hint="En francs CFA ou ta devise locale.">
                <input
                  className="input-base"
                  type="number"
                  placeholder="18000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </Field>

              <Field label="Stock" icon={Boxes} hint="Quantité disponible en boutique.">
                <input
                  className="input-base"
                  type="number"
                  placeholder="24"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </Field>

              <Field label="Catégorie" icon={Layers3} hint="Relie le produit au bon univers." className="sm:col-span-2">
                <select className="input-base" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Choisir une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Marque" icon={Tag} hint="Nom de la marque ou de la collection.">
                <input
                  className="input-base"
                  placeholder="Khidma"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </Field>

              <Field label="Note" icon={Star} hint="Ex: 4.5 pour un rendu crédible.">
                <input
                  className="input-base"
                  type="number"
                  step="0.1"
                  placeholder="4.5"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                />
              </Field>

              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <ImagePlus className="h-4 w-4" />
                      Images du produit
                    </div>
                    <p className="mt-1 text-xs text-black/45">Maximum 4 images. La première est obligatoire.</p>
                  </div>
                  <label className="btn-base cursor-pointer border border-black/10 bg-white px-4 py-3 text-sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Ajouter une image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => appendImage(e.target.files?.[0])} />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => {
                    const value = form.images[index]?.trim() || "";
                    const isMain = index === 0;

                    return (
                      <div key={index} className="rounded-3xl border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-xs uppercase tracking-[0.22em] text-black/45">{isMain ? "Image principale" : `Image ${index + 1}`}</p>
                          <span className="rounded-full border border-black/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-black/45">
                            {isMain ? "Obligatoire" : "Optionnelle"}
                          </span>
                        </div>

                        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                          {value ? (
                            <>
                              <img src={value} alt={`Aperçu ${index + 1}`} className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 transition hover:bg-black/20">
                                <div className="absolute inset-x-3 bottom-3 flex gap-2">
                                  <label className="btn-base flex-1 cursor-pointer bg-white px-3 py-2 text-xs text-black shadow-sm">
                                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                    Remplacer
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => updateImage(index, e.target.files?.[0])} />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="rounded-full bg-white p-2 text-black shadow-sm transition hover:bg-black hover:text-white"
                                    aria-label={`Supprimer l'image ${index + 1}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 text-center text-sm text-black/45">
                              <Upload className="h-5 w-5" />
                              <span>Importer une image</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => updateImage(index, e.target.files?.[0])} />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Field label="Tailles" icon={TextCursorInput} hint="Sépare par des virgules.">
                <input
                  className="input-base"
                  placeholder="S, M, L, XL"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                />
              </Field>

              <Field label="Couleurs" icon={Palette} hint="Sépare par des virgules.">
                <input
                  className="input-base"
                  placeholder="Noir, Blanc"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                />
              </Field>

              <Field label="Description" icon={CheckSquare} hint="Une description courte aide à vendre." className="sm:col-span-2">
                <textarea
                  className="input-base min-h-28"
                  rows={4}
                  placeholder="Donnez une description courte et vendeuse du produit."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>

              <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.015] px-4 py-3 sm:col-span-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                <div>
                  <p className="text-sm font-medium">Produit vedette</p>
                  <p className="text-xs text-black/45">Mettre ce produit en avant sur la home.</p>
                </div>
              </label>

              <button onClick={() => saveMutation.mutate()} className="btn-base sm:col-span-2 bg-black px-4 py-3 text-white">
                {saveMutation.isPending ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-black/10 bg-[linear-gradient(180deg,#111111,#262a31)] p-4 text-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">Aperçu</p>
              <div className="mt-4 rounded-3xl bg-white text-black shadow-[0_18px_50px_rgba(0,0,0,0.15)]">
                <ProductPreviewCard
                  image={previewImage}
                  name={form.name}
                  brand={form.brand}
                  categoryName={
                    form.categoryId ? categories.find((item) => item.id === form.categoryId)?.name ?? "Catégorie" : "Catégorie"
                  }
                  rating={Number(form.rating) || 0}
                  price={Number(form.price) || 0}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-black/45">Conseils</p>
              <div className="mt-3 space-y-3 text-sm text-black/65">
                <p>Utilise des images locales nettes pour garder le catalogue rapide et cohérent.</p>
                <p>Limite le nombre de couleurs et de tailles pour ne garder que les vraies variantes disponibles.</p>
                <p>Garde une description courte: elle doit rassurer, pas raconter tout le produit.</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
