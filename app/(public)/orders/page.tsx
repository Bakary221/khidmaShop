"use client";

import Link from 'next/link';
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { listOrders } from '@/services/order.service';
import { Order } from '@/types/order';
import { Loader } from '@/components/ui/Loader';
import { formatCurrency, formatDate, orderLabel, orderStatusLabel } from '@/utils/format';
import { statusTone } from '@/utils/identity';

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

  if (isLoading) {
    return <Loader className="py-10" />;
  }

  return (
    <div className="container-safe space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-black/40">Mes commandes</p>
          <h1 className="text-2xl font-bold tracking-tight">Historique</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-medium text-black/60 mb-2">Aucune commande</p>
          <Link href="/products" className="btn-base bg-black text-white px-6 py-3">
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: Order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="group block rounded-2xl border border-black/8 p-6 hover:border-black/20 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusTone(order.status)}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-lg font-bold">{orderLabel(order)}</p>
                  <p className="text-sm text-black/60 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <p className="text-xl font-bold text-right">{formatCurrency(order.total)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
