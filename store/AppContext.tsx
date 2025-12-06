import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FormTemplate, FormResponse, AnalysisRecord, FieldType, User, Institution, Department, UserRole } from '../types';

interface AppContextType {
  currentUser: User | null;
  institutions: Institution[];
  departments: Department[];
  forms: FormTemplate[];
  responses: FormResponse[];
  analyses: AnalysisRecord[];
  
  login: (email: string) => void;
  logout: () => void;
  
  // Super Admin Actions
  addInstitution: (inst: Institution) => void;
  
  // Institution Admin Actions
  updateInstitution: (id: string, updates: Partial<Institution>) => void;
  addDepartment: (dept: Department) => void;
  
  // General Actions
  addForm: (form: FormTemplate) => void;
  addResponse: (response: FormResponse) => void;
  addAnalysis: (analysis: AnalysisRecord) => void;
  
  // Getters
  getForm: (id: string) => FormTemplate | undefined;
  getResponsesByForm: (formId: string) => FormResponse[];
  getAnalysisByForm: (formId: string) => AnalysisRecord | undefined;
  getCurrentInstitution: () => Institution | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- MOCK DATA ---

const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-1',
    name: 'Grand Azure Hotels',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/201/201623.png',
    primaryColor: '#0f766e', // Teal
    secondaryColor: '#f0fdfa',
    createdAt: new Date().toISOString()
  },
  {
    id: 'inst-2',
    name: 'City General Hospital',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
    primaryColor: '#dc2626', // Red
    secondaryColor: '#fef2f2',
    createdAt: new Date().toISOString()
  }
];

const MOCK_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Front Desk', institutionId: 'inst-1' },
  { id: 'dept-2', name: 'Housekeeping', institutionId: 'inst-1' },
  { id: 'dept-3', name: 'Emergency Room', institutionId: 'inst-2' }
];

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Super Admin', email: 'super@insightflow.ai', role: UserRole.SUPER_ADMIN },
  { id: 'u2', name: 'Sarah Hotel Manager', email: 'sarah@azure.com', role: UserRole.INSTITUTION_ADMIN, institutionId: 'inst-1' },
  { id: 'u3', name: 'John Housekeeping', email: 'john@azure.com', role: UserRole.DEPT_ADMIN, institutionId: 'inst-1', departmentId: 'dept-2' },
  { id: 'u4', name: 'Dr. Emily', email: 'emily@hospital.com', role: UserRole.INSTITUTION_ADMIN, institutionId: 'inst-2' },
];

const MOCK_FORM_ID = 'form-1';
const MOCK_FORM: FormTemplate = {
  id: MOCK_FORM_ID,
  institutionId: 'inst-1',
  title: 'Guest Experience Survey',
  description: 'Tell us about your stay at Grand Azure.',
  industry: 'Hospitality',
  createdAt: new Date().toISOString(),
  fields: [
    { id: 'cleanliness', label: 'Room Cleanliness', type: FieldType.RATING, required: true },
    { id: 'staff', label: 'Staff Friendliness', type: FieldType.RATING, required: true },
    { id: 'comments', label: 'Comments', type: FieldType.TEXT, required: false }
  ]
};

// --- PROVIDER ---

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>(MOCK_INSTITUTIONS);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [forms, setForms] = useState<FormTemplate[]>([MOCK_FORM]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);

  // Simulate loading User from local storage session
  useEffect(() => {
    const savedUser = localStorage.getItem('if_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    // Load persisted data
    const savedInsts = localStorage.getItem('if_institutions');
    if (savedInsts) setInstitutions(JSON.parse(savedInsts));
    
    const savedForms = localStorage.getItem('if_forms');
    if (savedForms) setForms(JSON.parse(savedForms));
  }, []);

  // Persistence effects
  useEffect(() => { if (institutions.length) localStorage.setItem('if_institutions', JSON.stringify(institutions)); }, [institutions]);
  useEffect(() => { if (forms.length) localStorage.setItem('if_forms', JSON.stringify(forms)); }, [forms]);
  useEffect(() => { if (currentUser) localStorage.setItem('if_user', JSON.stringify(currentUser)); else localStorage.removeItem('if_user'); }, [currentUser]);

  const login = (email: string) => {
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) setCurrentUser(user);
    else alert("User not found (Try super@insightflow.ai, sarah@azure.com, or john@azure.com)");
  };

  const logout = () => setCurrentUser(null);

  const addInstitution = (inst: Institution) => setInstitutions(prev => [inst, ...prev]);
  
  const updateInstitution = (id: string, updates: Partial<Institution>) => {
    setInstitutions(prev => prev.map(inst => inst.id === id ? { ...inst, ...updates } : inst));
  };

  const addDepartment = (dept: Department) => setDepartments(prev => [...prev, dept]);

  const addForm = (form: FormTemplate) => {
    // If user is logged in, attach institution ID automatically if missing
    const newForm = { ...form };
    if (currentUser && currentUser.institutionId && !newForm.institutionId) {
      newForm.institutionId = currentUser.institutionId;
    }
    if (currentUser && currentUser.departmentId && !newForm.departmentId) {
      newForm.departmentId = currentUser.departmentId;
    }
    setForms(prev => [newForm, ...prev]);
  };

  const addResponse = (response: FormResponse) => setResponses(prev => [response, ...prev]);
  const addAnalysis = (analysis: AnalysisRecord) => {
    setAnalyses(prev => {
      const filtered = prev.filter(a => a.formId !== analysis.formId);
      return [analysis, ...filtered];
    });
  };

  const getForm = (id: string) => forms.find(f => f.id === id);
  const getResponsesByForm = (formId: string) => responses.filter(r => r.formId === formId);
  const getAnalysisByForm = (formId: string) => analyses.find(a => a.formId === formId);
  
  const getCurrentInstitution = () => {
    if (!currentUser?.institutionId) return undefined;
    return institutions.find(i => i.id === currentUser.institutionId);
  };

  // Filter forms based on user role logic
  const visibleForms = forms.filter(f => {
    if (!currentUser) return false;
    if (currentUser.role === UserRole.SUPER_ADMIN) return true;
    if (f.institutionId !== currentUser.institutionId) return false;
    if (currentUser.role === UserRole.DEPT_ADMIN && f.departmentId && f.departmentId !== currentUser.departmentId) return false;
    return true;
  });

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      institutions, 
      departments: departments.filter(d => !currentUser?.institutionId || d.institutionId === currentUser.institutionId),
      forms: visibleForms, 
      responses, 
      analyses, 
      login, logout,
      addInstitution, updateInstitution, addDepartment,
      addForm, addResponse, addAnalysis, 
      getForm, getResponsesByForm, getAnalysisByForm, getCurrentInstitution
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
};