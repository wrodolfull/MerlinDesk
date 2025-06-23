import React from 'react';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Task } from '../../types';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onMoveLeft, 
  onMoveRight 
}) => {
  const priorityClasses: { [key: string]: string } = {
    low: 'border-green-200',
    medium: 'border-yellow-200',
    high: 'border-red-200',
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleMoveLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveLeft?.();
  };

  const handleMoveRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveRight?.();
  };

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200 bg-white">
      <CardContent className="p-4">
        {/* Header com título e botões de ação */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <h4 className="font-semibold text-gray-800 flex-1 pr-2 break-words">{task.title}</h4>
          <div className="flex-shrink-0 flex gap-1">
            <Button variant='outline' size='icon' onClick={handleEditClick} className="h-8 w-8 border-gray-300 hover:border-primary-500 focus:ring-2 focus:ring-primary-500">
              <Edit size={16} className="text-primary-600" />
            </Button>
            <Button variant='outline' size='icon' onClick={handleDeleteClick} className="h-8 w-8 border-gray-300 hover:border-red-500 focus:ring-2 focus:ring-red-500">
              <Trash2 size={16} className="text-red-500" />
            </Button>
          </div>
        </div>

        {/* Descrição */}
        {task.description && (
          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
        )}

        {/* Footer com data, prioridade e botões de movimento */}
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <span className="text-xs text-gray-500">
              {task.dueDate && formatDate(task.dueDate) !== 'Data inválida' ? `Vence em: ${formatDate(task.dueDate)}` : ''}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Botões de movimento */}
            <div className="flex gap-1">
              {onMoveLeft && (
                <Button 
                  variant='ghost' 
                  size='icon' 
                  onClick={handleMoveLeft} 
                  className="h-7 w-7 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  title="Mover para coluna anterior"
                >
                  <ChevronLeft size={16} />
                </Button>
              )}
              {onMoveRight && (
                <Button 
                  variant='ghost' 
                  size='icon' 
                  onClick={handleMoveRight} 
                  className="h-7 w-7 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  title="Mover para próxima coluna"
                >
                  <ChevronRight size={16} />
                </Button>
              )}
            </div>
            
            {/* Badge de prioridade */}
            {task.priority && (
              <Badge className={`${priorityClasses[task.priority] || ''} text-xs border`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard; 