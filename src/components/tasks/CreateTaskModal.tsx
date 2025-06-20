import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '../ui/Dialog';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { Task } from '../../types';

type CreateTaskData = Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (task: CreateTaskData) => void;
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

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ open, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('pending');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <Input
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva a tarefa"
              as="textarea"
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                id="status"
                value={status}
                onChange={e => setStatus((e.target as HTMLSelectElement).value as Task['status'])}
                options={statusOptions}
              />
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <Select
                id="priority"
                value={priority}
                onChange={e => setPriority((e.target as HTMLSelectElement).value as Task['priority'])}
                options={priorityOptions}
              />
            </div>
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white">Criar Tarefa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal; 