import React, { useState, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useTasks } from '../hooks/useTasks';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import EditTaskModal from '../components/tasks/EditTaskModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Plus, Loader, TrendingUp, Clock, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../types';
import Column from '../components/tasks/Column';

const TasksPage: React.FC = () => {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');

  const columns = useMemo<{ [key in TaskStatus]: Task[] }>(() => {
    // Filtrar por prioridade se necessário
    let filteredTasks = tasks;
    if (filterPriority !== 'all') {
      filteredTasks = tasks.filter(task => task.priority === filterPriority);
    }

    // Ordena as tarefas para que as de alta prioridade apareçam primeiro
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    return {
      pending: sortedTasks.filter((task) => task.status === 'pending'),
      in_progress: sortedTasks.filter((task) => task.status === 'in_progress'),
      completed: sortedTasks.filter((task) => task.status === 'completed'),
    };
  }, [tasks, filterPriority]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length;
    const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;

    return { total, pending, inProgress, completed, overdue, highPriority };
  }, [tasks]);

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTask(taskId, { status: newStatus });
    }
  };
  
  const handleCreateTask = async (data: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    await createTask(data);
    setShowCreateModal(false);
  };

  const handleUpdateTask = async (updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, updates);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(taskId);
    }
  };

  const clearFilter = () => setFilterPriority('all');

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Planner de Tarefas</h1>
            <p className="text-gray-600 mt-1">Organize seu trabalho com o planner Kanban.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={18} />}>
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">A Fazer</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alta Prioridade</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 mb-6 overflow-x-auto">
          <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 flex-shrink-0">Filtrar por prioridade:</span>
          <div className="flex flex-wrap gap-2 min-w-0">
            <Button
              variant={filterPriority === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={clearFilter}
            >
              Todas
            </Button>
            <Button
              variant={filterPriority === 'high' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterPriority('high')}
              className={filterPriority === 'high' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Alta
            </Button>
            <Button
              variant={filterPriority === 'medium' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterPriority('medium')}
              className={filterPriority === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            >
              Média
            </Button>
            <Button
              variant={filterPriority === 'low' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterPriority('low')}
              className={filterPriority === 'low' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              Baixa
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <Column
              id="pending"
              title="A Fazer"
              tasks={columns.pending}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onMoveTask={moveTask}
              canMoveLeft={false}
              canMoveRight={true}
            />
            <Column
              id="in_progress"
              title="Em Andamento"
              tasks={columns.in_progress}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onMoveTask={moveTask}
              canMoveLeft={true}
              canMoveRight={true}
            />
            <Column
              id="completed"
              title="Concluído"
              tasks={columns.completed}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onMoveTask={moveTask}
              canMoveLeft={true}
              canMoveRight={false}
            />
          </div>
        )}

        {/* Estado vazio */}
        {!loading && tasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tarefa criada</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira tarefa para organizar seu trabalho.</p>
            <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={18} />}>
              Criar Primeira Tarefa
            </Button>
          </div>
        )}
      </div>
      
      {showCreateModal && (
        <CreateTaskModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
        />
      )}
      {editingTask && (
        <EditTaskModal
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          task={editingTask}
          onSave={handleUpdateTask}
        />
      )}
    </DashboardLayout>
  );
};

export default TasksPage; 