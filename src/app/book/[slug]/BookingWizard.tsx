"use client";

import { useState, useEffect } from "react";
import { createPublicAppointment, validateInitialSlot, getAvailableBarbers } from "./actions";
import { useRouter } from "next/navigation";

import { TimePickerSheet } from "@/components/booking/TimePickerSheet";

type BookingWizardProps = {
  tenant: { 
    id: string, name: string, slug: string | null, logoUrl: string | null, allowChooseBarber: boolean, checkinMinutes: number,
    businessHours: { weekday: number, startTime: string, endTime: string, isClosed: boolean }[]
  };
  services: { id: string, name: string, basePrice: number, durationMinutes: number }[];
  barbers: { id: string, name: string }[];
};

export function BookingWizard({ tenant, services, barbers }: BookingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');

  // Workflow State
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [date, setDate] = useState(todayStr); // Auto-select today
  const [time, setTime] = useState("");
  const [barberId, setBarberId] = useState(""); // empty means 'qualquer um' (round-robin)
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [availableBarbers, setAvailableBarbers] = useState(barbers); // Dynamic list
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const router = useRouter();

  // Phone Mask
  const handlePhoneChange = (val: string) => {
    let v = val.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    if (v.length > 10) v = `${v.substring(0, 10)}-${v.substring(10)}`;
    setClientPhone(v);
  };

  // Fetch available barbers when date/time change
  useEffect(() => {
    async function fetchBarbers() {
      if (!tenant.allowChooseBarber) return;
      if (!date || !time) return;
      try {
        const list = await getAvailableBarbers(tenant.id, date, time);
        setAvailableBarbers(list);
        if (!list.find(b => b.id === barberId)) {
          setBarberId(""); // Reset if selected barber is no longer available
        }
      } catch (err: any) {
        console.error(err);
      }
    }
    fetchBarbers();
  }, [date, time, tenant.id, tenant.allowChooseBarber]);

  // Fetch booked slots for TimePicker
  useEffect(() => {
    async function fetchSlots() {
      if (!date) return;
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/bookings/slots?tenantId=${tenant.id}&date=${date}${barberId ? `&barberId=${barberId}` : ""}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setBookedSlots(data);
          
          if (!time) {
            // "Set default booking time to the closest available slot"
            // For the selected day, we map business hours
            const jsDate = new Date(`${date}T00:00:00`);
            const targetWeekday = jsDate.getDay();
            const bh = tenant.businessHours.find(b => b.weekday === targetWeekday);
            if (bh && !bh.isClosed) {
               const openHour = parseInt(bh.startTime.split(":")[0]);
               const closeHour = parseInt(bh.endTime.split(":")[0]);
               const now = new Date();
               let fallbackSlot = "";
               
               for (let h = openHour; h <= closeHour; h++) {
                 for (let m = 0; m < 60; m += 5) {
                   if (h === closeHour && m > 0) continue;
                   const slotStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                   
                   // if same day, only pick future slots
                   if (date === todayStr) {
                      const curTimeMinutes = now.getHours() * 60 + now.getMinutes();
                      const slotMinutes = h * 60 + m;
                      if (slotMinutes <= curTimeMinutes) continue;
                   }
                   
                   if (!data.includes(slotStr)) {
                      fallbackSlot = slotStr;
                      break;
                   }
                 }
                 if (fallbackSlot) break;
               }
               if (fallbackSlot) setTime(fallbackSlot);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [date, tenant.id, tenant.businessHours, barberId]);
  const toggleService = (id: string) => {
    const newSet = new Set(selectedServices);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedServices(newSet);
  };

  const totalValue = Array.from(selectedServices).reduce((acc, id) => {
    return acc + (services.find(s => s.id === id)?.basePrice || 0);
  }, 0);

  const handleNextStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !clientName || !clientPhone) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    
    // Validar agendamento (conflito do barbeiro ou estabelecimento fechado)
    setLoading(true);
    setError("");
    try {
      await validateInitialSlot({
        tenantId: tenant.id,
        dateStr: date,
        timeStr: time,
        barberId: barberId || null
      });
      setStep(2);
    } catch(err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (selectedServices.size === 0) {
      setError("Selecione pelo menos um serviço.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const apptId = await createPublicAppointment({
        tenantId: tenant.id,
        clientName,
        clientPhone,
        dateStr: date, // "YYYY-MM-DD"
        timeStr: time, // "HH:MM"
        barberId: barberId || null,
        serviceIds: Array.from(selectedServices)
      });
      router.push(`/book/${tenant.slug}/${apptId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold mb-2">Reserva Confirmada!</h2>
        <p className="text-zinc-500 mb-6">
          Te aguardamos no dia {date.split('-').reverse().join('/')} às {time}.
        </p>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 p-4 rounded-2xl text-sm text-left">
          <strong>Aviso Importante:</strong> Você precisa fazer o check-in online na plataforma acessando o atalho que receberá, restrito até {tenant.checkinMinutes} minutos antes do início do seu horário. Caso contrário o horário poderá ser repassado a um encaixe presencial.
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
      
      {/* Container que desliza */}
      <div className="flex transition-transform duration-500 ease-in-out w-[200%]" style={{ transform: `translateX(${step === 1 ? '0%' : '-50%'})` }}>
        
        {/* Step 1: Info e Hora */}
        <div className="w-1/2 flex-shrink-0 pe-4">
          <form onSubmit={handleNextStep1} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Seu Nome</label>
              <input required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="João Silva" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Seu Telefone/WhatsApp</label>
              <input required value={clientPhone} onChange={e => handlePhoneChange(e.target.value)} placeholder="(11) 99999-9999" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input required type="date" min={todayStr} max={nextWeekStr} value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horário</label>
                <TimePickerSheet 
                  value={time || null} 
                  onChange={setTime} 
                  openHour={(() => {
                    const jsDate = new Date(`${date}T00:00:00`);
                    const bh = tenant.businessHours.find(b => b.weekday === jsDate.getDay());
                    return bh ? parseInt(bh.startTime.split(":")[0]) : 9;
                  })()}
                  closeHour={(() => {
                    const jsDate = new Date(`${date}T00:00:00`);
                    const bh = tenant.businessHours.find(b => b.weekday === jsDate.getDay());
                    return bh ? parseInt(bh.endTime.split(":")[0]) : 18;
                  })()}
                  bookedSlots={bookedSlots}
                  disabled={loadingSlots}
                />
              </div>
            </div>
            
            {tenant.allowChooseBarber && (
              <div>
                <label className="block text-sm font-medium mb-1">Barbeiro de Preferência</label>
                <select value={barberId} onChange={e => setBarberId(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800 bg-transparent">
                  <option value="">Qualquer profissional disponível</option>
                  {availableBarbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <button type="submit" disabled={loading} className="w-full mt-4 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 flex justify-center items-center">
              {loading ? "Validando Horário..." : "Avançar para Serviços →"}
            </button>
          </form>
        </div>

        {/* Step 2: Serviços */}
        <div className="w-1/2 flex-shrink-0 ps-4 space-y-4">
           <div>
             <h3 className="font-semibold mb-2">Quais serviços deseja realizar?</h3>
             <div className="space-y-2 h-[250px] overflow-y-auto pr-2">
               {services.map(s => (
                 <label key={s.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${selectedServices.has(s.id) ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800 shadow-sm' : 'border-zinc-200 dark:border-zinc-800'}`}>
                   <div className="flex items-center gap-3">
                     <input type="checkbox" checked={selectedServices.has(s.id)} onChange={() => toggleService(s.id)} className="w-4 h-4 rounded border-zinc-300 text-zinc-900" />
                     <span className="font-medium">{s.name}</span>
                   </div>
                   <span className="text-zinc-600 dark:text-zinc-400 font-medium">R$ {s.basePrice.toFixed(2)}</span>
                 </label>
               ))}
             </div>
           </div>

           <div className="flex justify-between items-center text-lg font-bold border-t dark:border-zinc-800 pt-4">
             <span>Total Previsão:</span>
             <span>R$ {totalValue.toFixed(2)}</span>
           </div>

           <div className="flex gap-3 pt-2">
             <button onClick={() => setStep(1)} className="w-1/3 rounded-xl border border-zinc-200 dark:border-zinc-700 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
               Voltar
             </button>
             <button onClick={handleFinish} disabled={loading} className="w-2/3 rounded-xl bg-zinc-900 font-medium text-white text-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50">
               {loading ? 'Confirmando...' : 'Finalizar Agendamento'}
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}
