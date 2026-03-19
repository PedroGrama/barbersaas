"use client";

import { useState } from "react";
import { addService, updateService, deleteService } from "./actions";

export function ServicesList({ tenantId, initialServices }: { tenantId: string, initialServices: any[] }) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDuration, setEditDuration] = useState<number>(30);

  // Add Form State
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState<number | "">("");
  const [newDuration, setNewDuration] = useState<number | "">(30);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || newPrice === "" || newDuration === "") return;
    setLoading(true);
    try {
      await addService({ name: newName, basePrice: Number(newPrice), durationMinutes: Number(newDuration) });
      setNewName("");
      setNewPrice("");
      setNewDuration(30);
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  }

  async function handleSaveEdit(id: string) {
    setLoading(true);
    try {
      await updateService(id, editPrice, editDuration);
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deseja remover o serviço "${name}"?`)) return;
    setLoading(true);
    try {
      await deleteService(id);
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Form de Adicionar */}
      <form onSubmit={handleAdd} className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="font-medium text-lg">Adicionar Novo Serviço</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-zinc-500 mb-1">Nome do Serviço</label>
            <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Degrade" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Preço Base (R$)</label>
            <input required type="number" step="0.01" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} placeholder="0.00" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Duração (Min)</label>
            <input required type="number" step="15" value={newDuration} onChange={e => setNewDuration(Number(e.target.value))} placeholder="30" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
          </div>
        </div>
        <button disabled={loading} type="submit" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 w-full sm:w-auto">
          Adicionar Serviço
        </button>
      </form>

      {/* Lista Atual */}
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-950 border-b dark:border-zinc-800">
            <tr>
              <th className="px-5 py-3 font-medium text-zinc-500">Serviço</th>
              <th className="px-5 py-3 font-medium text-zinc-500">Duração</th>
              <th className="px-5 py-3 font-medium text-zinc-500">Preço (R$)</th>
              <th className="px-5 py-3 font-medium text-zinc-500 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50 pointer-events-none" : ""}>
            {initialServices.map(svc => (
              <tr key={svc.id} className="border-b dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-5 py-3 font-medium">{svc.name}</td>
                <td className="px-5 py-3 text-zinc-500">
                  {editingId === svc.id ? (
                    <input 
                      type="number" 
                      step="5" 
                      value={editDuration} 
                      onChange={e => setEditDuration(Number(e.target.value))} 
                      className="w-20 rounded border px-2 py-1 text-sm dark:bg-zinc-950 dark:border-zinc-700"
                    />
                  ) : (
                    `${svc.durationMinutes} min`
                  )}
                </td>
                <td className="px-5 py-3">
                  {editingId === svc.id ? (
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editPrice} 
                      onChange={e => setEditPrice(Number(e.target.value))} 
                      className="w-24 rounded border px-2 py-1 text-sm dark:bg-zinc-950 dark:border-zinc-700"
                    />
                  ) : (
                    `R$ ${svc.basePrice.toFixed(2)}`
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {editingId === svc.id ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-zinc-700">Cancelar</button>
                      <button onClick={() => handleSaveEdit(svc.id)} className="text-blue-600 font-medium hover:text-blue-800">Salvar</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => { setEditingId(svc.id); setEditPrice(svc.basePrice); setEditDuration(svc.durationMinutes); }} className="text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-100">Editar</button>
                      <button onClick={() => handleDelete(svc.id, svc.name)} className="text-red-500 underline hover:text-red-700">Excluir</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {initialServices.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-4 text-center text-zinc-500">Nenhum serviço cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
