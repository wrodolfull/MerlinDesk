import React, { useState, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useTasks } from '../hooks/useTasks';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import Button from '../components/ui/Button';
import EditTaskModal from '../components/tasks/EditTaskModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Plus, CheckCircle, Clock, Loader, ListTodo } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Task, CreateTaskDB, UpdateTaskDB } from '../types';

const TasksPage: React.FC = () => {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const in_progress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return { total, pending, in_progress, completed };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const statusOptions = [
    { value: 'all', label: 'Todos Status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'completed', label: 'Concluída' },
  ];

  const statCards = [
    { title: 'Total de Tarefas', value: stats.total, icon: <ListTodo className="text-blue-500" /> },
    { title: 'Pendentes', value: stats.pending, icon: <Clock className="text-yellow-500" /> },
    { title: 'Em Andamento', value: stats.in_progress, icon: <Loader className="text-orange-500" /> },
    { title: 'Concluídas', value: stats.completed, icon: <CheckCircle className="text-green-500" /> },
  ];

  const handleCreateTask = async (data: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const { title, description, dueDate, status, priority } = data;
    await createTask({
      title,
      description,
      due_date: dueDate,
      status,
      priority,
    });
    setShowModal(false);
  };

  const handleUpdateTask = async (updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!editTask) return;
    const { title, description, dueDate, status, priority } = updates;
    await updateTask(editTask.id, {
      title,
      description,
      due_date: dueDate,
      status,
      priority,
    });
    setEditTask(null);
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minhas Tarefas</h1>
            <p className="text-gray-600 mt-1">Gerencie suas tarefas de forma eficiente e organizada</p>
          </div>
          <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={18} />}>
            Nova Tarefa
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map(card => (
            <Card key={card.title}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">{card.icon}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar tarefas..."
            className="flex-grow"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(typeof e === 'string' ? e : e.target.value)}
            options={statusOptions}
            className="w-full sm:w-auto"
          />
        </div>
        
        {loading ? (
          <div className="text-center py-12"><Loader className="mx-auto animate-spin text-primary-600" /></div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Nenhuma tarefa encontrada.</div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map(task => (
              <Card key={task.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                    className="accent-primary-600 w-5 h-5"
                  />
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-gray-500">{task.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditTask(task)}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>Excluir</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
      {showModal && (
        <CreateTaskModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateTask}
        />
      )}
      {editTask && (
        <EditTaskModal
          open={!!editTask}
          onClose={() => setEditTask(null)}
          task={editTask}
          onSave={handleUpdateTask}
        />
      )}
    </DashboardLayout>
  );
};

export default TasksPage; 