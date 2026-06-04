import React, { useState } from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { generateId, formatDate } from '../utils/helpers';
import { Search, Plus, Trash2, Edit2, Clock, Calendar } from 'lucide-react';
import { Reminder } from '../types';

export const RemindersView: React.FC = () => {
  const { reminders, saveReminder, deleteReminder } = useTechMemory();
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal Note Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');

  const filteredReminders = reminders.filter(r => {
    return (r.title || '').toLowerCase().includes(search.toLowerCase()) || 
           (r.description || '').toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`).getTime();
    const db = new Date(`${b.date}T${b.time}`).getTime();
    return da - db;
  });

  const handleOpenModal = (reminder: Reminder | null = null) => {
    if (reminder) {
      setCurrentReminder(reminder);
      setTitle(reminder.title);
      setDescription(reminder.description || '');
      setDate(reminder.date);
      setTime(reminder.time);
    } else {
      setCurrentReminder(null);
      setTitle('');
      setDescription('');
      
      // Default to today
      const todayISO = new Date().toISOString().split('T')[0];
      setDate(todayISO);
      setTime('09:00');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    const payload = {
      id: currentReminder?.id || generateId(),
      title: title.trim(),
      description: description.trim(),
      date,
      time
    };

    setIsModalOpen(false);
    try {
      await saveReminder(payload);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-cyan-500/15 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            ⏰ Lembretes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Defina avisos para revisões ou sessões de estudos</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 font-semibold rounded-full text-xs text-white transition-all duration-200 active:scale-95 cursor-pointer border border-blue-500/20"
        >
          <Plus className="w-3.5 h-3.5" /> Novo Lembrete
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por lembretes..."
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500/70 focus:outline-none rounded-full text-xs text-white transition-all duration-200 shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReminders.length > 0 ? (
          filteredReminders.map(reminder => (
            <div
              key={reminder.id}
              className="bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 hover:border-cyan-500/20 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 min-w-0">
                    <span>⏰</span> <span className="truncate">{reminder.title}</span>
                  </h4>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleOpenModal(reminder)}
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                    >
                      <Edit2 className="w-3" />
                    </button>
                    {deleteConfirmId === reminder.id ? (
                      <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/30 rounded-lg p-1 animate-in fade-in duration-200">
                        <span className="text-[10px] text-red-500 font-bold px-1 select-none">Excluir?</span>
                        <button
                          onClick={() => {
                            deleteReminder(reminder.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(reminder.id)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm shrink-0"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed whitespace-pre-wrap font-sans">
                  {reminder.description || <em className="text-slate-600">Sem descrição adicional.</em>}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 mt-4 pt-3 border-t border-slate-800/60 items-center justify-between">
                <span className="text-[10.5px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDate(reminder.date)}
                </span>
                <span className="text-[10.5px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {reminder.time}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs md:col-span-2">
            Nenhum lembrete agendado.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-cyan-500/25 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <header className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                {currentReminder ? '✏️ Editar Lembrete' : '⏰ Novo Lembrete'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-base font-mono cursor-pointer">×</button>
            </header>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Título do Lembrete</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Prova de Engenharia de Requisitos"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Hora</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Mensagem rápida / Detalhes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Levar caneta preta e comprovante de inscrição..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 text-right">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-slate-400 hover:text-white border border-slate-800 rounded-full text-xs font-semibold hover:border-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-full border border-blue-500/10 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
