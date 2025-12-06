import React from 'react';
import { useAppStore } from '../store/AppContext';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Users, TrendingUp, Plus, Clock, ExternalLink } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, colorClass, iconColor }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon size={24} className={iconColor} />
      </div>
      {trend && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { forms, responses, analyses } = useAppStore();

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-xl shadow-indigo-200 text-white p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back, Admin</h1>
          <p className="text-indigo-100 text-lg mb-8 leading-relaxed opacity-90">
            Your institutional feedback system is active. You have collected <span className="font-bold text-white">{responses.length} responses</span> across <span className="font-bold text-white">{forms.length} forms</span>.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/create"
              className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2"
            >
              <Plus size={20} /> Create New Form
            </Link>
            <Link 
              to="/analytics"
              className="bg-indigo-500/30 backdrop-blur-md text-white border border-white/20 font-bold py-3 px-6 rounded-xl hover:bg-indigo-500/40 transition-all flex items-center gap-2"
            >
              <TrendingUp size={20} /> View Insights
            </Link>
          </div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={FileText} 
          label="Active Forms" 
          value={forms.length} 
          colorClass="bg-blue-50" 
          iconColor="text-blue-600"
        />
        <StatCard 
          icon={Users} 
          label="Total Responses" 
          value={responses.length} 
          colorClass="bg-emerald-50" 
          iconColor="text-emerald-600"
          trend="+12% this week"
        />
        <StatCard 
          icon={TrendingUp} 
          label="AI Reports Generated" 
          value={analyses.length} 
          colorClass="bg-purple-50" 
          iconColor="text-purple-600"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Forms List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-800 text-lg">Recent Forms</h2>
            <Link to="/create" className="text-sm text-indigo-600 font-bold hover:text-indigo-700">View All</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {forms.slice(0, 5).map(form => (
              <div key={form.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{form.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{form.industry}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(form.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 self-start sm:self-center">
                   <Link 
                    to={`/submit/${form.id}`} 
                    target="_blank"
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2"
                  >
                    View <ExternalLink size={12} />
                  </Link>
                  <Link 
                    to={`/analytics/${form.id}`} 
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 shadow-md shadow-indigo-200 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    Analyze <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
            {forms.length === 0 && (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                   <FileText className="text-slate-300" size={32} />
                </div>
                <p>No forms created yet.</p>
                <Link to="/create" className="text-indigo-600 font-bold mt-2 hover:underline">Create your first form</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips Panel */}
        <div className="bg-slate-900 rounded-2xl shadow-xl p-8 text-white flex flex-col relative overflow-hidden">
           <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
              <TrendingUp className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Analysis Tip</h3>
            <p className="text-slate-300 mb-8 text-sm leading-relaxed">
              Did you know? Open-ended questions usually provide 3x more actionable insights than rating scales. Try adding a "Why did you choose this rating?" text field to your forms.
            </p>
            <Link 
              to="/create"
              className="w-full block bg-white text-slate-900 font-bold py-3.5 rounded-xl text-center hover:bg-slate-100 transition-colors"
            >
              Create Advanced Form
            </Link>
           </div>
           
           {/* Decorative Background */}
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;