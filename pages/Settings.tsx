import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Save, Plus, Trash2, Palette, Layout, Building } from 'lucide-react';

const Settings: React.FC = () => {
  const { getCurrentInstitution, updateInstitution, departments, addDepartment, currentUser } = useAppStore();
  const institution = getCurrentInstitution();

  // Local state for branding
  const [primaryColor, setPrimaryColor] = useState(institution?.primaryColor || '#000000');
  const [logoUrl, setLogoUrl] = useState(institution?.logoUrl || '');
  
  const [newDeptName, setNewDeptName] = useState('');

  if (!institution) return <div>Access Denied</div>;

  const handleSaveBranding = () => {
    updateInstitution(institution.id, { primaryColor, logoUrl });
    alert("Branding updated successfully!");
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeptName.trim()) {
      addDepartment({ id: crypto.randomUUID(), name: newDeptName, institutionId: institution.id });
      setNewDeptName('');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Institution Settings</h1>
        <p className="text-slate-500">Manage branding and department structure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branding Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Palette size={24} /></div>
             <h2 className="text-lg font-bold text-slate-800">Dynamic Branding</h2>
           </div>
           
           <div className="space-y-6">
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Institution Logo URL</label>
               <div className="flex gap-4">
                 <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                   {logoUrl ? <img src={logoUrl} className="w-12 h-12 object-contain" /> : <Layout className="text-slate-300" />}
                 </div>
                 <input 
                   type="text" 
                   value={logoUrl} 
                   onChange={(e) => setLogoUrl(e.target.value)} 
                   className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                   placeholder="https://..."
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Brand Color</label>
               <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-16 rounded-xl cursor-pointer border-0 p-1 bg-white shadow-sm"
                  />
                  <div className="text-sm text-slate-500">
                    <p className="font-medium text-slate-900 mb-1">Primary Theme Color</p>
                    <p>This color will be applied to buttons, headers, and active states across the platform.</p>
                  </div>
               </div>
             </div>

             <button 
                onClick={handleSaveBranding}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} /> Save Branding Changes
              </button>
           </div>
        </div>

        {/* Departments Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Building size={24} /></div>
             <h2 className="text-lg font-bold text-slate-800">Departments</h2>
           </div>

           <div className="space-y-4">
             <form onSubmit={handleAddDept} className="flex gap-2">
               <input 
                 type="text" 
                 value={newDeptName}
                 onChange={(e) => setNewDeptName(e.target.value)}
                 placeholder="e.g. Human Resources"
                 className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
               />
               <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                 <Plus size={20} />
               </button>
             </form>

             <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
               {departments.map(dept => (
                 <div key={dept.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <span className="font-medium text-slate-700">{dept.name}</span>
                   <button className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                 </div>
               ))}
               {departments.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No departments added yet.</p>}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;