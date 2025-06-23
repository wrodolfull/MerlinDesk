import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const PaymentCancelledPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
      <Card className="w-full max-w-md text-center shadow-lg bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Pagamento Cancelado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            O processo de pagamento foi cancelado. Sua assinatura não foi alterada. Você pode tentar novamente a qualquer momento.
          </p>
          <Link to="/subscription">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Assinaturas
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelledPage; 