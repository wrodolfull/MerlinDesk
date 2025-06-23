import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const PaymentSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
      <Card className="w-full max-w-md text-center shadow-lg bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Pagamento Concluído!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Sua assinatura foi ativada com sucesso. Você já pode aproveitar todos os recursos do seu novo plano.
          </p>
          <Link to="/dashboard">
            <Button className="w-full">
              Ir para o Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage; 