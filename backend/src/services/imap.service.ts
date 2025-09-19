import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Imap from "imap";
import { simpleParser } from 'mailparser';
import { Account, AccountDocument } from '../schemas/account.schema';
import { Email, EmailDocument } from '../schemas/email.schema';
import { AnalyticsService } from './analytics.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ImapService {
  private connections = new Map<string, Imap>();
  private readonly logger = new Logger(ImapService.name);

  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
    private analyticsService: AnalyticsService,
    private eventEmitter: EventEmitter2,
  ) {}

  
   async getConnection(accountId: string): Promise<Imap | null> {
    if (this.connections.has(accountId)) {
      return this.connections.get(accountId)!;
    }

    // If not connected, establish new connection
    const success = await this.connectToAccount(accountId);
    if (success) {
      return this.connections.get(accountId)!;
    }

    return null;
  }
async connectToAccount(accountId: string): Promise<boolean> {
  try {
    const account = await this.accountModel.findById(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    const config = {
  host: account.imapHost,
  port: account.imapPort,
  tls: true,
  authTimeout: 3000,
  connTimeout: 10000,
  tlsOptions: { rejectUnauthorized: false },
  user: account.username,
  password: account.password,
  autotls: 'always',
  authMethod: account.authMethod // 'PLAIN' | 'LOGIN' | 'XOAUTH2'
};

    const imap = new Imap(config);

    return new Promise((resolve, reject) => {
      imap.once('ready', async () => {
        this.logger.log(`Connected to ${account.email}`);
        this.connections.set(accountId, imap);

        await this.accountModel.findByIdAndUpdate(accountId, { isConnected: true });
        this.eventEmitter.emit('accountStatus', { accountId, isConnected: true });

        const folders = await this.getFolders(imap);
        await this.accountModel.findByIdAndUpdate(accountId, { folders });

        const validFolders = folders.filter(
  (f) => f !== '[Gmail]'
);

        for (const folder of validFolders) {
    try {
      await this.syncFolder(accountId, folder);
    } catch (err: any) {
      this.logger.error(`Failed to sync folder ${folder}: ${err.message}`);
    }
  }

        resolve(true);
      });

      imap.once('error', (err: any) => {
        this.logger.error(`IMAP connection error for ${account.email}: ${err.message}`);
        reject(err);
      });

      imap.once('end', async () => {
        this.logger.warn(`Connection ended for ${account.email}, reconnecting in 5s...`);
        this.connections.delete(accountId);

        await this.accountModel.findByIdAndUpdate(accountId, { isConnected: false });

        this.eventEmitter.emit('accountStatus', { accountId, isConnected: false });

        // Try reconnecting after 5s
        setTimeout(() => {
          this.connectToAccount(accountId).catch((err) =>
            this.logger.error(`Reconnection failed for ${account.email}: ${err.message}`),
          );
        }, 5000);
      });

      imap.connect();
    });
  } catch (error: any) {
    this.logger.error(`Failed to connect to account ${accountId}: ${error.message}`);
    return false;
  }
}

  private getFolders(imap: Imap): Promise<string[]> {
    return new Promise((resolve, reject) => {
      imap.getBoxes((err, boxes) => {
        if (err) reject(err);
        else {
          const folderNames = this.extractFolderNames(boxes);
          resolve(folderNames);
        }
      });
    });
  }

  private extractFolderNames(boxes: any, prefix = ''): string[] {
    const folders: string[] = [];
    
    for (const name in boxes) {
      const fullName = prefix ? `${prefix}/${name}` : name;
      folders.push(fullName);
      
      if (boxes[name].children) {
        folders.push(...this.extractFolderNames(boxes[name].children, fullName));
      }
    }
    
    return folders;
  }

// async syncFolder(
//   accountId: string,
//   folderName: string,
//   onProgress?: (progress: { accountId: string; folder: string; current: number; total: number }) => void,
//   onNewEmail?: (email: any) => void,
// ): Promise<void> {
//   const imap = this.connections.get(accountId);
//   if (!imap) {
//     throw new Error(`No active connection for account ${accountId}`);
//   }

//   return new Promise((resolve, reject) => {
//     imap.openBox(folderName, true, (err, box) => {
//       if (err) {
//         reject(new Error(`Failed to open folder ${folderName}: ${err.message}`));
//         return;
//       }

//       const results: any[] = [];
//       const f = imap.seq.fetch('1:*', {
//         bodies: '',
//         struct: true,
//       });

//       let total = box.messages.total || 0;
//       let processed = 0;

//       f.on('message', (msg, seqno) => {
//         const chunks: Buffer[] = [];
//         let attributes: any;

//         msg.on('body', (stream) => {
//           stream.on('data', (chunk) => chunks.push(chunk));
//         });

//         msg.once('attributes', (attrs) => {
//           attributes = attrs;
//         });

//         msg.once('end', async () => {
//           try {
//             const buffer = Buffer.concat(chunks);
//             const parsed = await simpleParser(buffer);

//             const emailDoc = await this.processEmailData(parsed, attributes, accountId, folderName);

//             // save to DB (upsert by messageId to avoid duplicates)
//             await this.emailModel.updateOne(
//               { messageId: emailDoc.messageId, accountId },
//               { $set: emailDoc },
//               { upsert: true },
//             );

//             if (onNewEmail) onNewEmail(emailDoc);

//             processed++;
//             if (onProgress) {
//               onProgress({ accountId, folder: folderName, current: processed, total });
//             }
//           } catch (e: any) {
//             this.logger.error(`Failed to process message in ${folderName}: ${e.message}`);
//           }
//         });
//       });

//       f.once('error', (err) => reject(err));
//       f.once('end', () => {
//         this.logger.log(`Finished syncing ${folderName} (${processed}/${total})`);
//         resolve();
//       });
//     });
//   });
// }

async syncFolder(
  accountId: string,
  folderName: string,
  onProgress?: (progress: { accountId: string; folder: string; current: number; total: number }) => void,
  onNewEmail?: (email: any) => void,
) {
  const imap = this.connections.get(accountId);
  if (!imap) throw new Error(`No active connection for account ${accountId}`);

  const openBox = () => new Promise<Imap.Box>((resolve, reject) => {
    imap.openBox(folderName, true, (err, box) => err ? reject(err) : resolve(box));
  });

  const box = await openBox();
  const total = box.messages.total || 0;
  const batchSize = 50; // fetch 50 emails at a time

  for (let start = 1; start <= total; start += batchSize) {
    const end = Math.min(start + batchSize - 1, total);
    await new Promise<void>((resolve, reject) => {
      const f = imap.seq.fetch(`${start}:${end}`, { bodies: '', struct: true });

      let processed = 0;

      f.on('message', (msg) => {
        const chunks: Buffer[] = [];
        let attributes: any;

        msg.on('body', (stream) => stream.on('data', (chunk) => chunks.push(chunk)));
        msg.once('attributes', (attrs) => (attributes = attrs));

        msg.once('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            const parsed = await simpleParser(buffer);

            const emailDoc = await this.processEmailData(parsed, attributes, accountId, folderName);

            await this.emailModel.updateOne(
              { messageId: emailDoc.messageId, accountId },
              { $set: emailDoc },
              { upsert: true },
            );

            if (onNewEmail) onNewEmail(emailDoc);

            processed++;
            if (onProgress) onProgress({ accountId, folder: folderName, current: processed, total });
          } catch (e: any) {
            this.logger.error(`Failed to process message in ${folderName}: ${e.message}`);
          }
        });
      });

      f.once('error', reject);
      f.once('end', () => resolve());
    });
  }

  this.logger.log(`Finished syncing ${folderName} (${total}/${total})`);
}

  async fetchMessages(accountId: string, folderName = 'INBOX'): Promise<any[]> {
  const imap = this.connections.get(accountId);
  if (!imap) {
    throw new Error(`No active connection for account ${accountId}`);
  }

  return new Promise((resolve, reject) => {
    imap.openBox(folderName, true, (err, box) => {
      if (err) return reject(err);

      const results: any[] = [];
      const f = imap.seq.fetch('1:*', {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
        struct: true,
      });

      f.on('message', (msg) => {
        const email: any = {};
        msg.on('body', (stream, info) => {
          let buffer = '';
          stream.on('data', (chunk) => (buffer += chunk.toString('utf8')));
          stream.on('end', () => {
            if (info.which.startsWith('HEADER')) {
              email.header = buffer;
            } else {
              email.body = buffer;
            }
          });
        });
        msg.once('attributes', (attrs) => {
          email.attrs = attrs;
        });
        msg.once('end', () => {
          results.push(email);
        });
      });

      f.once('error', (err) => reject(err));
      f.once('end', () => resolve(results));
    });
  });
}



  private async processEmailData(parsed: any, attributes: any, accountId: string, folder: string) {
    const timeDelta = parsed.date ? 
      new Date().getTime() - new Date(parsed.date).getTime() : 0;

    const senderDomain = this.extractDomain(parsed.from?.text || '');
    const esp = await this.analyticsService.identifyESP(senderDomain);
    const mailServerInfo = await this.analyticsService.analyzeMailServer(parsed.headers);

    return {
      messageId: parsed.messageId || `${Date.now()}-${Math.random()}`,
      accountId,
      folder,
      from: parsed.from?.text || '',
      to: parsed.to?.text ? [parsed.to.text] : [],
      cc: parsed.cc?.text ? [parsed.cc.text] : [],
      bcc: parsed.bcc?.text ? [parsed.bcc.text] : [],
      subject: parsed.subject || '',
      sentDate: parsed.date || new Date(),
      receivedDate: new Date(),
      body: parsed.text || parsed.html || '',
      headers: parsed.headers,
      flags: {
        read: attributes.flags?.includes('\\Seen') || false,
        answered: attributes.flags?.includes('\\Answered') || false,
        flagged: attributes.flags?.includes('\\Flagged') || false,
        deleted: attributes.flags?.includes('\\Deleted') || false,
        draft: attributes.flags?.includes('\\Draft') || false,
      },
      analytics: {
        senderDomain,
        esp,
        timeDelta,
        mailServerInfo,
      },
      processed: true,
    };
  }

  private extractDomain(email: string): string {
    const match = email.match(/@([^>]+)/);
    return match ? match[1].trim() : '';
  }

  async disconnectAccount(accountId: string): Promise<void> {
    const imap = this.connections.get(accountId);
    if (imap) {
      imap.end();
      this.connections.delete(accountId);
    }
    await this.accountModel.findByIdAndUpdate(accountId, { isConnected: false });
  }

 async testConnection(accountData: any): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    try {
      const config = {
        user: accountData.username,
        password: accountData.password,
        host: accountData.imapHost,
        port: accountData.imapPort,
        tls: true,
        authTimeout: 5000,
        connTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false }
      };

      const imap = new Imap(config);

      imap.once('ready', () => {
        imap.end();
        resolve(true); 
      });

      imap.once('error', () => {
        resolve(false); 
      });

      imap.once('end', () => {
       
      });

      imap.connect();
    } catch (err) {
      resolve(false); 
    }
  });
}




}
