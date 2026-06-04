import React, { useState } from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { generateId, formatDate } from '../utils/helpers';
import { Tag, Plus, Trash2, Edit2, FolderDot, Lightbulb, BookOpen, ChevronDown, ChevronUp, Layers, Check } from 'lucide-react';
import { CustomTag, Note, Idea, Project } from '../types';

export const TAG_COLORS: Record<string, { bg: string; text: string; border: string; label: string; hover: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'bg-blue-500', hover: 'hover:bg-blue-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', label: 'bg-cyan-500', hover: 'hover:bg-cyan-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'bg-emerald-500', hover: 'hover:bg-emerald-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', label: 'bg-violet-500', hover: 'hover:bg-violet-500/20' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'bg-rose-500', hover: 'hover:bg-rose-500/20' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', label: 'bg-orange-500', hover: 'hover:bg-orange-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'bg-amber-500', hover: 'hover:bg-amber-500/20' },
  fuchsia: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/20', label: 'bg-fuchsia-500', hover: 'hover:bg-fuchsia-500/20' },
  slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: 'bg-slate-500', hover: 'hover:bg-slate-500/20' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'bg-red-500', hover: 'hover:bg-red-500/20' },
};

export const TagsView: React.FC = () => {
  const { notes, ideas, projects, customTags, saveCustomTag, deleteCustomTag } = useTechMemory();
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal / Form Management
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('blue');

  // Accordion details
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const getTagStats = (tagNameValue: string) => {
    const norm = tagNameValue.toLowerCase().trim();
    const countNotes = notes.filter(n => (n.tags || []).some(t => t.toLowerCase().trim() === norm)).length;
    const countIdeas = ideas.filter(i => (i.tags || []).some(t => t.toLowerCase().trim() === norm)).length;
    const countProjects = projects.filter(p => (p.tags || []).some(t => t.toLowerCase().trim() === norm)).length;
    return {
      notes: countNotes,
      ideas: countIdeas,
      projects: countProjects,
      total: countNotes + countIdeas + countProjects
    };
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    const payload = {
      id: editingId || generateId(),
      name: tagName.trim(),
      color: tagColor
    };

    await saveCustomTag(payload);
    setTagName('');
    setTagColor('blue');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEditInit = (tag: CustomTag) => {
    setIsEditing(true);
    setEditingId(tag.id);
    setTagName(tag.name);
    setTagColor(tag.color);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setTagName('');
    setTagColor('blue');
  };

  const activeTag = customTags.find(t => t.id === selectedTagId);
  const activeTagNameNorm = activeTag?.name.toLowerCase().trim() || '';

  // Filter cross-module with the active tag
  const matchedNotes = selectedTagId
    ? notes.filter(n => (n.tags || []).some(t => t.toLowerCase().trim() === activeTagNameNorm))
    : [];

  const matchedIdeas = selectedTagId
    ? ideas.filter(i => (i.tags || []).some(t => t.toLowerCase().trim() === activeTagNameNorm))
    : [];

  const matchedProjects = selectedTagId
    ? projects.filter(p => (p.tags || []).some(t => t.toLowerCase().trim() === activeTagNameNorm))
    : [];

  const totalMatchesCount = matchedNotes.length + matchedIdeas.length + matchedProjects.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyan-500/1.5 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            🏷️ Etiquetas & Filtros
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gerencie pastas de tópicos cruzados e filtre notas, ideias e projetos</p>
        </div>
      </div>

      {/* Main Grid Layout: Left Tag Master, Right Filter Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Gerber & Tag list */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Tag Editor Block */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-3.5 flex items-center gap-1.5">
              {isEditing ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {isEditing ? 'Editar Etiqueta' : 'Criar Nova Etiqueta'}
            </h3>
            <form onSubmit={handleSaveTag} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Nome da Etiqueta</label>
                <input
                  type="text"
                  required
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Ex: TFG, Faculdade, Algoritmos"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 focus:outline-none rounded-lg text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">Paleta de Cores</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(TAG_COLORS).map(col => {
                    const active = tagColor === col;
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setTagColor(col)}
                        title={col}
                        className={`w-6 h-6 rounded-full cursor-pointer flex items-center justify-center border transition-all ${TAG_COLORS[col].label} ${
                          active ? 'scale-115 ring-2 ring-white/60 border-transparent shadow' : 'border-black/40 hover:scale-105'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                {isEditing && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3.5 py-1.5 bg-transparent text-slate-400 hover:text-white border border-slate-800 rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-semibold border border-blue-500/20 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  {isEditing ? 'Salvar Alteração' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>

          {/* List of Custom Tags */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-3">
              🏷️ Suas Etiquetas ({customTags.length})
            </h3>
            {customTags.length > 0 ? (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {customTags.map(tag => {
                  const stats = getTagStats(tag.name);
                  const isSelected = selectedTagId === tag.id;
                  const colors = TAG_COLORS[tag.color] || TAG_COLORS.blue;

                  return (
                    <div
                      key={tag.id}
                      onClick={() => setSelectedTagId(isSelected ? null : tag.id)}
                      className={`flex justify-between items-center p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? `${colors.bg} border-cyan-500/40 ring-1 ring-cyan-500/20`
                          : 'bg-slate-950/40 border-slate-900 hover:border-slate-850 hover:bg-slate-900/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 max-w-[70%]">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.label} shrink-0`} />
                        <span className={`text-xs font-bold truncate ${colors.text}`}>#{tag.name}</span>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800/80">
                          {stats.total} itens
                        </span>
                        <button
                          onClick={() => handleEditInit(tag)}
                          className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        {deleteConfirmId === tag.id ? (
                          <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/30 rounded-lg p-1 animate-in fade-in duration-200">
                            <span className="text-[10px] text-red-500 font-bold px-1 select-none">Excluir?</span>
                            <button
                              onClick={() => {
                                deleteCustomTag(tag.id);
                                if (selectedTagId === tag.id) setSelectedTagId(null);
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
                            onClick={() => setDeleteConfirmId(tag.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                            title="Excluir etiqueta"
                          >
                            <Trash2 className="w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                Nenhuma etiqueta cadastrada ainda. Crie acima para começar!
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Cross-filtering Listing */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[460px] flex flex-col justify-between">
            <div>
              {activeTag ? (
                <div className="space-y-5">
                  
                  {/* Selector Stats and Title */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${TAG_COLORS[activeTag.color]?.label || 'bg-blue-500'}`} />
                      <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-tight">
                        Filtro Cruzado: <span className="text-cyan-400">#{activeTag.name}</span>
                      </h3>
                    </div>
                    <span className="text-[10.5px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold">
                      {totalMatchesCount} Resultados
                    </span>
                  </div>

                  {totalMatchesCount > 0 ? (
                    <div className="space-y-5">
                      
                      {/* Sub-section: NOTES */}
                      {matchedNotes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 font-mono flex items-center gap-1.5 border-l-2 border-cyan-400 pl-2">
                            <BookOpen className="w-3.5 h-3.5" /> Anotações ({matchedNotes.length})
                          </h4>
                          <div className="space-y-2">
                            {matchedNotes.map(n => {
                              const isExp = expandedNoteId === n.id;
                              return (
                                <div key={n.id} className="bg-slate-950/60 border border-slate-850 rounded-lg p-3">
                                  <div className="flex justify-between items-center">
                                    <h5 className="text-xs font-bold text-slate-200">{n.title}</h5>
                                    <button
                                      onClick={() => setExpandedNoteId(isExp ? null : n.id)}
                                      className="text-[10px] font-bold text-cyan-400 flex items-center gap-0.5 hover:underline cursor-pointer"
                                    >
                                      {isExp ? 'Ocultar' : 'Visualizar'}
                                    </button>
                                  </div>
                                  <span className="inline-block text-[9px] font-mono text-slate-500 uppercase mt-0.5 mr-2">
                                    {n.category}
                                  </span>
                                  {isExp && (
                                    <p className="mt-2 text-[11px] leading-relaxed text-slate-300 p-2 bg-black/40 rounded border border-slate-850 whitespace-pre-wrap">
                                      {n.content}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Sub-section: IDEAS */}
                      {matchedIdeas.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 font-mono flex items-center gap-1.5 border-l-2 border-cyan-400 pl-2">
                            <Lightbulb className="w-3.5 h-3.5" /> Ideias de Estudo ({matchedIdeas.length})
                          </h4>
                          <div className="space-y-2">
                            {matchedIdeas.map(i => {
                              const isExp = expandedIdeaId === i.id;
                              return (
                                <div key={i.id} className="bg-slate-950/60 border border-slate-850 rounded-lg p-3">
                                  <div className="flex justify-between items-center">
                                    <h5 className="text-xs font-bold text-slate-200">{i.title}</h5>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/10">
                                        {i.priority}
                                      </span>
                                      {i.description && (
                                        <button
                                          onClick={() => setExpandedIdeaId(isExp ? null : i.id)}
                                          className="text-[10px] font-bold text-cyan-400 flex items-center gap-0.5 hover:underline cursor-pointer"
                                        >
                                          {isExp ? 'Ocultar' : 'Visualizar'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {isExp && i.description && (
                                    <p className="mt-2 text-[11px] leading-relaxed text-slate-300 p-2 bg-black/40 rounded border border-slate-850 whitespace-pre-wrap">
                                      {i.description}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Sub-section: PROJECTS */}
                      {matchedProjects.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 font-mono flex items-center gap-1.5 border-l-2 border-cyan-400 pl-2">
                            <FolderDot className="w-3.5 h-3.5" /> Projetos ({matchedProjects.length})
                          </h4>
                          <div className="space-y-2">
                            {matchedProjects.map(p => {
                              const isExp = expandedProjectId === p.id;
                              return (
                                <div key={p.id} className="bg-slate-950/60 border border-slate-850 rounded-lg p-3">
                                  <div className="flex justify-between items-center">
                                    <h5 className="text-xs font-bold text-slate-200">{p.name}</h5>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                                        {p.status}
                                      </span>
                                      {p.description && (
                                        <button
                                          onClick={() => setExpandedProjectId(isExp ? null : p.id)}
                                          className="text-[10px] font-bold text-cyan-400 flex items-center gap-0.5 hover:underline cursor-pointer"
                                        >
                                          {isExp ? 'Ocultar' : 'Visualizar'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {isExp && p.description && (
                                    <p className="mt-2 text-[11px] leading-relaxed text-slate-300 p-2 bg-black/40 rounded border border-slate-850 whitespace-pre-wrap">
                                      {p.description}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl my-6 flex flex-col items-center justify-center text-slate-400">
                      <Layers className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-xs font-semibold">Nenhum item vinculado a esta etiqueta.</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Associe a tag #{activeTag.name} editando suas notas, ideias ou projetos.</p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-24 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-850 mb-3.5 text-cyan-400 shadow-lg">
                    <Tag className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-xs font-extrabold uppercase text-slate-200 tracking-wider font-mono">Filtro Cruzado Inativo</h4>
                  <p className="max-w-xs text-[11px] text-slate-400 mt-1 pb-6 leading-relaxed">
                    Clique em uma etiqueta da lista lateral para ver todos os itens relacionados de forma integrada nos módulos de anotações, ideias e projetos.
                  </p>
                </div>
              )}
            </div>

            {/* Quick explanation footer */}
            <div className="text-[10px] text-slate-500 border-t border-slate-850 pt-3 flex items-center gap-1">
              <span>💡</span>
              <span>Rótulos cruzados evitam o isolamento de informações e facilitam a criação de conexões cognitivas.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
