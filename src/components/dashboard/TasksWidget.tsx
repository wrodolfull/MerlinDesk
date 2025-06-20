import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

function isTodayLocal(dateString: string) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

function isThisWeekLocal(dateString: string) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay() + 1));
  const endOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), startOfWeek.getUTCDate() + 6));
  return date >= startOfWeek && date <= endOfWeek;
}

const MAX_TASKS = 5;

const TasksWidget: React.FC = () => {
  const { tasks, updateTask } = useTasks();
  const todayTasks = tasks.filter(t => t.dueDate && isTodayLocal(t.dueDate) && t.status !== 'completed').slice(0, MAX_TASKS);
  const weekTasks = tasks.filter(t => t.dueDate && isThisWeekLocal(t.dueDate) && !isTodayLocal(t.dueDate) && t.status !== 'completed').slice(0, MAX_TASKS);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tarefas de hoje</h2>
        <Link to="/tasks">
          <Button variant="outline" size="sm">Ver todas</Button>
        </Link>
      </div>
      {todayTasks.length === 0 ? (
        <div className="text-gray-500 text-sm">Nenhuma tarefa para hoje.</div>
      ) : (
        <div className="grid gap-2">
          {todayTasks.map(task => (
            <div key={task.id} className="flex items-center bg-gray-50 rounded px-3 py-2 shadow-sm">
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={() => updateTask(task.id, { status: 'completed' })}
                className="accent-primary-600 w-5 h-5 mr-3"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-base truncate">{task.title}</div>
                {task.description && <div className="text-xs text-gray-500 truncate">{task.description}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {weekTasks.length > 0 && (
        <>
          <div className="mt-6 text-sm font-semibold text-gray-700">Esta semana</div>
          <div className="grid gap-2 mt-2">
            {weekTasks.map(task => (
              <div key={task.id} className="flex items-center bg-gray-50 rounded px-3 py-2 shadow-sm">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => updateTask(task.id, { status: 'completed' })}
                  className="accent-primary-600 w-5 h-5 mr-3"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-base truncate">{task.title} <span className="text-xs text-gray-400">({new Date(task.dueDate!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})</span></div>
                  {task.description && <div className="text-xs text-gray-500 truncate">{task.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TasksWidget; 