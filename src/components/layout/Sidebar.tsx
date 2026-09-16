import React from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Camera,
  Cpu,
  Droplets,
  Layers,
  LayoutDashboard,
  Radio,
  ShieldAlert,
  Sparkles,
  Sprout,
  X,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const { crop, unreadAlertsCount, isOfflineSimulated } = useFarm();

  const navItems = [
    { id: 'dashboard', label: 'Farm Command Center', icon: LayoutDashboard, badge: 'Live' },
    { id: 'monitoring', label: 'Live Monitoring', icon: Radio },
    { id: 'cropscan', label: 'Crop Scan', icon: Camera, highlight: true },
    { id: 'edgeai', label: 'Edge AI Pipeline', icon: Cpu },
    { id: 'irrigation', label: 'Smart Irrigation', icon: Droplets },
    { id: 'risks', label: 'Risk Monitor', icon: ShieldAlert },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alert Center', icon: AlertTriangle, count: unreadAlertsCount },
    { id: 'architecture', label: 'System Architecture', icon: Layers },
    { id: 'landing', label: 'Overview / Landing', icon: Sparkles },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-50 lg:z-30 h-screen lg:h-[calc(100vh-61px)] w-64 bg-[#071912] border-r border-emerald-950/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header on mobile only */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-emerald-950/80">
          <div className="flex items-center gap-2 font-bold text-emerald-400 font-heading">
            <Sprout className="w-5 h-5" />
            <span>AGRO-IOT MENU</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-emerald-950"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500/70">
            Field Intelligence
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/60'
                    : 'text-slate-300 hover:bg-emerald-950/50 hover:text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-rose-600 rounded-full animate-pulse">
                    {item.count}
                  </span>
                )}

                {item.badge && !item.count && (
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                      isActive ? 'bg-emerald-900/80 text-emerald-200' : 'bg-emerald-950 text-emerald-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Field Profile & System Offline Box at bottom */}
        <div className="p-3 border-t border-emerald-950/80 bg-[#05130e]">
          {/* Offline indicator bar */}
          {isOfflineSimulated && (
            <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-amber-950/60 border border-amber-600/50 text-[11px] text-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Offline Edge Intelligence Active</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
              <span>Active Field</span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded">
                Plot Alpha
              </span>
            </div>
            <div className="text-sm font-extrabold text-white font-heading truncate">
              {crop.field}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5 pt-1.5 border-t border-emerald-900/30">
              <span className="truncate">Crop: <strong className="text-slate-200">{crop.name.split(' ')[0]}</strong></span>
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                {crop.growthStage}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
