import React, { useMemo, useState } from "react";
import { CalendarDays, CalendarRange, Clock3 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Calendar } from "../../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";

type DeliveryMode = "DELIVERY" | "RECOJO_TIENDA";

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFullDate(value: string) {
  return parseIsoDate(value).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function buildQuickDates(minDate: string) {
  const today = parseIsoDate(minDate);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const weekend = new Date(today);
  while (weekend.getDay() !== 6) {
    weekend.setDate(weekend.getDate() + 1);
  }

  return {
    today: formatIsoDate(today),
    tomorrow: formatIsoDate(tomorrow),
    weekend: formatIsoDate(weekend),
  };
}

export function FriendlyDatePicker({
  value,
  minDate,
  modalidad,
  error,
  onChange,
}: {
  value: string;
  minDate: string;
  modalidad: DeliveryMode;
  error?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const minDateObj = useMemo(() => parseIsoDate(minDate), [minDate]);
  const quickDates = useMemo(() => buildQuickDates(minDate), [minDate]);

  const contextualLabel =
    modalidad === "DELIVERY"
      ? `Entrega programada para ${formatFullDate(value)}.`
      : `Recogerás tu pedido el ${formatFullDate(value)}.`;

  const availabilityHint =
    modalidad === "DELIVERY"
      ? "Delivery coordinado desde la fecha seleccionada. Si necesitas hoy, valida horario de corte."
      : "Recojo en tienda con mayor flexibilidad. Elige la fecha que mejor acomode tu visita.";

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Seleccionar fecha de entrega. Actual: ${selectedDate.toLocaleDateString("es-PE")}`}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
              error ? "border-red-300 bg-red-50/40" : "border-gray-300 bg-gray-50 hover:border-red-300"
            }`}
          >
            <div>
              <p className="text-lg font-semibold text-gray-800">
                {selectedDate.toLocaleDateString("es-PE")}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-500">{contextualLabel}</p>
            </div>
            <CalendarDays className="h-5 w-5 text-gray-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={10} className="w-[min(92vw,370px)] rounded-3xl border-none p-0 shadow-2xl">
          <div className="rounded-3xl bg-white p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-red-600">Fecha sugerida</p>
                <p className="mt-1 text-sm font-medium text-gray-500">{availabilityHint}</p>
              </div>
              <CalendarRange className="h-5 w-5 shrink-0 text-red-500" />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => onChange(quickDates.today)}>
                Hoy
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => onChange(quickDates.tomorrow)}>
                Mañana
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => onChange(quickDates.weekend)}>
                Fin de semana
              </Button>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              month={selectedDate}
              onSelect={(date) => {
                if (!date) return;
                onChange(formatIsoDate(date));
                setOpen(false);
              }}
              disabled={(date) => date < minDateObj}
              className="rounded-2xl border border-gray-100 bg-white p-0"
              classNames={{
                caption_label: "text-sm font-extrabold text-gray-900",
                day_selected: "bg-[#D32F2F] text-white hover:bg-[#B71C1C]",
                day_today: "bg-red-50 font-bold text-red-700",
                day_disabled: "opacity-35 line-through",
                head_cell: "w-10 text-xs font-bold uppercase text-gray-400",
                day: "h-10 w-10 rounded-xl text-sm font-semibold",
              }}
            />
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">Disponible desde {parseIsoDate(minDate).toLocaleDateString("es-PE")}</span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
          {value === quickDates.today ? "Hoy" : value === quickDates.tomorrow ? "Mañana" : "Programado"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
          <Clock3 className="h-3.5 w-3.5" />
          {modalidad === "DELIVERY" ? "Delivery coordinado" : "Recojo flexible"}
        </span>
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : <p className="text-xs text-gray-500">{availabilityHint}</p>}
    </div>
  );
}
