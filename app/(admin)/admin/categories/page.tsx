"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ElementType, ReactNode } from "react";
import { Hash, Pencil, Plus, Shapes, Tag, Trash2 } from "lucide-react";
import { listCategories, createCategory, updateCategory, deleteCategory } from "@/services/category.service";
import { AdminTable } from "@/components/admin/AdminTable";
import { Modal } from "@/components/ui/Modal";
import { Loader } from "@/components/ui/Loader";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Category } from "@/types/product";
import { getInitials } from "@/utils/identity";

type FieldProps = {
  label: string;
  icon: ElementType;
  hint?: string;
  children: ReactNode;
};

function Field({ label, icon: Icon, hint, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      {hint ? <p className="text-xs leading-5 text-black/45">{hint}</p> : null}
      {children}
    </label>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({ queryKey: ["admin-categories"], queryFn: listCategories });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });

  const columns = useMemo(
    () => [
      { header: "Nom" },
      { header: "Slug" },
      { header: "Actions" },
    ],
    [],
  );

  const reset = () => {
    setEditing(null);
    setForm({ name: "", slug: "" });
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catégories"
        title="Structurer les collections"
        description="Organisez les univers de la boutique pour garder un catalogue lisible et cohérent avec l'expérience client."
        action={
          <button
            onClick={() => {
              reset();
              setOpen(true);
            }}
            className="btn-base bg-black px-4 py-3 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une catégorie
          </button>
        }
      />

      <div className="rounded-[2rem] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_100%)] p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-black/65">
          <Shapes className="h-4 w-4" />
          Collections actives dans la boutique
        </div>
      </div>

      {isLoading ? (
        <Loader className="py-10" />
      ) : (
        <AdminTable
          columns={columns}
          rows={categories}
          renderRow={(category) => (
            <>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black text-xs font-semibold text-white">
                    {getInitials(category.name)}
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-black/45">Collection Khidma Shop</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">{category.slug}</span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditing(category);
                      setForm({ name: category.name, slug: category.slug });
                      setOpen(true);
                    }}
                    className="rounded-full border border-black/10 p-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(category.id)} className="rounded-full border border-black/10 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </>
          )}
          renderMobileRow={(category) => (
            <div className="card-base p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black text-xs font-semibold text-white">
                    {getInitials(category.name)}
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-black/45">{category.slug}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(category);
                      setForm({ name: category.name, slug: category.slug });
                      setOpen(true);
                    }}
                    className="rounded-full border border-black/10 p-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(category.id)} className="rounded-full border border-black/10 p-2">
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
        title={editing ? "Modifier la catégorie" : "Ajouter une catégorie"}
        onClose={() => {
          setOpen(false);
          reset();
        }}
      >
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fcfcfc_100%)] p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-black/45">
                <Shapes className="h-4 w-4" />
                Structure
              </div>
              <p className="mt-2 text-sm text-black/55">Une catégorie claire aide à garder la boutique simple à parcourir.</p>
            </div>

            <div className="grid gap-4">
              <Field label="Nom de la catégorie" icon={Tag} hint="Ex: Vêtements homme, Chaussures, Électronique">
                <input
                  className="input-base"
                  placeholder="Vêtements homme"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Slug" icon={Hash} hint="Version courte et lisible pour l’URL.">
                <input
                  className="input-base"
                  placeholder="vetements-homme"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </Field>
              <button onClick={() => saveMutation.mutate()} className="btn-base bg-black px-4 py-3 text-white">
                Enregistrer
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-black/10 bg-[linear-gradient(180deg,#111111,#262a31)] p-4 text-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">Aperçu</p>
              <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-lg font-semibold">{form.name || "Nom de la catégorie"}</p>
                <p className="mt-1 text-sm text-white/65">{form.slug || "slug-de-la-categorie"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    Collection boutique
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    Navigation simple
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-black/45">Bon réflexe</p>
              <p className="mt-3 text-sm leading-6 text-black/65">
                Garde des noms courts et des slugs cohérents pour faciliter la gestion, la lecture et les futurs filtres.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
