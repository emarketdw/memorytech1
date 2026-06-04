import React, { useState } from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { generateId } from '../utils/helpers';
import { Search, Plus, Trash2, Edit2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Bookmark } from '../types';

export const BookmarksView: React.FC = () => {
  const { bookmarks, saveBookmark, deleteBookmark } = useTechMemory();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal Note Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBookmark, setCurrentBookmark] = useState<Bookmark | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  const filteredBookmarks = bookmarks.filter(b => {
    return (b.title || '').toLowerCase().includes(search.toLowerCase()) || 
           (b.url || '').toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenModal = (bookmark: Bookmark | null = null) => {
    if (bookmark) {
      setCurrentBookmark(bookmark);
      setTitle(bookmark.title);
      setUrl(bookmark.url);
      setNotes(bookmark.notes || '');
    } else {
      setCurrentBookmark(null);
      setTitle('');
      setUrl('');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    const payload = {
      id: currentBookmark?.id || generateId(),
      title: title.trim(),
      url: targetUrl,
      notes: notes.trim()
    };

    setIsModalOpen(false);
    try {
      await saveBookmark(payload);
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
            🔖 Sites Favoritos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Guarde links de tutoriais, documentações e referências</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 font-semibold rounded-full text-xs text-white transition-all duration-200 active:scale-95 cursor-pointer border border-blue-500/20"
        >
          <Plus className="w-3.5 h-3.5" /> Novo Site
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por título ou URL..."
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500/70 focus:outline-none rounded-full text-xs text-white transition-all duration-200 shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBookmarks.length > 0 ? (
          filteredBookmarks.map(bookmark => {
            const isExpanded = expandedId === bookmark.id;
            return (
              <div
                key={bookmark.id}
                className="bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 hover:border-cyan-500/20 transition-all duration-200 flex flex-col"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span>🔖</span> {bookmark.title}
                    </h4>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1 font-mono break-all"
                    >
                      {bookmark.url} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleOpenModal(bookmark)}
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirmId === bookmark.id ? (
                      <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/30 rounded-lg p-1 animate-in fade-in duration-200">
                        <span className="text-[10px] text-red-500 font-bold px-1 select-none">Excluir?</span>
                        <button
                          onClick={() => {
                            deleteBookmark(bookmark.id);
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
                        onClick={() => setDeleteConfirmId(bookmark.id)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm shrink-0"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {bookmark.notes && (
                  <div className={`overflow-hidden transition-all duration-300 font-sans ${
                    isExpanded ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="p-3 bg-black/25 text-xs text-slate-300 rounded-lg whitespace-pre-wrap border border-slate-800/80 font-sans">
                      {bookmark.notes}
                    </div>
                  </div>
                )}

                {bookmark.notes && (
                  <div className="mt-2 text-left">
                    <button
                      onClick={() => toggleExpand(bookmark.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/20 px-2 py-1 rounded border border-cyan-800/10 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Esconder <ChevronUp className="w-2.5 h-2.5" /></>
                      ) : (
                        <>Ver notas <ChevronDown className="w-2.5 h-2.5" /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Nenhum site favorito catalogado.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-cyan-500/25 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <header className="px-5 py-4 border-b border-slate-800 flex justify-between items-center animate-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                {currentBookmark ? '✏️ Editar Site' : '🔖 Novo Site'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-base font-mono cursor-pointer">×</button>
            </header>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: MDN Web Docs"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Endereço URL</label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="developer.mozilla.org"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Observações (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Dicas rápidas do site..."
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
