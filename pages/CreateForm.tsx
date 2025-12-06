import React, { useState } from 'react';
import { generateFormWithAI } from '../services/gemini';
import { FormTemplate, FieldType, FormField } from '../types';
import { useAppStore } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Plus, Trash2, Save, GripVertical, Wand2 } from 'lucide-react';

const CreateForm: React.FC = () => {
  const navigate = useNavigate();
  const { addForm } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'prompt' | 'edit'>('prompt');
  
  // New Form State
  const [formState, setFormState] = useState<Partial<FormTemplate>>({
    title: '',
    description: '',
    industry: '',
    fields: []
  });

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAIGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const generated = await generateFormWithAI(prompt);
      setFormState({
        ...generated,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      });
      setMode('edit');
    } catch (err) {
      alert("Failed to generate form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!formState.title || !formState.fields?.length) {
      alert("Please ensure the form has a title and at least one question.");
      return;
    }
    const newForm = formState as FormTemplate;
    if(!newForm.id) newForm.id = crypto.randomUUID();
    if(!newForm.createdAt) newForm.createdAt = new Date().toISOString();
    
    addForm(newForm);
    navigate('/');
  };

  const addField = () => {
    setFormState(prev => ({
      ...prev,
      fields: [...(prev.fields || []), { id: `field_${Date.now()}`, label: 'New Question', type: FieldType.TEXT, required: false }]
    }));
  };

  const removeField = (idx: number) => {
    setFormState(prev => ({
      ...prev,
      fields: prev.fields?.filter((_, i) => i !== idx)
    }));
  };

  const updateField = (idx: number, updates: Partial<FormField>) => {
    setFormState(prev => ({
      ...prev,
      fields: prev.fields?.map((f, i) => i === idx ? { ...f, ...updates } : f)
    }));
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    // Prevent drag if interacting with inputs to allow text selection/editing
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT', 'LABEL'].includes(target.tagName)) {
      e.preventDefault();
      return;
    }
    
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Optional: Set a transparent drag image or rely on browser default
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedIndex === null) return;
    if (draggedIndex === index) return;

    // Move the item
    const newFields = [...(formState.fields || [])];
    const draggedItem = newFields[draggedIndex];
    
    // Remove from old pos
    newFields.splice(draggedIndex, 1);
    // Insert at new pos
    newFields.splice(index, 0, draggedItem);

    setFormState(prev => ({ ...prev, fields: newFields }));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (mode === 'prompt') {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100 rotate-3">
             <Wand2 size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">What do you want to measure?</h1>
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            Describe your goal, and our AI will instantly build a professional feedback form tailored to your industry.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-900/5 p-2 border border-slate-100 animate-in fade-in scale-95 duration-500">
          <div className="p-6 md:p-8">
            <textarea
              className="w-full p-4 text-lg border-0 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none h-40 resize-none placeholder:text-slate-400 text-slate-700 transition-all"
              placeholder="e.g., I need a patient satisfaction survey for a dental clinic focusing on waiting times, doctor friendliness, and facility cleanliness..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
               <button
                onClick={handleAIGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full md:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Analyzing Requirements...
                  </>
                ) : (
                  <>
                    <Sparkles /> Generate Form with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
             <button onClick={() => setMode('edit')} className="text-sm font-semibold text-slate-400 hover:text-indigo-600 transition-colors">
                Skip AI and build manually
             </button>
        </div>

        <div className="mt-16">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Popular Templates</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Restaurant Feedback', icon: '🍔' }, 
              { label: 'Course Evaluation', icon: '🎓' }, 
              { label: 'Hotel Experience', icon: '🏨' }, 
              { label: 'Employee Pulse', icon: '💼' }
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setPrompt(`Create a ${item.label} form`)}
                className="group p-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col gap-2"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customize Form</h1>
          <p className="text-slate-500">Review and edit your form before publishing.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setMode('prompt')} 
            className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <Save size={18} /> Save & Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Form Title</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full text-3xl font-extrabold text-slate-900 border-b-2 border-slate-100 focus:border-indigo-500 outline-none pb-2 placeholder:text-slate-300 bg-transparent"
                  placeholder="Enter form title..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full text-lg text-slate-600 border-b-2 border-slate-100 focus:border-indigo-500 outline-none pb-2 resize-none h-24 placeholder:text-slate-300 bg-transparent leading-relaxed"
                  placeholder="Enter a friendly description for your respondents..."
                />
              </div>
               <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Industry Category</label>
                <input
                  type="text"
                  value={formState.industry}
                  onChange={(e) => setFormState({ ...formState, industry: e.target.value })}
                  className="w-full text-slate-700 font-medium border-b-2 border-slate-100 focus:border-indigo-500 outline-none pb-2 bg-transparent"
                  placeholder="e.g. Healthcare, Education, Hospitality"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {formState.fields?.map((field, idx) => (
              <div 
                key={field.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`group bg-white p-6 rounded-2xl border transition-all duration-200 ${
                  draggedIndex === idx 
                    ? 'border-indigo-500 shadow-xl scale-[1.02] z-10 opacity-90' 
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-3 text-slate-300 cursor-move hover:text-slate-500 active:text-indigo-600" title="Drag to reorder">
                    <GripVertical size={20} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                       <span className="mt-2 text-xs font-bold text-slate-300">Q{idx+1}</span>
                       <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        className="w-full text-lg font-bold text-slate-900 border-2 border-transparent hover:border-slate-100 focus:border-indigo-500 rounded-lg px-3 py-1.5 outline-none transition-all"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 pl-6">
                      <select
                        value={field.type}
                        onChange={(e) => updateField(idx, { type: e.target.value as FieldType })}
                        className="text-sm font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={FieldType.TEXT}>Text Answer</option>
                        <option value={FieldType.RATING}>Rating Scale (1-5)</option>
                        <option value={FieldType.YESNO}>Yes / No</option>
                        <option value={FieldType.CHOICE}>Multiple Choice</option>
                      </select>
                      
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(idx, { required: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        Required
                      </label>
                    </div>

                    {field.type === FieldType.CHOICE && (
                      <div className="ml-6 p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choices (Comma separated)</p>
                        <input
                            type="text"
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(idx, { options: e.target.value.split(',').map(s => s.trim()) })}
                            className="w-full text-sm border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => removeField(idx)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Question"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            <button
              onClick={addField}
              className="w-full py-5 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Add Another Question
            </button>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                   <Sparkles className="text-amber-300" />
                </div>
                <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                <p className="text-sm text-indigo-100 leading-relaxed opacity-90">
                You can rearrange questions by dragging them. Keep your form under 7 questions for maximum completion rates.
                </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl -mr-10 -mt-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateForm;