import React, { useState } from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { generateId } from '../utils/helpers';
import { Search, Plus, Trash2, Edit2, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Project } from '../types';
import { TAG_COLORS } from './TagsView';
import { PinLockScreen } from './PinLockScreen';

export const ProjectsView: React.FC = () => {
  const { 
    projects, saveProject, deleteProject, customTags,
    securityPin, lockedItemIds, unlockedItems, unlockItem 
  } = useTechMemory();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal Note Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Planejamento' | 'Em andamento' | 'Concluído'>('Planejamento');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenModal = (project: Project | null = null) => {
    if (project) {
      setCurrentProject(project);
      setName(project.name);
      setDescription(project.description || '');
      setStatus(project.status);
      setSelectedTags(project.tags || []);
    } else {
      setCurrentProject(null);
      setName('');
      setDescription('');
      setStatus('Planejamento');
      setSelectedTags([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      id: currentProject?.id || generateId(),
      name: name.trim(),
      description: description.trim(),
      status,
      tags: selectedTags
    };

    setIsModalOpen(false);
    try {
      await saveProject(payload);
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
            📁 Projetos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Acompanhe projetos de estudo, metas e criações pessoais</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 font-semibold rounded-full text-xs text-white transition-all duration-200 active:scale-95 cursor-pointer border border-blue-500/20"
        >
          <Plus className="w-3.5 h-3.5" /> Novo Projeto
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou escopo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500/70 focus:outline-none rounded-full text-xs text-white transition-all duration-200 shadow-inner"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-full focus:outline-none focus:border-cyan-500/70"
        >
          <option value="">Todos Status</option>
          <option value="Planejamento">Planejamento</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Concluído">Concluído</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => {
            const isExpanded = expandedId === project.id;
            const statusColors = {
              Pln: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              And: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
              Con: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            };
            const colKey = project.status === 'Concluído' ? 'Con' : project.status === 'Em andamento' ? 'And' : 'Pln';

            return (
              <div
                key={project.id}
                className="bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 hover:border-cyan-500/20 transition-all duration-200 flex flex-col"
              >
                {(() => {
                  const isLocked = securityPin && lockedItemIds.includes(project.id) && !unlockedItems.includes(project.id);
                  return (
                    <>
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5 flex-1 w-full">
                          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <span>📁</span>
                            <span onClick={() => project.description && toggleExpand(project.id)} className={project.description ? 'cursor-pointer hover:text-cyan-400' : ''}>
                              {project.name}
                            </span>
                            {securityPin && lockedItemIds.includes(project.id) && (
                              <Lock className={`w-3.5 h-3.5 ${isLocked ? 'text-yellow-500 fill-yellow-500/10' : 'text-emerald-500'}`} />
                            )}
                          </h4>
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className={`inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full border ${statusColors[colKey]}`}>
                              {project.status}
                            </span>
                            {project.tags && project.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                {project.tags.map((tag, i) => {
                                  const ct = customTags.find(c => c.name.toLowerCase().trim() === tag.toLowerCase().trim());
                                  const colorInfo = ct && TAG_COLORS[ct.color] ? TAG_COLORS[ct.color] : TAG_COLORS.slate;
                                  return (
                                    <span key={i} className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-opacity-40 font-mono ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}>
                                      #{tag}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleOpenModal(project)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {deleteConfirmId === project.id ? (
                            <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/30 rounded-lg p-1 animate-in fade-in duration-200">
                              <span className="text-[10px] text-red-500 font-bold px-1 select-none">Excluir?</span>
                              <button
                                onClick={() => {
                                  deleteProject(project.id);
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
                              onClick={() => setDeleteConfirmId(project.id)}
                              className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm shrink-0"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {project.description && (
                        <div className={`overflow-hidden transition-all duration-300 font-sans ${
                          isExpanded ? 'max-h-[500px] opacity-100 mt-2.5' : 'max-h-0 opacity-0'
                        }`}>
                          {isExpanded && isLocked ? (
                            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 font-sans">
                              <PinLockScreen 
                                title="Projeto Protegido"
                                description="Este projeto está travado com PIN de segurança. Digite o PIN de 4 dígitos para acessá-lo."
                                onUnlock={(pin) => unlockItem(project.id, pin)}
                              />
                            </div>
                          ) : (
                            <div className="p-3 bg-black/25 text-xs text-slate-300 leading-relaxed rounded-lg whitespace-pre-wrap border border-slate-800/80 font-sans">
                              {project.description}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}

                {project.description && (
                  <div className="mt-2 text-left">
                    <button
                      onClick={() => toggleExpand(project.id)}
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
          <div className="text-center py-12 text-slate-500 text-xs font-sans">
            Nenhum projeto cadastrado.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-cyan-500/25 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <header className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                {currentProject ? '✏️ Editar Projeto' : '📁 Novo Projeto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-base font-mono cursor-pointer">×</button>
            </header>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Nome do Projeto</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: TCC Engenharia de Software"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Status Operacional</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Planejamento">Planejamento</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Etiquetas de Tópico</label>
                {customTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 py-1.5 max-h-[105px] overflow-y-auto">
                    {customTags.map(tag => {
                      const isSelected = selectedTags.includes(tag.name);
                      const colorInfo = TAG_COLORS[tag.color] || TAG_COLORS.blue;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            setSelectedTags(prev => 
                              prev.includes(tag.name) 
                                ? prev.filter(t => t !== tag.name) 
                                : [...prev, tag.name]
                            );
                          }}
                          className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            isSelected 
                              ? `${colorInfo.bg} ${colorInfo.text} ${colorInfo.border} ring-1 ring-cyan-500/25` 
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          #{tag.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[9px] text-slate-500 italic pb-1">Nenhuma etiqueta disponível. Crie em Etiquetas & Filtros.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Descrição do Escopo</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="De que trata esse projeto? Quais as metas principais?"
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
