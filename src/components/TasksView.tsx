import React, { useState } from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { generateId, formatDate } from '../utils/helpers';
import { Search, Plus, Trash2, Edit2, Calendar, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Task } from '../types';
import { PinLockScreen } from './PinLockScreen';

export const TasksView: React.FC = () => {
  const { 
    tasks, saveTask, deleteTask, toggleTaskCompleted,
    securityPin, lockedItemIds, unlockedItems, unlockItem 
  } = useTechMemory();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal Note Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta'>('Média');
  const [status, setStatus] = useState<'Pendente' | 'Em andamento' | 'Concluído'>('Pendente');
  const [deadline, setDeadline] = useState('');

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenModal = (task: Task | null = null) => {
    if (task) {
      setCurrentTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDeadline(task.deadline || '');
    } else {
      setCurrentTask(null);
      setTitle('');
      setDescription('');
      setPriority('Média');
      setStatus('Pendente');
      setDeadline('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      id: currentTask?.id || generateId(),
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      deadline: deadline || undefined
    };

    setIsModalOpen(false);
    try {
      await saveTask(payload);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-cyan-500/15 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            ✅ Tarefas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gerencie seu fluxo de compromissos diários</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 font-semibold rounded-full text-xs text-white transition-all duration-200 active:scale-95 cursor-pointer border border-blue-500/20"
        >
          <Plus className="w-3.5 h-3.5" /> Nova Tarefa
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por tarefas..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500/70 focus:outline-none rounded-full text-xs text-white transition-all duration-200 shadow-inner"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-full focus:outline-none focus:border-cyan-500/70"
          >
            <option value="">Todos Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluído">Concluído</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-full focus:outline-none focus:border-cyan-500/70"
          >
            <option value="">Todas Prioridades</option>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const isExpanded = expandedId === task.id;
            const priorityColors = {
              High: 'bg-red-500/10 text-red-500 border-red-500/20',
              Medium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
              Low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            };
            const colKey = task.priority === 'Alta' ? 'High' : task.priority === 'Baixa' ? 'Low' : 'Medium';

            return (
              <div
                key={task.id}
                className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 md:p-4.5 hover:border-cyan-500/20 transition-all duration-200 flex flex-col"
              >
                {(() => {
                  const isLocked = securityPin && lockedItemIds.includes(task.id) && !unlockedItems.includes(task.id);
                  return (
                    <>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompleted(task.id)}
                            className="w-4.5 h-4.5 rounded text-cyan-500 border-slate-850 bg-slate-950 accent-cyan-400 cursor-pointer flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 
                              onClick={() => toggleExpand(task.id)}
                              className={`text-sm font-bold truncate cursor-pointer hover:text-cyan-400 transition-colors flex items-center gap-1.5 ${
                                task.completed ? 'line-through text-slate-500 opacity-70' : 'text-slate-100'
                              }`}
                            >
                              {task.title}
                              {securityPin && lockedItemIds.includes(task.id) && (
                                <Lock className={`w-3.5 h-3.5 ${isLocked ? 'text-yellow-500 fill-yellow-500/10' : 'text-emerald-500'}`} />
                              )}
                            </h4>
                            <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                              <span className={`text-[9px] uppercase font-mono tracking-wider px-2 py-0.2 rounded-full border ${priorityColors[colKey]}`}>
                                {task.priority}
                              </span>
                              <span className="text-[9px] bg-slate-800 text-slate-300 font-mono tracking-wider px-2 py-0.2 rounded-full">
                                {task.status}
                              </span>
                              {task.deadline && (
                                <span className="text-[9px] text-cyan-400 bg-cyan-950/20 px-2 py-0.2 rounded-full border border-cyan-800/20 inline-flex items-center gap-1 font-mono">
                                  <Calendar className="w-2.5 h-2.5" /> {formatDate(task.deadline)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleOpenModal(task)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {deleteConfirmId === task.id ? (
                            <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/30 rounded-lg p-1 animate-in fade-in duration-200">
                              <span className="text-[10px] text-red-505 font-bold px-1 select-none">Excluir?</span>
                              <button
                                onClick={() => {
                                  deleteTask(task.id);
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
                              onClick={() => setDeleteConfirmId(task.id)}
                              className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm shrink-0"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {task.description && (
                        <div className={`overflow-hidden transition-all duration-300 font-sans ${
                          isExpanded ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                        }`}>
                          {isExpanded && isLocked ? (
                            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 font-sans ml-7.5">
                              <PinLockScreen 
                                title="Tarefa Protegida"
                                description="Esta tarefa está travada com senha de segurança. Digite o PIN de 4 dígitos para acessá-la."
                                onUnlock={(pin) => unlockItem(task.id, pin)}
                              />
                            </div>
                          ) : (
                            <div className="p-3 bg-black/25 text-xs text-slate-300 leading-relaxed rounded-lg whitespace-pre-wrap border border-slate-800/80 font-sans font-sans">
                              {task.description}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}

                {task.description && (
                  <div className="mt-2 text-left ml-7.5">
                    <button
                      onClick={() => toggleExpand(task.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/20 px-2 py-1 rounded border border-cyan-800/10 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Esconder <ChevronUp className="w-2.5 h-2.5" /></>
                      ) : (
                        <>Ver descrição <ChevronDown className="w-2.5 h-2.5" /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Nenhuma tarefa cadastrada.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-cyan-500/25 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <header className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                {currentTask ? '✏️ Editar Tarefa' : '✅ Nova Tarefa'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-base font-mono cursor-pointer">×</button>
            </header>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Revisar cap. 3 de banco de dados"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Prazo de Conclusão</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Descrição/Detalhamento</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Instruções rápidas para a realização..."
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
