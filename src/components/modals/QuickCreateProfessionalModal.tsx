import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

interface QuickCreateProfessionalModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const QuickCreateProfessionalModal: React.FC<QuickCreateProfessionalModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await window.supabase
        .from('professionals')
        .insert({ name, email: email || null, phone: phone || null });
      if (error) throw error;
      toast.success('Profissional criado!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Erro ao criar profissional');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-semibold mb-4">Novo profissional</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" value={name} onChange={e => setName(e.target.value)} required disabled={isSubmitting} />
          <Input label="Email (opcional)" value={email} onChange={e => setEmail(e.target.value)} disabled={isSubmitting} />
          <Input label="Telefone (opcional)" value={phone} onChange={e => setPhone(e.target.value)} disabled={isSubmitting} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickCreateProfessionalModal; 