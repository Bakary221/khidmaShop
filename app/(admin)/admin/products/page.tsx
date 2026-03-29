"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Box,
  Star,
  Upload,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminDataDisplay } from "@/components/admin/AdminDataDisplay";
import { createProduct, deleteProduct, listProducts, updateProduct, toggleProductActive } from "@/services/product.service";
import { listCategories } from "@/services/category.service";
import { formatCurrency } from "@/utils/format";
import { Product } from "@/types/product";
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
  active: true,
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

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listCategories({ includeInactive: true }),
  });

  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);

  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map(c => c.trim()).filter(Boolean),
      };
      return editing ? updateProduct(editing.id, payload) : createProduct(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit", editing ? "mis à jour" : "créé");
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit supprimé");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await toggleProductActive(id, active);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploadingImages(true);

    try {
      const urls: string[] = [];
      for (const file of Array.from(e.target.files)) {
        const url = await readFileAsDataUrl(file);
        urls.push(url);
      }
      setForm((prev) => ({
        ...prev,
        images: [...prev.images.filter(i => i), ...urls],
      }));
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Pagination logic removed - handled by AdminDataDisplay

  const openModal = (product?: Product) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name,
        price: product.price,
        images: product.images,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        brand: product.brand,
        description: product.description,
        sizes: product.sizes?.join(",") || "S,M,L",
        colors: product.colors?.join(",") || "Noir,Blanc",
        featured: product.featured,
        stock: product.stock || 0,
        rating: product.rating || 4.5,
        active: product.active,
      });
    } else {
      reset();
    }
    setOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <AdminHeader
          icon={<Box className="h-6 w-6" />}
          title="Produits"
          description="Gérez le catalogue de votre boutique"
          breadcrumbs={[{ label: "Accueil" }, { label: "Produits" }]}
        />
        <AdminButton onClick={() => openModal()} className="h-fit">
          <Plus className="h-4 w-4" />
          Ajouter
        </AdminButton>
      </div>

      {/* Products Section */}
      <AdminCard>
        <div className="space-y-6">
          <AdminDataDisplay
            data={products}
            isLoading={isLoading}
            itemsPerPage={8}
            defaultView="grid"
            emptyMessage="Aucun produit trouvé"
            renderGrid={(products) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg border border-black/10 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-black/5 overflow-hidden">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-black/20">
                          <Box className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 space-y-2">
                        {product.featured && (
                          <div className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
                            Featured
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-3">
                        <p className="text-sm text-black/60">{product.categoryName}</p>
                        <h3 className="font-bold text-black line-clamp-2">{product.name}</h3>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-lg text-black">{formatCurrency(product.price)}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium text-black">{product.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {product.active ? "Actif" : "Inactif"}
                        </span>
                        <span className="text-black/60">{product.stock || 0} en stock</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(product)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-black/90 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                          Éditer
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(product.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Suppr.
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            renderList={(products) => (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-black/10 hover:bg-black/2.5 transition-colors"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-black/10">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-black/20">
                          <Box className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-black truncate">{product.name}</h3>
                          <p className="text-sm text-black/60">{product.categoryName}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm">
                            <span className="font-medium text-black">{formatCurrency(product.price)}</span>
                            <span className="text-black/60">{product.stock || 0} en stock</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {product.active ? "Actif" : "Inactif"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openModal(product)}
                            className="px-3 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-black/90 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(product.id)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </div>
      </AdminCard>

      {/* Modal */}
      {open && (
        <Modal
          open={open}
          onClose={handleClose}
          title={editing ? "Éditer le produit" : "Ajouter un produit"}
          className="max-w-sm sm:max-w-3xl"
        >
          <div className="space-y-5">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold text-black mb-3">Informations générales</h3>
              <div className="space-y-4">
                <AdminInput
                  label="Nom du produit"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: T-shirt Premium"
                  required
                />
                <AdminInput
                  label="Marque"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Ex: Nike"
                />
                <AdminInput
                  label="Catégorie"
                  value={form.categoryId}
                  onChange={(e) => {
                    const cat = categories.find(c => c.id === e.target.value);
                    setForm({
                      ...form,
                      categoryId: e.target.value,
                      categoryName: cat?.name || "",
                    });
                  }}
                  options={categories.map(c => ({ label: c.name, value: c.id }))}
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div>
              <h3 className="font-semibold text-black mb-3">Prix et stock</h3>
              <div className="grid grid-cols-2 gap-4">
                <AdminInput
                  label="Prix"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  min={0}
                />
                <AdminInput
                  label="Stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
                  placeholder="0"
                  min={0}
                />
              </div>
            </div>

            {/* Details */}
            <div>
              <h3 className="font-semibold text-black mb-3">Détails</h3>
              <div className="space-y-4">
                <AdminInput
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description du produit..."
                  textarea
                />
                <AdminInput
                  label="Tailles disponibles"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  placeholder="S,M,L,XL"
                  helperText="Séparées par des virgules"
                />
                <AdminInput
                  label="Couleurs disponibles"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  placeholder="Noir,Blanc,Bleu"
                  helperText="Séparées par des virgules"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="font-semibold text-black mb-3">Images</h3>
              <div className="space-y-3">
                {form.images.map((img, i) => (
                  img && (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-black/10">
                      <Image
                        src={img}
                        alt={`Preview ${i}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  )
                ))}
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-black/20 rounded-lg cursor-pointer hover:border-black/40 transition-colors">
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto text-black/40 mb-2" />
                    <span className="text-sm font-medium text-black">Ajouter des images</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Rating & Featured */}
            <div>
              <h3 className="font-semibold text-black mb-3">Options</h3>
              <div className="space-y-4">
                <AdminInput
                  label="Note"
                  type="number"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })}
                  min={0}
                  max={5}
                />
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-black/20"
                  />
                  <span className="text-sm font-medium text-black">En avant (Featured)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded border-black/20"
                  />
                  <span className="text-sm font-medium text-black">Produit actif</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-lg border border-black/20 text-black hover:bg-black/5 font-medium transition-colors"
              >
                Annuler
              </button>
              <AdminButton
                onClick={() => saveMutation.mutate()}
                loading={saveMutation.isPending}
                className="flex-1"
              >
                {editing ? "Mettre à jour" : "Créer"}
              </AdminButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
