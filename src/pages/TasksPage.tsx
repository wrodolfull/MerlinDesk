import React, { useState, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useTasks } from '../hooks/useTasks';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import EditTaskModal from '../components/tasks/EditTaskModal';
import Button from '../components/ui/Button';
import { Plus, Loader } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import Column from '../components/tasks/Column';

const TasksPage: React.FC = () => {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const columns = useMemo<{ [key in TaskStatus]: Task[] }>(() => {
    // Ordena as tarefas para que as de alta prioridade apareçam primeiro
    const sortedTasks = [...tasks].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    return {
      pending: sortedTasks.filter((task) => task.status === 'pending'),
      in_progress: sortedTasks.filter((task) => task.status === 'in_progress'),
      completed: sortedTasks.filter((task) => task.status === 'completed'),
    };
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

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Planner de Tarefas</h1>
            <p className="text-gray-600 mt-1">Organize seu trabalho com o planner Kanban.</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={18} />}>
            Nova Tarefa
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-6">
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