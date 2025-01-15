import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDays, Ticket, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminSidebar() {
  const { signOut } = useAuth();

  return (
    <aside className="w-64 bg-blue-950 text-white min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
      </div>
      
      <nav className="space-y-2">
        <NavLink
          to="/admin/events"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive ? 'bg-blue-900' : 'hover:bg-blue-900/50'
            }`
          }
        >
          <CalendarDays className="w-5 h-5" />
          <span>Events</span>
        </NavLink>
        
        <NavLink
          to="/admin/tickets"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive ? 'bg-blue-900' : 'hover:bg-blue-900/50'
            }`
          }
        >
          <Ticket className="w-5 h-5" />
          <span>Tickets</span>
        </NavLink>
      </nav>
      
      <div className="mt-auto">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-900/50 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}