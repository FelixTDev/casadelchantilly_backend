import React from "react";
import { CheckCircle2, CreditCard, FileCheck2, MapPin } from "lucide-react";

function StatusPill({ complete, label, detail }: { complete: boolean; label: string; detail: string }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${complete ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-xl p-2 ${complete ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
          {complete ? <CheckCircle2 className="h-4 w-4" /> : null}
          {!complete && label === "Entrega" ? <MapPin className="h-4 w-4" /> : null}
          {!complete && label === "Pago" ? <CreditCard className="h-4 w-4" /> : null}
          {!complete && label === "Resumen y confirmación" ? <FileCheck2 className="h-4 w-4" /> : null}
        </div>
        <div>
          <p className={`text-sm font-extrabold ${complete ? "text-emerald-900" : "text-gray-900"}`}>{label}</p>
          <p className={`mt-1 text-xs font-medium ${complete ? "text-emerald-700" : "text-gray-500"}`}>{detail}</p>
        </div>
      </div>
    </div>
  );
}

export function CheckoutStatusOverview({
  deliveryReady,
  paymentReady,
  orderReady,
}: {
  deliveryReady: boolean;
  paymentReady: boolean;
  orderReady: boolean;
}) {
  return (
    <div className="mb-8 rounded-3xl bg-white p-5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-red-600">Resumen operativo</p>
          <h2 className="text-xl font-extrabold text-gray-900">Completa entrega, pago y registro final en un solo flujo</h2>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatusPill complete={deliveryReady} label="Entrega" detail={deliveryReady ? "Modalidad y fecha listas" : "Falta modalidad, fecha o dirección"} />
        <StatusPill complete={paymentReady} label="Pago" detail={paymentReady ? "Método y referencia listos" : "Falta referencia o validación del pago"} />
        <StatusPill complete={orderReady} label="Resumen y confirmación" detail={orderReady ? "Pedido listo para registrarse" : "Aún hay datos pendientes antes de confirmar"} />
      </div>
    </div>
  );
}
