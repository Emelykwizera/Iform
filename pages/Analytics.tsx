import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/AppContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { analyzeFeedbackWithAI } from '../services/gemini';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Sparkles, Download, ArrowLeft, BrainCircuit, TrendingUp, AlertTriangle, CheckCircle2, QrCode, X, Copy, Share2, BarChart2
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Analytics: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { getForm, getResponsesByForm, getAnalysisByForm, addAnalysis, forms } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // If no ID, default to first form or show list
  const currentFormId = formId || forms[0]?.id;
  const form = getForm(currentFormId);
  const responses = getResponsesByForm(currentFormId);
  const existingAnalysis = getAnalysisByForm(currentFormId);

  useEffect(() => {
    if (!formId && forms.length > 0) {
      navigate(`/analytics/${forms[0].id}`);
    }
  }, [formId, forms, navigate]);

  if (!form) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="text-slate-500 mb-4">No forms available to analyze.</p>
      <Link to="/create" className="text-indigo-600 font-bold hover:underline">Create a new form</Link>
    </div>
  );

  const handleRunAnalysis = async () => {
    if (responses.length === 0) {
      alert("Need at least one response to analyze.");
      return;
    }
    setLoading(true);
    try {
      const result = await analyzeFeedbackWithAI(form, responses.map(r => r.answers));
      addAnalysis({
        formId: form.id,
        result,
        generatedAt: new Date().toISOString()
      });
    } catch (e) {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data (Distribution of ratings)
  const ratingFields = form.fields.filter(f => f.type === 'rating');
  const chartData = ratingFields.map(field => {
    const scores = responses.map(r => Number(r.answers[field.id] || 0));
    const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    return { name: field.label.substring(0, 20) + '...', fullLabel: field.label, value: parseFloat(avg.toFixed(1)) };
  });

  const responsesCount = responses.length;
  
  // FIX: Robust URL generation for sharing
  // Use window.location.href to get the full current path, then strip the hash and append the new route
  // This supports file:// protocols and ensuring the base is correct relative to where index.html is served.
  const baseUrl = window.location.href.split('#')[0]; 
  const shareLink = `${baseUrl}#/submit/${form.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareLink)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <Link to="/" className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"><ArrowLeft size={20} /></Link>
             <h1 className="text-2xl font-bold text-slate-900">{form.title}</h1>
          </div>
          <div className="flex items-center gap-3 pl-2">
             <span className="text-xs font-bold px-2 py-0.5 rounded text-indigo-600 bg-indigo-50 border border-indigo-100">{form.industry}</span>
             <span className="text-slate-400 text-sm">Created {new Date(form.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={() => setShowQR(true)}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
          >
            <Share2 size={18} className="text-indigo-500" /> Share
          </button>
          <button 
            onClick={handleRunAnalysis}
            disabled={loading || responsesCount === 0}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? <BrainCircuit className="animate-pulse" /> : <Sparkles size={18} />}
            {existingAnalysis ? 'Refresh AI Analysis' : 'Generate AI Insights'}
          </button>
        </div>
      </div>

       {/* QR Code Modal */}
       {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
             <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><X size={20} /></button>
             
             <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Share this Form</h3>
                <p className="text-slate-500 mb-6">Scan to open the feedback form on your device.</p>
                
                <div className="bg-white p-4 rounded-xl border-2 border-slate-100 inline-block mb-6 shadow-sm">
                   <img src={qrUrl} alt="Form QR Code" className="w-48 h-48 mix-blend-multiply" />
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-left mb-6">
                   <p className="text-xs text-amber-800 font-semibold flex items-start gap-2">
                     <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                     <span>
                       <strong>Important:</strong> If you are running this app on localhost or as a local file, this QR code will not work for others (like on a phone). You must deploy this app to a public server for external access.
                     </span>
                   </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                   <p className="text-xs text-slate-500 truncate flex-1 font-mono">{shareLink}</p>
                   <button onClick={copyToClipboard} className="text-indigo-600 hover:text-indigo-800 p-1">
                     <Copy size={16} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Responses</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-extrabold text-slate-900">{responsesCount}</h3>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">All time</span>
          </div>
        </div>
        
        {existingAnalysis && (
          <>
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Sentiment Score</p>
                <div className="flex items-center gap-3">
                  <div className={`text-4xl font-extrabold ${
                    existingAnalysis.result.sentimentScore > 75 ? 'text-emerald-500' : 
                    existingAnalysis.result.sentimentScore > 50 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {existingAnalysis.result.sentimentScore}
                  </div>
                  <div className="text-xs text-slate-400 font-medium leading-tight">
                    out of <br/> 100
                  </div>
                </div>
            </div>
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                   <Sparkles size={14} /> AI Executive Summary
                 </p>
                 <p className="text-slate-100 text-sm leading-relaxed font-medium">{existingAnalysis.result.summary}</p>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
            </div>
          </>
        )}
      </div>

      {/* Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6 text-lg">Satisfaction Metrics</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} 
                  axisLine={false}
                  tickLine={false}
                />
                <RechartTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar 
                  dataKey="value" 
                  fill="#6366f1" 
                  radius={[0, 6, 6, 0]} 
                  barSize={32}
                  background={{ fill: '#f8fafc' }}
                >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <BarChart2 size={24} />
                </div>
                <p>No rating data available</p>
             </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="bg-white p-0 rounded-2xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <BrainCircuit className="text-indigo-600" size={20} />
              AI Recommendations
            </h3>
            {existingAnalysis && <span className="text-xs text-slate-400 font-medium">Updated {new Date(existingAnalysis.generatedAt).toLocaleTimeString()}</span>}
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
            {!existingAnalysis ? (
               <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-4">
                     <Sparkles size={40} />
                  </div>
                  <h4 className="text-slate-900 font-bold mb-2">Unlock Insights</h4>
                  <p className="text-sm max-w-xs mx-auto">Click "Generate AI Insights" to let Gemini analyze your feedback and suggest improvements.</p>
               </div>
            ) : (
              <div className="space-y-4">
                {existingAnalysis.result.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="mt-1 shrink-0">
                      {rec.priority === 'High' ? <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={18} /></div> : 
                       rec.priority === 'Medium' ? <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><TrendingUp size={18} /></div> :
                       <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle2 size={18} /></div>}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                        {rec.title}
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                           rec.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                           rec.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>{rec.priority}</span>
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Key Trends */}
      {existingAnalysis && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-4 text-lg">Key Recurring Themes</h3>
           <div className="flex flex-wrap gap-3">
             {existingAnalysis.result.keyThemes.map((theme, i) => (
               <span key={i} className="px-4 py-2 bg-white border border-indigo-100 text-indigo-700 rounded-full text-sm font-bold shadow-sm flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                 {theme}
               </span>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;