import 'dotenv/config';

import { Client, LocalAuth, Message, type Chat } from 'whatsapp-web.js';
import { join } from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
// import { openUrl } from '../utils/openUrl';
// import { API_PORT, API_URL } from '..';

const prisma = new PrismaClient();
const wwebVersion = '2.2409.2';

export default class Whatsapp extends Client {
  public id: string | undefined;
  public me: string | undefined;
  public status: string | undefined;

  constructor(id: string) {
    super({
      authStrategy: new LocalAuth({
        clientId: id,
        dataPath: join(__dirname, '..', '..', 'database', 'bot-session'),
      }),
      webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
      },
      puppeteer: {
        product: 'chrome',
        headless: true,
        executablePath: `${process.env.WEB_PATH}`,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
        ],
      },
    });
    this.id = id;
    this.me = this.info !== undefined ? String(this.info.wid._serialized).replace('@c.us', '') : undefined;
    console.log('Me:', this.id);
    this.on('ready', () => {
      this.ready();
    });

    this.on('disconnected', () => {
      this.disconnected();
    });

    this.on('message', async () => {
      await this.getMessages();
    });
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getMessages() {
    const chats: Chat[] = await this.getChats();

    const messages = [];
    for (const chat of chats) {
      if (!chat.isGroup && !chat.isMuted && !chat.archived) {
        const msgs = await chat.fetchMessages({ limit: 100, fromMe: false });
        messages.push(msgs);
        await this.sleep(2000); // Espera 2 segundos antes de la próxima solicitud
        console.log('EXTRACTING CHAT:', (chat.id._serialized as string).replace('@c.us', ''), 'MESSAGES:', msgs.length);
      }
    }
    console.log('Total Chats:', chats.length);

    const msgs: { [key: string]: any[] } = await messages.reduce(async (accPromise, result, index) => {
      const acc = await accPromise;
      if (result !== undefined) {
        const chatId = String(chats[index].id._serialized).replace('@c.us', '');

        const processedMessages = await Promise.all(
          result.map(async (msg: Message) => {
            return {
              id: msg.id.id,
              body: msg.body,
              type: msg.type,
              from: msg.from,
              timestamp: msg.timestamp,
            };
          })
        );

        acc[chatId] = processedMessages;
      }
      return acc;
    }, Promise.resolve({} as { [key: string]: any[] }));

    fs.writeFileSync('C:\\Users\\Augus\\Projects\\chat-extractor\\database\\messages.json', JSON.stringify(msgs));

    const dataString = `const data = ${JSON.stringify(msgs, null, 2)};`;
    fs.writeFileSync('C:\\Users\\Augus\\Projects\\chat-extractor\\src\\public\\data.js', dataString);
  }

  private async ready() {
    this.status = 'READY';
    try {
      await prisma.whatsapp.update({
        where: {
          id: this.id,
        },
        data: {
          status: this.status,
          name: this.id,
          phone: this.me || '',
        },
      });
      console.log('=== CHAT-EXTRACTOR IS STARTING ===');
      //openUrl(`${API_URL}:${API_PORT}`);
    } catch (error) {
      console.log('READY', error);
    }

    await this.getMessages();
  }

  private async disconnected() {
    this.status = 'DISCONNECTED';
    try {
      await prisma.whatsapp.update({
        where: {
          id: this.id,
        },
        data: {
          status: this.status,
        },
      });
    } catch (error) {
      console.log('DISCONNECTED', error);
    }
  }

  public async init() {
    this.status = 'INITIALIZING';
    try {
      await prisma.whatsapp.upsert({
        where: {
          id: this.id,
        },
        update: {
          status: this.status,
        },
        create: {
          id: this.id as string,
          status: this.status,
        },
      });
    } catch (error) {
      this.status = 'INITIALIZING_ERROR';
      console.log('INITIALIZING', error);
    }
    await this.initialize();
    this.status = 'INITIALIZED';
    return this.status;
  }

  public async qrCode() {
    this.on('qr', async (qr: string) => {
      this.status = 'QR_SENT';
      const qrEncode = encodeURIComponent(qr);
      const url = `https://quickchart.io/qr?size=350&text=${qrEncode}`;

      console.log('=====================================================');
      console.log('Go to => ');
      console.log(url);
      console.log('and scan the QR code with a phone');
      console.log('=====================================================');
    });
  }
}
