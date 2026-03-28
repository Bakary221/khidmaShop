"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Mail, ShieldCheck } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";
import { Modal } from "@/components/ui/Modal";
import { Loader } from "@/components/ui/Loader";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { listUsers } from "@/services/user.service";
import { formatDate } from "@/utils/format";
import { User } from "@/types/user";
import { getInitials, statusTone } from "@/utils/identity";

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: listUsers });
  const [selected, setSelected] = useState<User | null>(null);

  const columns = useMemo(
    () => [
      { header: "Utilisateur" },
      { header: "Téléphone" },
      { header: "Rôle" },
      { header: "Créé" },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Utilisateurs"
        title="Clients et administrateurs"
        description="Suivez les comptes connectés à Khidma Shop et gardez une vue claire sur les profils et les rôles."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_100%)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-black/45">
            <Mail className="h-4 w-4" />
            Clients
          </div>
          <p className="mt-2 text-3xl font-semibold">{users.filter((user) => user.role === "client").length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_100%)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-black/45">
            <ShieldCheck className="h-4 w-4" />
            Admins
          </div>
          <p className="mt-2 text-3xl font-semibold">{users.filter((user) => user.role === "admin").length}</p>
        </div>
      </div>

      {isLoading ? (
        <Loader className="py-10" />
      ) : (
        <AdminTable
          columns={columns}
          rows={users}
          renderRow={(user) => (
            <>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black text-xs font-semibold text-white">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-black/45">{user.address ?? "-"}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-sm">{user.phone}</td>
              <td className="px-4 py-4 text-sm">{user.role}</td>
              <td className="px-4 py-4 text-sm text-black/65">{formatDate(user.createdAt)}</td>
            </>
          )}
          renderMobileRow={(user) => (
            <button onClick={() => setSelected(user)} className="card-base w-full p-4 text-left shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black text-xs font-semibold text-white">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-black/45">{user.phone}</p>
                  </div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs capitalize ${statusTone(user.role)}`}>{user.role}</span>
              </div>
            </button>
          )}
        />
      )}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? "Utilisateur"}>
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-black/45">Profil</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs capitalize ${statusTone(selected.role)}`}>{selected.role}</span>
                <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">
                  Créé le {formatDate(selected.createdAt)}
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/10 p-3">
                <p className="text-xs text-black/45">Téléphone</p>
                <p className="mt-1 font-medium">{selected.phone}</p>
              </div>
              <div className="rounded-2xl border border-black/10 p-3">
                <p className="text-xs text-black/45">Rôle</p>
                <p className="mt-1 font-medium">{selected.role}</p>
              </div>
              <div className="rounded-2xl border border-black/10 p-3 sm:col-span-2">
                <p className="text-xs text-black/45">Adresse</p>
                <p className="mt-1 font-medium">
                  <MapPin className="mr-1 inline h-4 w-4" />
                  {selected.address ?? "-"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
