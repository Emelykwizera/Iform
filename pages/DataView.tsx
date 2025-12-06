import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Download, FileSpreadsheet } from 'lucide-react';

const DataView: React.FC = () => {
  const { forms, responses } = useAppStore();
  const [selectedFormId, setSelectedFormId] = useState(forms[0]?.id || '');
  
  const selectedForm = forms.find(f => f.id === selectedFormId);
  const filteredResponses = responses.filter(r => r.formId === selectedFormId);

  const handleExport = () => {
    if (!filteredResponses.length || !selectedForm) return;

    // Create CSV content
    const headers = ['Submitted At', ...selectedForm.fields.map(f => f.label.replace(/,/g, ' '))];
    const rows = filteredResponses.map(r => {
      const date = new Date(r.submittedAt).toLocaleString();
      const answers = selectedForm.fields.map(f => {
        const val = r.answers[f.id];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      });
      return [date, ...answers].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedForm.title}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Response Data</h1>
        <div className="flex gap-4">
           <select 
             value={selectedFormId}
             onChange={(e) => setSelectedFormId(e.target.value)}
             className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
           >
             {forms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
           </select>
           <button 
             onClick={handleExport}
             disabled={!filteredResponses.length}
             className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Download size={16} /> Export CSV
           </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">Submitted At</th>
                {selectedForm?.fields.map(field => (
                  <th key={field.id} className="px-6 py-3 min-w-[150px] max-w-[300px] truncate" title={field.label}>
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResponses.length > 0 ? (
                filteredResponses.map((response) => (
                  <tr key={response.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(response.submittedAt).toLocaleDateString()}
                    </td>
                    {selectedForm?.fields.map(field => (
                      <td key={field.id} className="px-6 py-4 truncate max-w-[300px]">
                        {response.answers[field.id]?.toString() || '-'}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={selectedForm ? selectedForm.fields.length + 1 : 1} className="px-6 py-8 text-center text-slate-400">
                     No responses found for this form.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataView;