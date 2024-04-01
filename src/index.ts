import 'dotenv/config';
import Whatsapp from './lib/Whatsapp';
import { server } from './server';

export const API_PORT = process.env.API_PORT || 8000;
export const API_URL = process.env.API_URL || 'http://127.0.0.1';

const Main = async () => {
  const whatsapp = new Whatsapp('waweb');
  whatsapp.init();
  whatsapp.qrCode();

  server.listen(API_PORT, () => {
    console.log(`API IS RUNNING ON ${API_URL}:${API_PORT}. FETCH('${API_URL}:${API_PORT}/messages') TO GET MESSAGES.`);
  });
};

Main();
