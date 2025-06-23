import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { Check, Calendar, Loader, AlertTriangle, ListTodo } from 'lucide-react';
import { Task } from '../../types';
import Badge from '../ui/Badge';
import { formatDate } from '../../lib/utils';

const priorityClasses: { [key: string]: string } = {
  low: 'border-green-500 bg-green-50 text-green-700',
  medium: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  high: 'border-red-500 bg-red-50 text-red-700',
};

const MAX_TASKS_TO_SHOW = 5;

const TasksWidget: React.FC = () => {
  const { tasks, loading, updateTask } = useTasks();

  const pendingTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityA = priorityOrder[a.priority];
      const priorityB = priorityOrder[b.priority];
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      // Se ambas as tarefas têm data válida, ordena por data
      if (a.dueDate && b.dueDate) {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateA.getTime() - dateB.getTime();
        }
      }
      
      // Se apenas uma tem data válida, a que tem data vem primeiro
      if (a.dueDate && !b.dueDate) {
        const dateA = new Date(a.dueDate);
        if (!isNaN(dateA.getTime())) return -1;
      }
      if (!a.dueDate && b.dueDate) {
        const dateB = new Date(b.dueDate);
        if (!isNaN(dateB.getTime())) return 1;
      }
      
      return 0;
    })
    .slice(0, MAX_TASKS_TO_SHOW);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <ListTodo className="w-6 h-6 mr-3 text-primary-600" />
          Próximas Tarefas
        </h2>
        <Link to="/tasks">
          <Button variant="outline" size="sm">Ver Planner</Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
            <Loader className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : pendingTasks.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
            <Check className="mx-auto w-12 h-12 text-green-400" />
            <p className="mt-2">Tudo em dia! Nenhuma tarefa pendente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTasks.map(task => (
            <div 
              key={task.id} 
              className="flex items-center bg-gray-50/50 hover:bg-gray-100/80 transition-colors duration-200 rounded-lg p-3 border border-gray-200"
            >
              <button 
                onClick={() => updateTask(task.id, { status: 'completed' })}
                className="group p-1 rounded-full hover:bg-green-100 mr-3"
                title="Marcar como concluída"
              >
                  <Check className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
              </button>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{task.title}</p>
                {task.dueDate && formatDate(task.dueDate) !== 'Data inválida' && (
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    <span>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                )}
              </div>
              
              <Badge className={`${priorityClasses[task.priority] || ''} ml-2`}>
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksWidget; 