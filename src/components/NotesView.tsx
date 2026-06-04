import React, { useState } from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { generateId, formatDate } from '../utils/helpers';
import { Star, Search, Plus, Trash2, Edit2, Bookmark, FolderOpen, Tags, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Note } from '../types';
import { TAG_COLORS } from './TagsView';
import { PinLockScreen } from './PinLockScreen';

export const NotesView: React.FC = () => {
  const { 
    notes, saveNote, deleteNote, toggleNoteFavorite, customTags,
    securityPin, lockedItemIds, unlockedItems, unlockItem 
  } = useTechMemory();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal Note Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note> | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Trabalho' | 'Estudos' | 'Pessoal' | 'Ideias'>('Estudos');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredNotes = notes.filter(n => {
    const matchesSearch = (n.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (n.content || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenModal = (note: Note | null = null) => {
    if (note) {
      setCurrentNote(note);
      setTitle(note.title);
      setCategory(note.category);
      setContent(note.content);
      setSelectedTags(note.tags || []);
      setTagsText((note.tags || []).join(', '));
    } else {
      setCurrentNote(null);
      setTitle('');
      setCategory('Estudos');
      setContent('');
      setSelectedTags([]);
      setTagsText('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Parse newly typed comma tags
    const typedTags = tagsText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // Merge checkable selects and typed ones
    const combinedSet = new Set<string>();
    selectedTags.forEach(t => combinedSet.add(t));
    typedTags.forEach(t => combinedSet.add(t));
    const tags = Array.from(combinedSet);

    const notePayload = {
      id: currentNote?.id || generateId(),
      title,
      category,
      content,
      tags,
      favorite: currentNote?.favorite || false
    };

    setIsModalOpen(false);
    try {
      await saveNote(notePayload);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/15 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            📄 Anotações
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Salve resumos, rascunhos e conteúdos de estudo</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 font-semibold rounded-full text-xs text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-blue-500/10 border border-blue-500/20"
        >
          <Plus className="w-3.5 h-3.5" /> Nova Nota
        </button>
      </div>

      {/* Filter and search bars */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por título ou conteúdo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500/70 focus:outline-none rounded-full text-xs text-white font-sans transition-all duration-200 shadow-inner"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-full focus:outline-none focus:border-cyan-500/70"
        >
          <option value="">Todas Categorias</option>
          <option value="Trabalho">Trabalho</option>
          <option value="Estudos">Estudos</option>
          <option value="Pessoal">Pessoal</option>
          <option value="Ideias">Ideias</option>
        </select>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 gap-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map(note => {
            const isExpanded = expandedId === note.id;
            return (
              <div
                key={note.id}
                className="bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 hover:border-cyan-500/20 transition-all duration-200 shadow-sm flex flex-col"
              >
                {/* Lock Status Check */}
                {(() => {
                  const isLocked = securityPin && lockedItemIds.includes(note.id) && !unlockedItems.includes(note.id);
                  return (
                    <>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-amber-400">📄</span>
                          <h4 
                            onClick={() => toggleExpand(note.id)}
                            className="text-sm font-bold text-slate-100 hover:text-cyan-400 cursor-pointer transition-colors flex items-center gap-1.5"
                          >
                            {note.title}
                            {securityPin && lockedItemIds.includes(note.id) && (
                              <Lock className={`w-3.5 h-3.5 ${isLocked ? 'text-yellow-500 fill-yellow-500/10' : 'text-emerald-500'}`} />
                            )}
                          </h4>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                            {note.category}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleNoteFavorite(note.id)}
                            className={`p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all ${note.favorite ? 'text-amber-400' : 'text-slate-400'}`}
                          >
                            <Star className="w-3.5 h-3.5" fill={note.favorite ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => handleOpenModal(note)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {deleteConfirmId === note.id ? (
                            <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/30 rounded-lg p-1 animate-in fade-in duration-200">
                              <span className="text-[10px] text-red-500 font-bold px-1 select-none">Excluir?</span>
                              <button
                                onClick={() => {
                                  deleteNote(note.id);
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
                              onClick={() => setDeleteConfirmId(note.id)}
                              className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm shrink-0"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Collapsible area */}
                      <div 
                        className={`mt-2.5 overflow-hidden transition-all duration-300 font-sans ${
                          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        {isExpanded && isLocked ? (
                          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850">
                            <PinLockScreen 
                              title="Anotação Protegida"
                              description="Esta anotação está travada com senha de segurança. Digite o PIN de 4 dígitos para visualizá-la."
                              onUnlock={(pin) => unlockItem(note.id, pin)}
                            />
                          </div>
                        ) : (
                          <>
                            <p className="text-xs leading-relaxed text-slate-300 bg-black/25 border border-slate-800/60 p-3 rounded-lg whitespace-pre-wrap font-sans">
                              {note.content || <em className="text-slate-500">Nenhum conteúdo salvo.</em>}
                            </p>
                            
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3 items-center">
                                <Tags className="w-3 h-3 text-slate-400 mr-0.5" />
                                {note.tags.map((tag, i) => {
                                  const ct = customTags.find(c => c.name.toLowerCase().trim() === tag.toLowerCase().trim());
                                  const colorInfo = ct && TAG_COLORS[ct.color] ? TAG_COLORS[ct.color] : TAG_COLORS.slate;
                                  return (
                                    <span key={i} className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-opacity-40 font-mono ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}>
                                      #{tag}
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            <div className="text-[10px] text-slate-500 font-mono mt-3.5 uppercase">
                              Última Atualização: {formatDate(note.date)}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  );
                })()}

                <div className="mt-2 text-left">
                  <button
                    onClick={() => toggleExpand(note.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/20 px-2.5 py-1 rounded border border-cyan-800/20 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>Ocultar <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>Visualizar <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            ⚠️ Nenhuma anotação corresponde aos termos de pesquisa.
          </div>
        )}
      </div>

      {/* Editing / Addition Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-cyan-500/25 rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <header className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                {currentNote ? '✏️ Editar Anotação' : '📄 Nova Anotação'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-base font-mono cursor-pointer"
              >
                ×
              </button>
            </header>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Resumo de Algoritmos"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Trabalho">Trabalho</option>
                  <option value="Estudos">Estudos</option>
                  <option value="Pessoal">Pessoal</option>
                  <option value="Ideias">Ideias</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Conteúdo da Nota
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Digite suas anotações aqui..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50 resize-vertical font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Etiquetas Customizadas Disponíveis
                </label>
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
                            setSelectedTags(prev => {
                              const alreadySelected = prev.includes(tag.name);
                              const next = alreadySelected 
                                ? prev.filter(t => t !== tag.name) 
                                : [...prev, tag.name];
                              // Update text input for backward-compatibility
                              setTagsText(next.join(', '));
                              return next;
                            });
                          }}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
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
                  <p className="text-[10px] text-slate-500 italic pb-1">Nenhuma etiqueta customizada. Crie-as no menu Etiquetas.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Adicionar Outras Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => {
                    setTagsText(e.target.value);
                    // Match items with selectedTags
                    const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setSelectedTags(list);
                  }}
                  placeholder="estrutura, javascript, aula1"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold rounded-full duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-full duration-200 active:scale-95 cursor-pointer border border-blue-500/10"
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
