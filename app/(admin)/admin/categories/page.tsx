"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Tag, AlertCircle } from "lucide-react";
import { listCategories, createCategory, updateCategory, deleteCategory, toggleCategoryActive } from "@/services/category.service";
import { setProductsActiveByCategory } from "@/services/product.service";
import { Modal } from "@/components/ui/Modal";
import { Loader } from "@/components/ui/Loader";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminDataDisplay } from "@/components/admin/AdminDataDisplay";
import { Category } from "@/types/product";
import { getInitials } from "@/utils/identity";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({ 
    queryKey: ["admin-categories"], 
    queryFn: () => listCategories({ includeInactive: true }) 
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", active: true });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await toggleCategoryActive(id, active);
      await setProductsActiveByCategory(id, active);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const reset = () => {
    setEditing(null);
    setForm({ name: "", slug: "", active: true });
  };

  const saveMutation = useMutation({
    mutationFn: async () => (editing ? updateCategory(editing.id, form) : createCategory(form)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      reset();
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const openModal = (category?: Category) => {
    if (category) {
      setEditing(category);
      setForm({ name: category.name, slug: category.slug, active: category.active });
    } else {
      reset();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const activateCategories = categories.filter(c => c.active);
  const inactiveCategories = categories.filter(c => !c.active);
  const allCategories = [...activateCategories, ...inactiveCategories];

  const renderCategoryCard = (category: Category, isGrid: boolean) => (
    <div key={category.id} className={`p-4 rounded-lg border border-black/20 bg-white hover:bg-black/5 transition-colors ${!isGrid && 'flex items-center justify-between'}`}>
      <div className={isGrid ? '' : 'flex items-center gap-4 flex-1'}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-xs font-bold text-white">
              {getInitials(category.name)}
            </div>
            <div>
              <p className="font-semibold text-black">{category.name}</p>
              <p className="text-xs text-black/60">Slug: {category.slug || "N/A"}</p>
            </div>
          </div>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border border-black/10 ${
            category.active ? "bg-black text-white" : "bg-white text-black"
          }`}>
            {category.active ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>
      <div className={`flex gap-2 ${isGrid ? 'mt-3' : 'ml-3'}`}>
        <button
          onClick={() => openModal(category)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-black/5 transition-colors ${isGrid && 'flex-1 justify-center'}`}
        >
          <Pencil className="h-4 w-4" />
          Éditer
        </button>
        <button
          onClick={() => deleteMutation.mutate(category.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors ${isGrid && 'flex-1 justify-center'}`}
        >
          <Trash2 className="h-4 w-4" />
          Suppr.
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <AdminHeader
          icon={<Tag className="h-6 w-6" />}
          title="Catégories"
          description="Gérez les collections de votre boutique"
          breadcrumbs={[{ label: "Accueil" }, { label: "Catégories" }]}
        />
        <AdminButton
          onClick={() => openModal()}
          className="h-fit"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </AdminButton>
      </div>

      {/* Data Display with Grid/List and Pagination */}
      <AdminCard>
        <AdminDataDisplay
          data={allCategories}
          isLoading={isLoading}
          itemsPerPage={8}
          defaultView="grid"
          emptyMessage="Aucune catégorie trouvée"
          renderGrid={(categories) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => renderCategoryCard(category, true))}
            </div>
          )}
          renderList={(categories) => (
            <div className="space-y-2">
              {categories.map((category) => renderCategoryCard(category, false))}
            </div>
          )}
        />
      </AdminCard>

      {/* Modal */}
      {open && (
        <Modal
          open={open}
          onClose={handleClose}
          title={editing ? "Éditer la catégorie" : "Ajouter une catégorie"}
        >
          <div className="space-y-4">
            <AdminInput
              label="Nom"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Vêtements"
              required
            />
            <AdminInput
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Ex: vetements"
              helperText="Identifiant unique de la catégorie"
            />
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 rounded border-black/20"
              />
              <span className="text-sm font-medium text-black">Catégorie active</span>
            </label>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-black/5 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !form.name.trim()}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saveMutation.isPending ? "Enregistrement..." : (editing ? "Mettre à jour" : "Créer")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
