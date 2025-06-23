import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Task, CreateTaskDB, UpdateTaskDB } from '../types';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });
    if (error) setError(error.message);
    setTasks((data || []).map(task => ({
      ...task,
      dueDate: task.due_date || undefined,
    })));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return;
    const { dueDate, ...rest } = task;
    const taskToInsert: CreateTaskDB = {
      ...rest,
      due_date: dueDate,
    };
    const { error } = await supabase.from('tasks').insert({ ...taskToInsert, user_id: user.id });
    if (error) {
      console.error("Error creating task:", error);
    } else {
      fetchTasks();
    }
    return error;
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    const { dueDate, ...rest } = updates;
    const updatesForDB: UpdateTaskDB = {
      ...rest,
    };
    if (dueDate !== undefined) {
      updatesForDB.due_date = dueDate;
    }

    const { error } = await supabase.from('tasks').update(updatesForDB).eq('id', id);
    if (error) {
      console.error("Error updating task:", error);
    } else {
      fetchTasks();
    }
    return error;
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) fetchTasks();
    return error;
  };

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask };
} 