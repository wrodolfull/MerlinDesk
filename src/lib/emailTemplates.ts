export const appointmentConfirmationTemplate = (data: {
  clientName: string;
  professionalName: string;
  specialtyName: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  guests?: string[];
}) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Agendamento</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #7C45D0;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #7C45D0;
            margin-bottom: 10px;
        }
        .title {
            color: #2d3748;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #718096;
            font-size: 16px;
        }
        .appointment-details {
            background-color: #f7fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #7C45D0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
        }
        .detail-label {
            font-weight: 600;
            color: #4a5568;
        }
        .detail-value {
            color: #2d3748;
        }
        .guests-section {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .guest-email {
            background-color: #edf2f7;
            padding: 8px 12px;
            border-radius: 6px;
            margin: 5px 0;
            display: inline-block;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #718096;
            font-size: 14px;
        }
        .merlin-desk-promo {
            background: linear-gradient(135deg, #7C45D0, #9f7aea);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .merlin-desk-promo h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .merlin-desk-promo p {
            margin: 0 0 15px 0;
            opacity: 0.9;
        }
        .cta-button {
            display: inline-block;
            background-color: white;
            color: #7C45D0;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            background-color: #f7fafc;
            transform: translateY(-2px);
        }
        .notes {
            background-color: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Merlin Desk</div>
            <h1 class="title">✅ Agendamento Confirmado!</h1>
            <p class="subtitle">Seu agendamento foi realizado com sucesso</p>
        </div>

        <div class="appointment-details">
            <div class="detail-row">
                <span class="detail-label">Cliente:</span>
                <span class="detail-value">${data.clientName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Profissional:</span>
                <span class="detail-value">${data.professionalName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Serviço:</span>
                <span class="detail-value">${data.specialtyName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Data:</span>
                <span class="detail-value">${data.date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Horário:</span>
                <span class="detail-value">${data.time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Duração:</span>
                <span class="detail-value">${data.duration} minutos</span>
            </div>
            ${data.notes ? `
            <div class="notes">
                <strong>Observações:</strong><br>
                ${data.notes}
            </div>
            ` : ''}
            ${data.guests && data.guests.length > 0 ? `
            <div class="guests-section">
                <strong>Convidados:</strong><br>
                ${data.guests.map(email => `<span class="guest-email">${email}</span>`).join('')}
            </div>
            ` : ''}
        </div>

        <div class="merlin-desk-promo">
            <h3>🎉 Agendamento realizado com Merlin Desk!</h3>
            <p>Gerencie seus agendamentos de forma simples e eficiente. Organize sua agenda, clientes e profissionais em um só lugar.</p>
            <a href="https://merlindesk.com" class="cta-button">Conheça o Merlin Desk</a>
        </div>

        <div class="footer">
            <p>Este e-mail foi enviado automaticamente pelo Merlin Desk</p>
            <p>Para dúvidas, entre em contato conosco</p>
        </div>
    </div>
</body>
</html>
`;

export const appointmentReminderTemplate = (data: {
  clientName: string;
  professionalName: string;
  specialtyName: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  guests?: string[];
  hoursUntil: number;
}) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lembrete de Agendamento</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #7C45D0;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #7C45D0;
            margin-bottom: 10px;
        }
        .title {
            color: #2d3748;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #718096;
            font-size: 16px;
        }
        .reminder-badge {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .appointment-details {
            background-color: #f7fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #7C45D0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
        }
        .detail-label {
            font-weight: 600;
            color: #4a5568;
        }
        .detail-value {
            color: #2d3748;
        }
        .guests-section {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .guest-email {
            background-color: #edf2f7;
            padding: 8px 12px;
            border-radius: 6px;
            margin: 5px 0;
            display: inline-block;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #718096;
            font-size: 14px;
        }
        .merlin-desk-promo {
            background: linear-gradient(135deg, #7C45D0, #9f7aea);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .merlin-desk-promo h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .merlin-desk-promo p {
            margin: 0 0 15px 0;
            opacity: 0.9;
        }
        .cta-button {
            display: inline-block;
            background-color: white;
            color: #7C45D0;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            background-color: #f7fafc;
            transform: translateY(-2px);
        }
        .notes {
            background-color: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Merlin Desk</div>
            <h1 class="title">⏰ Lembrete de Agendamento</h1>
            <p class="subtitle">Seu agendamento está chegando!</p>
            <div class="reminder-badge">
                ${data.hoursUntil === 1 ? '1 hora' : `${data.hoursUntil} horas`} restantes
            </div>
        </div>

        <div class="appointment-details">
            <div class="detail-row">
                <span class="detail-label">Cliente:</span>
                <span class="detail-value">${data.clientName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Profissional:</span>
                <span class="detail-value">${data.professionalName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Serviço:</span>
                <span class="detail-value">${data.specialtyName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Data:</span>
                <span class="detail-value">${data.date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Horário:</span>
                <span class="detail-value">${data.time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Duração:</span>
                <span class="detail-value">${data.duration} minutos</span>
            </div>
            ${data.notes ? `
            <div class="notes">
                <strong>Observações:</strong><br>
                ${data.notes}
            </div>
            ` : ''}
            ${data.guests && data.guests.length > 0 ? `
            <div class="guests-section">
                <strong>Convidados:</strong><br>
                ${data.guests.map(email => `<span class="guest-email">${email}</span>`).join('')}
            </div>
            ` : ''}
        </div>

        <div class="merlin-desk-promo">
            <h3>📅 Gerencie seus agendamentos com Merlin Desk!</h3>
            <p>Nunca mais perca um compromisso. Organize sua agenda profissional de forma inteligente e eficiente.</p>
            <a href="https://merlindesk.com" class="cta-button">Experimente Gratuitamente</a>
        </div>

        <div class="footer">
            <p>Este lembrete foi enviado automaticamente pelo Merlin Desk</p>
            <p>Para dúvidas, entre em contato conosco</p>
        </div>
    </div>
</body>
</html>
`; 