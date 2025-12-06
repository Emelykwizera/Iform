export enum FieldType {
  TEXT = 'text',
  RATING = 'rating',
  CHOICE = 'choice',
  YESNO = 'yesno'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  DEPT_ADMIN = 'DEPT_ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: string; // Null for Super Admin
  departmentId?: string; // Null for Institution Admin
  avatar?: string;
}

export interface Institution {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  institutionId: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[]; // For choice type
  required?: boolean;
}

export interface FormTemplate {
  id: string;
  institutionId: string;
  departmentId?: string; // Optional, if null it's institution-wide
  title: string;
  description: string;
  industry: string; 
  fields: FormField[];
  createdAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  answers: Record<string, string | number>; // fieldId -> value
  submittedAt: string;
}

export interface AIAnalysisResult {
  summary: string;
  sentimentScore: number; // 0 to 100
  sentimentTrend: 'positive' | 'neutral' | 'negative';
  keyThemes: string[];
  recommendations: Recommendation[];
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface AnalysisRecord {
  formId: string;
  result: AIAnalysisResult;
  generatedAt: string;
}

// Helper types for chart data
export interface ChartDataPoint {
  name: string;
  value: number;
}