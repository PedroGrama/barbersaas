"use client";

import React, { useState, useEffect } from "react";

interface TimePickerSheetProps {
  value: string | null;
  onChange: (time: string) => void;
  openHour: number;
  closeHour: number;
  bookedSlots?: string[];
  disabled?: boolean;
}

export function TimePickerSheet({
  value,
  onChange,
  openHour,
  closeHour,
  bookedSlots = [],
  disabled = false
}: TimePickerSheetProps) {

  const [selectedHour, setSelectedHour] = useState<string>("");
  const [selectedMinute, setSelectedMinute] = useState<string>("");

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setSelectedHour(String(parseInt(h))); // parse to int then string to match select values cleanly
      setSelectedMinute(String(parseInt(m)));
    } else {
      setSelectedHour("");
      setSelectedMinute("");
    }
  }, [value]);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedHour(val);
    setSelectedMinute(""); // reset min
    if (val === "") {
        onChange("");
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = e.target.value;
    setSelectedMinute(m);
    if (selectedHour && m) {
      onChange(`${selectedHour.padStart(2, '0')}:${m.padStart(2, '0')}`);
    }
  };

  const hours: number[] = [];
  for (let h = openHour; h <= closeHour; h++) {
    hours.push(h);
  }

  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); 

  return (
    <div className="flex gap-2">
      {/* SELECIONAR HORA */}
      <select
        value={selectedHour}
        onChange={handleHourChange}
        disabled={disabled}
        className="flex-1 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 text-sm dark:bg-zinc-950 font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 disabled:opacity-50 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
      >
        <option value="" disabled hidden>Hora...</option>
        {hours.map(h => {
          let allOccupied = true;
          const availableMinutes = h === closeHour ? [0] : minutes;
          for (const m of availableMinutes) {
            const slotStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            if (!bookedSlots.includes(slotStr)) {
              allOccupied = false;
              break;
            }
          }

          return (
            <option key={h} value={h} disabled={allOccupied}>
              {h.toString().padStart(2, '0')}h {allOccupied ? '(Indisponível)' : ''}
            </option>
          );
        })}
      </select>

      <span className="flex items-center text-zinc-500 font-bold">:</span>

      {/* SELECIONAR MINUTO */}
      <select
        value={selectedMinute}
        onChange={handleMinuteChange}
        disabled={disabled || !selectedHour}
        className="flex-1 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 text-sm dark:bg-zinc-950 font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 disabled:opacity-50 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
      >
        <option value="" disabled hidden>Minuto...</option>
        {selectedHour && minutes.map(m => {
          if (parseInt(selectedHour) === closeHour && m > 0) return null;
          const slotStr = `${parseInt(selectedHour).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          const isOccupied = bookedSlots.includes(slotStr);

          return (
            <option key={m} value={m} disabled={isOccupied}>
              {m.toString().padStart(2, '0')} {isOccupied ? '(Ocupado)' : ''}
            </option>
          );
        })}
      </select>
    </div>
  );
}

