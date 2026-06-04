import React, { useState, useEffect } from 'react';
import { TechMemoryProvider, useTechMemory } from './context/TechMemoryContext';
import { Dashboard } from './components/Dashboard';
import { SearchView } from './components/SearchView';
import { NotesView } from './components/NotesView';
import { BookmarksView } from './components/BookmarksView';
import { IdeasView } from './components/IdeasView';
import { ProjectsView } from './components/ProjectsView';
import { TasksView } from './components/TasksView';
import { RemindersView } from './components/RemindersView';
import { VaultView } from './components/VaultView';
import { StatsView } from './components/StatsView';
import { BackupView } from './components/BackupView';
import { FirebaseConfigView } from './components/FirebaseConfigView';
import { TagsView } from './components/TagsView';
import { PinLockScreen } from './components/PinLockScreen';

import { 
  Home, Search, BookOpen, Link2, Lightbulb, FolderDot, 
  CheckSquare, Clock, ShieldAlert, BarChart3, Database, 
  Flame, Menu, X, Sun, Moon, RefreshCw, Layers 
} from 'lucide-react';

function AppContent() {
  const { 
    user, online, syncing, manualSyncCloud,
    securityPin, lockedModules, unlockedModules, unlockModule 
  } = useTechMemory();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync state styling
  let syncColorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  let syncLabel = 'OFFLINE';

  if (user) {
    if (online) {
      syncColorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 animate-pulse';
      syncLabel = syncing ? 'SYNCING' : 'CLOUD';
    } else {
      syncColorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      syncLabel = 'DISCONNECTED';
    }
  }

  // Handle theme toggles
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
  }, [isDarkMode]);

  const navSections = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'search', label: 'Busca Global', icon: Search },
      ]
    },
    {
      title: 'Módulos',
      items: [
        { id: 'notes', label: 'Anotações', icon: BookOpen },
        { id: 'bookmarks', label: 'Sites Favoritos', icon: Link2 },
        { id: 'ideas', label: 'Ideias de Estudo', icon: Lightbulb },
        { id: 'projects', label: 'Projetos', icon: FolderDot },
        { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
        { id: 'reminders', label: 'Lembretes', icon: Clock },
        { id: 'tags', label: 'Etiquetas & Filtros', icon: Layers },
      ]
    },
    {
      title: 'Segurança',
      items: [
        { id: 'vault', label: 'Cofre Pessoal', icon: ShieldAlert },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
        { id: 'backup', label: 'Backup', icon: Database },
        { id: 'firebase', label: 'Firebase Cloud', icon: Flame },
      ]
    }
  ];

  const renderActivePage = () => {
    // Centralized Safety lock check for entire modules/menus
    if (securityPin && lockedModules.includes(currentPage) && !unlockedModules.includes(currentPage)) {
      const navItem = navSections.flatMap(s => s.items).find(i => i.id === currentPage);
      const label = navItem ? navItem.label : currentPage;
      return (
        <div className="flex items-center justify-center min-h-[460px]">
          <PinLockScreen
            title={`Acesso Bloqueado: ${label}`}
            description={`Este módulo de informações (${label}) foi trancado por segurança. Digite seu PIN de 4 dígitos para acessá-lo.`}
            onUnlock={(pin) => unlockModule(currentPage, pin)}
          />
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={(page) => setCurrentPage(page)} />;
      case 'search':
        return <SearchView />;
      case 'notes':
        return <NotesView />;
      case 'bookmarks':
        return <BookmarksView />;
      case 'ideas':
        return <IdeasView />;
      case 'projects':
        return <ProjectsView />;
      case 'tasks':
        return <TasksView />;
      case 'reminders':
        return <RemindersView />;
      case 'tags':
        return <TagsView />;
      case 'vault':
        return <VaultView />;
      case 'stats':
        return <StatsView />;
      case 'backup':
        return <BackupView />;
      case 'firebase':
        return <FirebaseConfigView />;
      default:
        return <Dashboard onNavigate={(page) => setCurrentPage(page)} />;
    }
  };

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden text-slate-100 font-sans transition-all duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] md:hidden cursor-pointer"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r z-[150] transition-all transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col justify-between`}>
        {/* Header segment with status badge */}
        <div>
          <header className={`px-4.5 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
                <Layers className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div className="leading-tight">
                <h1 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'} tracking-tight`}>TechMemory</h1>
                <span className="text-[10px] text-slate-500 font-mono tracking-widest block mt-0.5">V2.5 · Cloud Sync</span>
              </div>
            </div>

            {/* Sync Badge */}
            <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 select-none ${syncColorClass}`}>
              {syncLabel}
            </span>
          </header>

          {/* Nav scroll */}
          <nav className="p-3.5 space-y-4 overload-y-auto max-h-[calc(100vh-180px)]">
            {navSections.map((sect, i) => (
              <div key={i} className="space-y-1">
                <h3 className="text-[9.5px] font-bold tracking-widest text-cyan-400 uppercase font-mono px-3 mb-1">
                  {sect.title}
                </h3>
                {sect.items.map((item) => {
                  const isActive = currentPage === item.id;
                  const ActiveBg = isDarkMode 
                    ? 'bg-yellow-405/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_12px_rgba(59,130,246,0.3)]' 
                    : 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 shadow-[0_0_10px_rgba(37,99,235,0.25)]';
                  const InactiveBg = isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/45' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100';
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 relative ${
                        isActive ? ActiveBg : InactiveBg
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon className="w-4 h-4 shrink-0 transition-transform" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && (
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-300 shadow-[0_0_8px_#06b6d4] shrink-0 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <footer className={`p-4.5 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} space-y-2`}>
          {user && online && (
            <button
              onClick={() => { manualSyncCloud(); }}
              title="Forçar sincronização com Firestore"
              className="w-full py-1.5 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 hover:text-cyan-300 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Sincronizar Nuvem
            </button>
          )}
          <button
            onClick={toggleTheme}
            className={`w-full py-2 ${isDarkMode ? 'bg-slate-800/65 text-slate-300 border-slate-750 hover:bg-slate-800' : 'bg-slate-100 text-slate-800 border-slate-250 hover:bg-slate-200'} border rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer`}
          >
            {isDarkMode ? (
              <><Sun className="w-3.5 h-3.5 text-yellow-400" /> Modo Claro</>
            ) : (
              <><Moon className="w-3.5 h-3.5 text-indigo-500" /> Modo Escuro</>
            )}
          </button>
        </footer>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        
        {/* Topbar navigation menu trigger in mobile */}
        <header className={`md:hidden px-4 min-h-[52px] border-b ${isDarkMode ? 'bg-slate-900 border-slate-800/' : 'bg-white border-slate-205'} flex items-center gap-3 shrink-0`}>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-1.5 rounded-lg border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} hover:scale-105 active:scale-95 transition-all text-slate-400 hover:text-white`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
              <Layers className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <span className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'} tracking-tight`}>TechMemory</span>
          </div>
        </header>

        {/* Content Pane */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 select-text selection:bg-cyan-500/20 ${isDarkMode ? '' : 'text-slate-800 bg-white'}`}>
          {renderActivePage()}
        </div>

      </main>
    </div>
  );
}

export default function App() {
  return (
    <TechMemoryProvider>
      <AppContent />
    </TechMemoryProvider>
  );
}
