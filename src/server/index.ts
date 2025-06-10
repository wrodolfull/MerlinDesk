import express from 'express';
import cors from 'cors';
import googleRoutes from './google';
import googleCalendarRoutes from './google-calendar';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/google', googleRoutes);
app.use('/google', googleCalendarRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
