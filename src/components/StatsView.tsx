import React from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { BookOpen, CheckCircle, BarChart3, TrendingUp, Sparkles, FolderDot } from 'lucide-react';

export const StatsView: React.FC = () => {
  const { notes, tasks, ideas, projects, bookmarks } = useTechMemory();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Notes of category
  const categoriesCount = notes.reduce((acc, note) => {
    const cat = note.category || 'Geral';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priorities count
  const prioritiesCount = {
    Alta: 0,
    Média: 0,
    Baixa: 0
  };

  [...tasks, ...ideas].forEach(item => {
    if (item.priority && item.priority in prioritiesCount) {
      prioritiesCount[item.priority] += 1;
    }
  });

  const cards = [
    { label: 'Notas de Estudo', value: notes.length, icon: BookOpen, color: 'text-cyan-400 bg-cyan-950/20' },
    { label: 'Tarefas Concluídas', value: completedTasks, icon: CheckCircle, color: 'text-green-400 bg-green-950/20' },
    { label: 'Projetos Ativos', value: projects.length, icon: FolderDot, color: 'text-indigo-400 bg-indigo-950/20' },
    { label: 'Ideias de Estudo', value: ideas.length, icon: Sparkles, color: 'text-amber-400 bg-amber-950/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-cyan-500/15 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            📈 Estatísticas Gerais
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Visão analítica sobre seu ritmo de estudo e trabalho</p>
        </div>
      </div>

      {/* Grid counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex items-center gap-3.5">
            <div className={`p-2.5 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">{card.label}</p>
              <h3 className="text-lg font-bold text-white mt-0.5">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Bento Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Task Completion Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              ✅ Conclusão de Tarefas
            </h3>
            <span className="text-lg font-bold text-white font-mono">{completionRate}%</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-850">
            <div 
              style={{ width: `${completionRate}%` }}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
            />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
            Você completou <strong className="text-slate-200">{completedTasks}</strong> de <strong className="text-slate-200">{totalTasks}</strong> tarefas planejadas.
          </p>
        </div>

        {/* Categories Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
            📂 Categorias de Anotações
          </h3>

          <div className="space-y-3 pt-2">
            {Object.keys(categoriesCount).length > 0 ? (
              Object.entries(categoriesCount).map(([category, count]) => {
                const total = notes.length || 1;
                const countNum = count as number;
                const ratio = Math.round((countNum / total) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>{category}</span>
                      <span className="font-mono">{countNum} notas ({ratio}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${ratio}%` }}
                        className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Nenhuma nota cadastrada ainda.</p>
            )}
          </div>
        </div>

        {/* Priority distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
            ⚡ Distribuição de Carga
          </h3>

          <div className="space-y-3.5 pt-1.5">
            {[
              { label: 'Alta Prioridade', key: 'Alta', col: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
              { label: 'Média Prioridade', key: 'Média', col: 'from-blue-500 to-indigo-500', bg: 'bg-indigo-500/10' },
              { label: 'Baixa Prioridade', key: 'Baixa', col: 'from-slate-500 to-slate-400', bg: 'bg-slate-500/10' },
            ].map(pri => {
              const count = prioritiesCount[pri.key as keyof typeof prioritiesCount] || 0;
              const totalItems = (prioritiesCount.Alta + prioritiesCount.Média + prioritiesCount.Baixa) || 1;
              const percent = Math.round((count / totalItems) * 100);

              return (
                <div key={pri.key} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-sans">{pri.label}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{count} itens ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`bg-gradient-to-r ${pri.col} h-full rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
