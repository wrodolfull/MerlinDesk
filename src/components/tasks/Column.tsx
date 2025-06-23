import React from 'react';
import { Task, TaskStatus } from '../../types';
import TaskCard from './TaskCard';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

const Column: React.FC<ColumnProps> = ({ 
  id, 
  title, 
  tasks, 
  onEdit, 
  onDelete, 
  onMoveTask,
  canMoveLeft,
  canMoveRight
}) => {
  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    const statusOrder: TaskStatus[] = ['pending', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;
  };

  const getPrevStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    const statusOrder: TaskStatus[] = ['pending', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return currentIndex > 0 ? statusOrder[currentIndex - 1] : null;
  };

  return (
    <div className="w-full sm:w-1/3 flex-shrink-0 bg-gray-100 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 px-2">{title}</h3>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveLeft={canMoveLeft ? () => {
              const prevStatus = getPrevStatus(task.status as TaskStatus);
              if (prevStatus) onMoveTask(task.id, prevStatus);
            } : undefined}
            onMoveRight={canMoveRight ? () => {
              const nextStatus = getNextStatus(task.status as TaskStatus);
              if (nextStatus) onMoveTask(task.id, nextStatus);
            } : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default Column; 