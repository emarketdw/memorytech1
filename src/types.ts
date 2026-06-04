export enum Priority {
  Baixa = 'Baixa',
  Media = 'Média',
  Alta = 'Alta'
}

export enum ProjectStatus {
  Planejamento = 'Planejamento',
  EmAndamento = 'Em andamento',
  Concluido = 'Concluído'
}

export enum TaskStatus {
  Pendente = 'Pendente',
  EmAndamento = 'Em andamento',
  Concluido = 'Concluído'
}

export enum VaultType {
  Senha = 'Senha',
  Cartao = 'Cartão',
  Documento = 'Documento',
  Chave = 'Chave'
}

export interface Note {
  id: string;
  title: string;
  category: 'Trabalho' | 'Estudos' | 'Pessoal' | 'Ideias';
  content: string;
  tags?: string[];
  favorite: boolean;
  date: string;
  userId: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  notes?: string;
  date: string;
  userId: string;
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  tags?: string[];
  date: string;
  userId: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'Planejamento' | 'Em andamento' | 'Concluído';
  tags?: string[];
  date: string;
  userId: string;
}

export interface CustomTag {
  id: string;
  name: string;
  color: string; // Tailwind color name like 'rose-500', 'emerald-500', etc.
  date: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  status: 'Pendente' | 'Em andamento' | 'Concluído';
  deadline?: string;
  completed: boolean;
  date: string;
  userId: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string; // yyyy-mm-dd
  time: string; // hh:mm
  dateCreated: string;
  userId: string;
}

export interface VaultItem {
  id: string;
  title: string;
  type: 'Senha' | 'Cartão' | 'Documento' | 'Chave';
  content: string;
  date: string;
  userId: string;
}

export interface Activity {
  id: string;
  description: string;
  date: string;
  userId: string;
}
