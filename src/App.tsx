import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/filters/FilterBar';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { ListView } from './components/list/ListView';
import { TimelineView } from './components/timeline/TimelineView';

const BaseApp: React.FC = () => {
  const init = useStore(state => state.initializeTasks);
  const simParams = useStore(state => state.simulateCollaboration);
  const viewMode = useStore(state => state.viewMode);

  // Initialize and run collaboration simulation loop
  useEffect(() => {
    init();
    
    // Simulate real-time collaboration "jumping" around tasks every 3-8 seconds
    const interval = setInterval(() => {
      // randomly pick an offset to fire again, essentially simulating realistic network jitter
      setTimeout(() => simParams(), Math.random() * 2000);
    }, 5000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 overflow-hidden font-sans antialiased text-gray-900">
      {/* Absolute top navbar for user simulation global counts */}
      <Header />
      <FilterBar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden pointer-events-auto h-full p-4 md:p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-300 relative">
        {viewMode === 'Kanban' && <KanbanBoard />}
        {viewMode === 'List' && <ListView />}
        {viewMode === 'Timeline' && <TimelineView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <BaseApp />
    </BrowserRouter>
  );
}
