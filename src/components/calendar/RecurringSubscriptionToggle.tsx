import React from 'react';
import { Switch } from '/root/MerlinDesk/src/components/ui/Switch.tsx';
import { Label } from '/root/MerlinDesk/src/components/ui/Label.tsx';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface RecurringSubscriptionToggleProps {
  calendarId: string;
  initialValue: boolean;
  onToggle: (value: boolean) => void;
}

export function RecurringSubscriptionToggle({
  calendarId,
  initialValue,
  onToggle,
}: RecurringSubscriptionToggleProps) {
  const [isEnabled, setIsEnabled] = React.useState(initialValue);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('calendars')
        .update({ has_recurring_subscription: checked })
        .eq('id', calendarId);

      if (error) throw error;

      setIsEnabled(checked);
      onToggle(checked);
      toast.success(
        checked
          ? 'Assinatura recorrente ativada com sucesso!'
          : 'Assinatura recorrente desativada com sucesso!'
      );
    } catch (error) {
      console.error('Error updating recurring subscription:', error);
      toast.error('Erro ao atualizar configuração de assinatura recorrente');
      setIsEnabled(!checked); // Revert the toggle
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="recurring-subscription"
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <Label htmlFor="recurring-subscription">
        Assinatura Recorrente
      </Label>
    </div>
  );
} 