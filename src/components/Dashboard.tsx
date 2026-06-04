import React from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { formatDateTime } from '../utils/helpers';
import { BookOpen, CheckSquare, Lightbulb, Link2, Folder, Star, Clock, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { notes, bookmarks, ideas, projects, tasks, activities } = useTechMemory();

  const activeTasksCount = tasks.filter(t => !t.completed).length;
  const favoriteNotesCount = notes.filter(n => n.favorite).length;

  const cardItems = [
    { label: 'Anotações', count: notes.length, icon: BookOpen, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', page: 'notes' },
    { label: 'Sites Favoritos', count: bookmarks.length, icon: Link2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', page: 'bookmarks' },
    { label: 'Ideias de Estudo', count: ideas.length, icon: Lightbulb, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', page: 'ideas' },
    { label: 'Projetos', count: projects.length, icon: Folder, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', page: 'projects' },
    { label: 'Tarefas Ativas', count: activeTasksCount, icon: CheckSquare, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', page: 'tasks' },
    { label: 'Favoritas', count: favoriteNotesCount, icon: Star, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', page: 'notes' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-500/15 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">🏠 Painel de Controle</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">TechMemory · Centralize seus estudos de forma organizada</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/5 px-3 py-1.5 rounded-full border border-cyan-500/20">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {/* Grid counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cardItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onNavigate(item.page)}
            className="flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:-translate-y-0.5 active:scale-98 transition-all duration-200 shadow-md group"
          >
            <div className={`p-2.5 rounded-lg mb-2.5 transition-colors group-hover:scale-105 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">{item.count}</span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 text-center">{item.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Recent activity segments */}
      <div className="mt-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5" /> Log de Atividades Recentes
        </h3>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-1.5 overflow-hidden shadow-inner max-h-[350px] overflow-y-auto">
          {activities.length > 0 ? (
            <div className="divide-y divide-slate-800/40">
              {activities.slice(0, 8).map((act, idx) => (
                <div key={act.id || idx} className="p-3.5 flex justify-between items-center text-xs gap-3 font-sans hover:bg-slate-800/10 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-cyan-400 bg-cyan-950/40 p-1 rounded">📌</span>
                    <span className="text-slate-200 font-medium">{act.description}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{formatDateTime(act.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-500 font-sans">
              Nenhuma atividade registrada ainda. Comece a criar anotações!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
