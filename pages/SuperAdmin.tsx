import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { UserRole } from '../types';
import { Building2, Plus, Search, MoreHorizontal } from 'lucide-react';

const SuperAdmin: React.FC = () => {
  const { institutions, addInstitution } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [newInst, setNewInst] = useState({ name: '', logoUrl: '', primaryColor: '#6366f1', secondaryColor: '#e0e7ff' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addInstitution({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newInst
    });
    setShowModal(false);
    setNewInst({ name: '', logoUrl: '', primaryColor: '#6366f1', secondaryColor: '#e0e7ff' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Institutions</h1>
          <p className="text-slate-500">Manage onboarding and subscriptions.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus size={18} /> Onboard Institution
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-3 text-slate-400" size={18} />
             <input type="text" placeholder="Search institutions..." className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
           </div>
        </div>
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400">
            <tr>
              <th className="px-6 py-4">Institution Name</th>
              <th className="px-6 py-4">Branding</th>
              <th className="px-6 py-4">Onboarded</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {institutions.map(inst => (
              <tr key={inst.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={inst.logoUrl || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-contain bg-slate-100" />
                    <span className="font-bold text-slate-900">{inst.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full shadow-sm border border-slate-100" style={{ backgroundColor: inst.primaryColor }}></div>
                    <div className="w-6 h-6 rounded-full shadow-sm border border-slate-100" style={{ backgroundColor: inst.secondaryColor }}></div>
                  </div>
                </td>
                <td className="px-6 py-4">{new Date(inst.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600"><MoreHorizontal /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Onboard New Institution</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Organization Name</label>
                <input required type="text" value={newInst.name} onChange={e => setNewInst({...newInst, name: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Logo URL</label>
                <input required type="url" value={newInst.logoUrl} onChange={e => setNewInst({...newInst, logoUrl: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={newInst.primaryColor} onChange={e => setNewInst({...newInst, primaryColor: e.target.value})} className="h-10 w-10 rounded cursor-pointer border-0" />
                    <span className="text-sm text-slate-500">{newInst.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Secondary Color</label>
                   <div className="flex items-center gap-2">
                    <input type="color" value={newInst.secondaryColor} onChange={e => setNewInst({...newInst, secondaryColor: e.target.value})} className="h-10 w-10 rounded cursor-pointer border-0" />
                    <span className="text-sm text-slate-500">{newInst.secondaryColor}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;