import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { ShieldCheck, Building2, Users } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAppStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate('/');
  };

  const demoLogin = (roleEmail: string) => {
    login(roleEmail);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
             <span className="text-white font-bold text-3xl">I</span>
           </div>
           <h1 className="text-2xl font-bold text-slate-900">Sign in to InsightFlow</h1>
           <p className="text-slate-500 mt-2">Institutional Intelligence Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="name@institution.com"
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">
            Sign In
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400 font-medium">Demo Access</span></div>
        </div>

        <div className="grid gap-3">
          <button onClick={() => demoLogin('super@insightflow.ai')} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group">
            <div className="p-2 bg-slate-100 group-hover:bg-indigo-200 rounded-lg text-slate-600 group-hover:text-indigo-700"><ShieldCheck size={18} /></div>
            <div>
              <div className="font-bold text-slate-800">Super Admin</div>
              <div className="text-xs text-slate-500">Platform Manager</div>
            </div>
          </button>
          
          <button onClick={() => demoLogin('sarah@azure.com')} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all text-left group">
            <div className="p-2 bg-slate-100 group-hover:bg-teal-200 rounded-lg text-slate-600 group-hover:text-teal-700"><Building2 size={18} /></div>
            <div>
              <div className="font-bold text-slate-800">Institution Admin</div>
              <div className="text-xs text-slate-500">Grand Azure Hotel</div>
            </div>
          </button>
          
          <button onClick={() => demoLogin('john@azure.com')} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group">
            <div className="p-2 bg-slate-100 group-hover:bg-blue-200 rounded-lg text-slate-600 group-hover:text-blue-700"><Users size={18} /></div>
            <div>
              <div className="font-bold text-slate-800">Department Admin</div>
              <div className="text-xs text-slate-500">Housekeeping Dept</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;