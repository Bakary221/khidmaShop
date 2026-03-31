"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { createOrder } from "@/services/order.service";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/useToast";
import { Loader } from "@/components/ui/Loader";
import { InvoiceView } from "@/features/checkout/InvoiceView";
import { formatCurrency } from "@/utils/format";

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

  const hasLocation = latitude !== null && longitude !== null;
  const canSubmit = useMemo(() => items.length > 0 && Boolean(user) && hasLocation, [items.length, user, hasLocation]);

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
          disabled={!canSubmit || mutation.isPending}
          onClick={() =>
            mutation.mutate({
              customerName: user.name,
              phone: user.phone,
              address: undefined,
              latitude,
              longitude,
              items,
            })
          }
          className="btn-base w-full bg-black px-5 py-4 text-white"
        >
          {mutation.isPending ? "Création..." : "Confirmer la commande"}
        </button>

        {currentOrder ? <InvoiceView order={currentOrder} /> : null}
      </div>
    </div>
  );
}
