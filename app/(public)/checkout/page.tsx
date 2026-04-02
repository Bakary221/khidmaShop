"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { createOrder } from "@/services/order.service";
import { updateUser } from "@/services/user.service";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/useToast";
import { Loader } from "@/components/ui/Loader";
import { InvoiceView } from "@/features/checkout/InvoiceView";
import { formatCurrency } from "@/utils/format";

const isPlaceholderName = (name?: string, phone?: string) => {
  if (!name) return true;
  const trimmed = name.trim();
  if (!trimmed) return true;
  const normalized = trimmed.toLowerCase();
  if (normalized.startsWith("user ")) return true;
  if (phone) {
    const digits = phone.replace(/\D/g, "").toLowerCase();
    if (!digits) return false;
    if (normalized === `user ${digits}` || normalized === digits) {
      return true;
    }
  }
  return false;
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.subtotal);
  const user = useAuthStore((state) => state.user);
  const addOrder = useOrderStore((state) => state.addOrder);
  const currentOrder = useOrderStore((state) => state.currentOrder);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  const toast = useToast();
  const { latitude, longitude, loading: geoLoading, error, requestLocation } = useGeolocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileAddress, setProfileAddress] = useState("");

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      addOrder(order);
      setCurrentOrder(order);
      clearCart();
      toast.success("Commande créée", `Votre commande ${order.id} est confirmée.`);
    },
    onError: (err: Error) => {
      toast.error("Échec de la commande", err.message);
    },
  });

  const profileMutation = useMutation({
    mutationFn: (payload: { name: string; address: string }) =>
      updateUser(user!.id, payload),
    onSuccess: (updatedUser) => {
      useAuthStore.getState().setUser(updatedUser);
      setFirstName("");
      setLastName("");
      setProfileAddress("");
    },
  });

  const hasLocation = latitude !== null && longitude !== null;
  const needsProfile = Boolean(
    user &&
      (!user.address?.trim() || isPlaceholderName(user.name, user.phone)),
  );
  const isProfileFormValid =
    Boolean(firstName.trim() && lastName.trim() && profileAddress.trim());
  const canSubmit = useMemo(() => {
    if (!items.length || !user || !hasLocation) {
      return false;
    }
    if (needsProfile) {
      return isProfileFormValid;
    }
    return true;
  }, [items.length, user, hasLocation, needsProfile, isProfileFormValid]);

  const isCartEmpty = items.length === 0;
  const isSubmitting = mutation.isPending || profileMutation.isPending;
  const confirmButtonDisabled = isCartEmpty || !canSubmit || isSubmitting;

  const handleConfirmOrder = async () => {
    if (confirmButtonDisabled) {
      return;
    }
    if (!user) return;

    const orderName = needsProfile
      ? `${firstName.trim()} ${lastName.trim()}`.trim()
      : user.name;
    const orderAddress = needsProfile
      ? profileAddress.trim()
      : user.address?.trim() ?? undefined;

    if (needsProfile) {
      try {
        await profileMutation.mutateAsync({
          name: orderName || user.name,
          address: profileAddress.trim(),
        });
      } catch (error) {
        if (error instanceof Error) {
          toast.error("Impossible d'enregistrer votre profil", error.message);
        } else {
          toast.error("Impossible d'enregistrer votre profil", "Veuillez réessayer");
        }
        return;
      }
    }

    mutation.mutate({
      customerName: orderName,
      phone: user.phone,
      address: orderAddress,
      latitude,
      longitude,
      items,
    });
  };

  if (!items.length && !currentOrder) {
    return (
      <div className="container-safe py-6">
        <div className="card-base p-8 text-center">
          <p className="text-sm text-black/60">Aucun article à commander.</p>
          <button onClick={() => router.push("/products")} className="btn-base mt-4 bg-black px-4 py-3 text-white">
            Aller au catalogue
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-safe py-6">
        <div className="card-base p-8 text-center">
          <p className="text-sm text-black/60">Veuillez vous connecter pour finaliser la commande.</p>
          <button onClick={() => router.push("/auth")} className="btn-base mt-4 bg-black px-4 py-3 text-white">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-safe space-y-6 py-6 pb-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-black/45">Checkout</p>
        <h1 className="section-title">Finaliser la commande</h1>
      </div>

      <div className="space-y-6">
        {needsProfile && (
          <div className="card-base space-y-4 rounded-[32px] border border-black/10 bg-white p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/45">Première commande</p>
              <h2 className="text-lg font-semibold text-black">Complétez vos informations</h2>
              <p className="text-sm text-black/60">
                Ce profil sera sauvegardé pour vos prochaines commandes afin de ne plus avoir à saisir votre nom et adresse.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-xs text-black/70">
                <span>Prénom</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="input-base w-full"
                  placeholder="Prénom"
                />
              </label>
              <label className="space-y-2 text-xs text-black/70">
                <span>Nom</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="input-base w-full"
                  placeholder="Nom"
                />
              </label>
            </div>
            <label className="space-y-2 text-xs text-black/70">
              <span>Adresse de livraison</span>
              <textarea
                value={profileAddress}
                onChange={(event) => setProfileAddress(event.target.value)}
                className="input-base h-32 w-full resize-none"
                placeholder="Ex : Bloc D, Cocody Angré 8e tranche"
              />
            </label>
          </div>
        )}

        <div className="card-base space-y-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Localisation</p>
              <p className="text-sm text-black/55">
                Autorisez la localisation pour activer la commande. Elle sera utilisée uniquement pour la livraison.
              </p>
            </div>
            <button
              type="button"
              onClick={requestLocation}
              disabled={geoLoading || hasLocation}
              className="btn-base border border-black/10 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/40"
            >
              {geoLoading ? <Loader label="..." /> : hasLocation ? "Position récupérée" : "Récupérer ma position"}
            </button>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {hasLocation ? (
            <p className="text-xs text-black/60">
              Latitude: {latitude?.toFixed(5)}, Longitude: {longitude?.toFixed(5)}
            </p>
          ) : (
            <p className="text-xs text-black/40">La géolocalisation est obligatoire pour confirmer.</p>
          )}
        </div>

        <div className="card-base space-y-4 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Récapitulatif</p>
            <p className="text-sm font-semibold">{formatCurrency(subtotal())}</p>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-black/55">
                    {item.quantity} x {formatCurrency(item.product.price)}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={confirmButtonDisabled}
          onClick={handleConfirmOrder}
          className="btn-base w-full bg-black px-5 py-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCartEmpty ? "Panier vide" : isSubmitting ? "Création..." : "Confirmer la commande"}
        </button>

        {currentOrder ? <InvoiceView order={currentOrder} /> : null}
      </div>
    </div>
  );
}
