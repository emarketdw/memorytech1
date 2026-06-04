import React, { useState } from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { Search } from 'lucide-react';
import { truncateText } from '../utils/helpers';

export const SearchView: React.FC = () => {
  const { notes, bookmarks, ideas, projects, tasks, reminders } = useTechMemory();
  const [query, setQuery] = useState('');

  const executeSearch = () => {
    if (!query.trim()) return [];

    const normalized = query.toLowerCase().trim();
    const results: Array<{
      type: string;
      title: string;
      preview: string;
      icon: string;
    }> = [];

    // Search NOTES
    notes.filter(n => 
      (n.title || '').toLowerCase().includes(normalized) || 
      (n.content || '').toLowerCase().includes(normalized)
    ).forEach(n => {
      results.push({ type: 'Anotação', title: n.title, preview: n.content, icon: '📄' });
    });

    // Search BOOKMARKS
    bookmarks.filter(b => 
      (b.title || '').toLowerCase().includes(normalized) || 
      (b.url || '').toLowerCase().includes(normalized) || 
      (b.notes || '').toLowerCase().includes(normalized)
    ).forEach(b => {
      results.push({ type: 'Site Favorito', title: b.title, preview: `${b.url} — ${b.notes || ''}`, icon: '🔖' });
    });

    // Search IDEAS
    ideas.filter(i => 
      (i.title || '').toLowerCase().includes(normalized) || 
      (i.description || '').toLowerCase().includes(normalized)
    ).forEach(i => {
      results.push({ type: 'Ideia', title: i.title, preview: i.description || '', icon: '💡' });
    });

    // Search PROJECTS
    projects.filter(p => 
      (p.name || '').toLowerCase().includes(normalized) || 
      (p.description || '').toLowerCase().includes(normalized)
    ).forEach(p => {
      results.push({ type: 'Projeto', title: p.name, preview: p.description || '', icon: '📁' });
    });

    // Search TASKS
    tasks.filter(t => 
      (t.title || '').toLowerCase().includes(normalized) || 
      (t.description || '').toLowerCase().includes(normalized)
    ).forEach(t => {
      results.push({ type: 'Tarefa', title: t.title, preview: t.description || '', icon: '✅' });
    });

    // Search REMINDERS
    reminders.filter(r => 
      (r.title || '').toLowerCase().includes(normalized) || 
      (r.description || '').toLowerCase().includes(normalized)
    ).forEach(r => {
      results.push({ type: 'Lembrete', title: r.title, preview: r.description || '', icon: '⏰' });
    });

    return results;
  };

  const results = executeSearch();

  // Group by type
  const grouped = results.reduce((acc, r) => {
    acc[r.type] = acc[r.type] || [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-cyan-500/15 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            🔍 Busca Global
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">Pesquise em toda a sua base de dados instantaneamente</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite qualquer termo para buscar..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/70 focus:outline-none rounded-full text-xs text-white transition-all duration-200 shadow-inner"
        />
      </div>

      <div className="space-y-4">
        {query.trim() ? (
          results.length > 0 ? (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type} className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono pb-2 border-b border-slate-850">
                  {type} ({items.length})
                </h3>
                <div className="divide-y divide-slate-800/60">
                  {items.map((item, index) => (
                    <div key={index} className="py-2.5 flex items-start gap-2.5">
                      <span className="text-sm shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {truncateText(item.preview, 150) || <em className="text-slate-650">Sem descrição.</em>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              🔍 Nenhum resultado encontrado para "{query}".
            </div>
          )
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            💡 Digite um termo acima para cruzar dados de notas, marcadores, ideias, tarefas e lembretes em tempo real.
          </div>
        )}
      </div>
    </div>
  );
};
