import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '../ui/Dialog';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { Task } from '../../types';
import { formatDateForInput, createISODate } from '../../lib/utils';

type UpdateTaskData = Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  onSave: (updates: UpdateTaskData) => void;
}

function isTodayLocal(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluída' },
];

const priorityOptions = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onClose, task, onSave }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(formatDateForInput(task.dueDate));
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [priority, setPriority] = useState<Task['priority']>(task.priority);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(formatDateForInput(task.dueDate));
    setStatus(task.status);
    setPriority(task.priority);
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      description,
      dueDate: createISODate(dueDate),
      status,
      priority,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea 
              id="description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select 
                id="status" 
                value={status} 
                onChange={(value) => setStatus(value as Task['status'])} 
                options={statusOptions} 
              />
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <Select 
                id="priority" 
                value={priority} 
                onChange={(value) => setPriority(value as Task['priority'])} 
                options={priorityOptions} 
              />
            </div>
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
            <Input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal; 