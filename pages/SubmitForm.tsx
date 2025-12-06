import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { FieldType, FormResponse } from '../types';
import { CheckCircle2, Star, Send } from 'lucide-react';

const SubmitForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const { getForm, addResponse, institutions } = useAppStore();
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  const form = formId ? getForm(formId) : undefined;
  
  // Find branding
  const institution = form ? institutions.find(i => i.id === form.institutionId) : undefined;
  const brandColor = institution?.primaryColor || '#4f46e5';
  const logo = institution?.logoUrl;

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Form Not Found</h2>
          <p className="text-slate-500 mt-2">The form you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const response: FormResponse = {
      id: crypto.randomUUID(),
      formId: form.id,
      submittedAt: new Date().toISOString(),
      answers
    };
    addResponse(response);
    setSubmitted(true);
  };

  const handleChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" style={{ background: `linear-gradient(135deg, ${brandColor}10, #ffffff)` }}>
        <div className="bg-white p-12 rounded-3xl shadow-2xl shadow-indigo-100 max-w-md w-full text-center border border-white">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-[bounce_1s_ease-out]" style={{ backgroundColor: `${brandColor}20`, color: brandColor }}>
            <CheckCircle2 size={48} strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Thank You!</h2>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed">
            Your feedback is incredibly valuable to us. We have securely recorded your response.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="font-bold hover:opacity-80 transition-opacity border-b-2 border-transparent pb-0.5"
            style={{ color: brandColor, borderColor: brandColor }}
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] py-12 px-4 sm:px-6 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 transform -skew-y-3 origin-top-left scale-110" style={{ backgroundColor: brandColor }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-900/10 overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-slate-100 p-8 md:p-10">
             <div className="flex justify-between items-start mb-6">
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">
                  {form.industry} Survey
                </div>
                {logo && <img src={logo} alt="Logo" className="h-12 object-contain" />}
             </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">{form.title}</h1>
            <p className="text-lg text-slate-500 leading-relaxed">{form.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10 bg-white">
            {form.fields.map((field, idx) => (
              <div key={field.id} className="group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                <label className="block text-lg font-bold text-slate-800 mb-4 transition-colors" style={{ color: answers[field.id] ? brandColor : '' }}>
                  <span className="text-slate-300 mr-2 text-sm font-normal uppercase tracking-wider">{idx + 1}.</span>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                </label>

                {field.type === FieldType.TEXT && (
                  <textarea
                    required={field.required}
                    className="w-full p-4 text-lg bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white outline-none transition-all resize-none min-h-[120px] placeholder:text-slate-400"
                    placeholder="Type your answer here..."
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    style={{ '--ring-color': brandColor } as React.CSSProperties}
                  />
                )}

                {field.type === FieldType.RATING && (
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleChange(field.id, star)}
                        className={`p-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                          answers[field.id] >= star 
                            ? 'text-white shadow-lg' 
                            : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                        }`}
                        style={answers[field.id] >= star ? { backgroundColor: brandColor, boxShadow: `0 4px 10px ${brandColor}40` } : {}}
                      >
                        <Star fill={answers[field.id] >= star ? "currentColor" : "none"} size={32} strokeWidth={2} />
                      </button>
                    ))}
                    <div className="w-full flex justify-between px-1 mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                )}

                {field.type === FieldType.YESNO && (
                  <div className="flex gap-4">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all text-center font-bold ${
                        answers[field.id] === opt 
                          ? 'bg-slate-50 shadow-md' 
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white'
                      }`}
                      style={answers[field.id] === opt ? { borderColor: brandColor, color: brandColor } : {}}
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={opt}
                          required={field.required}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className="sr-only"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                 {field.type === FieldType.CHOICE && (
                  <div className="space-y-3">
                    {field.options?.map(opt => (
                      <label key={opt} className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        answers[field.id] === opt 
                          ? 'bg-slate-50 z-10' 
                          : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300'
                      }`}
                      style={answers[field.id] === opt ? { borderColor: brandColor } : {}}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                          answers[field.id] === opt ? '' : 'border-slate-300'
                        }`}
                        style={answers[field.id] === opt ? { borderColor: brandColor } : {}}
                        >
                          {answers[field.id] === opt && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColor }} />}
                        </div>
                        <input
                          type="radio"
                          name={field.id}
                          value={opt}
                          required={field.required}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className="sr-only"
                        />
                        <span className={`text-lg ${answers[field.id] === opt ? 'font-bold' : 'font-medium text-slate-600'}`}
                           style={answers[field.id] === opt ? { color: brandColor } : {}}
                        >{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-8">
              <button
                type="submit"
                className="group w-full text-white text-xl font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3"
                style={{ backgroundColor: brandColor, boxShadow: `0 10px 25px -5px ${brandColor}50` }}
              >
                Submit Feedback
                <Send size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-center mt-8 pb-12">
           <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-600 bg-white/50 px-4 py-2 rounded-full transition-colors backdrop-blur-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
             Powered by InsightFlow AI
           </Link>
        </div>
      </div>
    </div>
  );
};

export default SubmitForm;