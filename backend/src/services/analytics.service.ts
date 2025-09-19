import { Injectable, Logger } from '@nestjs/common';
import * as dns from 'dns';
import * as net from 'net';
import * as tls from 'tls';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  
  private espPatterns = new Map([
    ['gmail.com', 'Gmail'],
    ['outlook.com', 'Outlook'],
    ['yahoo.com', 'Yahoo'],
    ['amazonses.com', 'Amazon SES'],
    ['mailgun.org', 'Mailgun'],
    ['sendgrid.net', 'SendGrid'],
    ['mandrill.com', 'Mandrill'],
    ['sparkpost.com', 'SparkPost'],
  ]);

  async identifyESP(domain: string): Promise<string> {
    try {
      // Check direct domain match
      for (const [pattern, esp] of this.espPatterns.entries()) {
        if (domain.includes(pattern)) {
          return esp;
        }
      }

      // Check MX records for ESP identification
      const mxRecords = await this.getMXRecords(domain);
      for (const mx of mxRecords) {
        for (const [pattern, esp] of this.espPatterns.entries()) {
          if (mx.exchange.includes(pattern)) {
            return esp;
          }
        }
      }

      return 'Unknown';
    } catch (error: any) {
      this.logger.error(`Failed to identify ESP for ${domain}: ${error.message}`);
      return 'Unknown';
    }
  }

  private getMXRecords(domain: string): Promise<dns.MxRecord[]> {
    return new Promise((resolve, reject) => {
      dns.resolveMx(domain, (err, records) => {
        if (err) reject(err);
        else resolve(records || []);
      });
    });
  }

  async analyzeMailServer(headers: any): Promise<any> {
    try {
      const receivedHeaders = headers.received || [];
      const lastReceived = Array.isArray(receivedHeaders) ? 
        receivedHeaders[receivedHeaders.length - 1] : receivedHeaders;

      const serverMatch = lastReceived?.match(/from\s+([^\s]+)/);
      const server = serverMatch ? serverMatch[1] : 'unknown';

      const [isOpenRelay, tlsInfo] = await Promise.all([
        this.checkOpenRelay(server),
        this.checkTLSSupport(server)
      ]);

      return {
        server,
        isOpenRelay,
        supportsTLS: tlsInfo.supportsTLS,
        hasValidCert: tlsInfo.hasValidCert,
      };
    } catch (error: any) {
      this.logger.error(`Failed to analyze mail server: ${error.message}`);
      return {
        server: 'unknown',
        isOpenRelay: false,
        supportsTLS: false,
        hasValidCert: false,
      };
    }
  }

  private async checkOpenRelay(server: string): Promise<boolean> {
    try {
      // Simplified open relay check - connect to port 25 and test
      return new Promise((resolve) => {
        const socket = net.createConnection(25, server);
        let isOpen = false;

        socket.setTimeout(5000);
        
        socket.on('connect', () => {
          socket.write('HELO test\r\n');
        });

        socket.on('data', (data) => {
          const response = data.toString();
          if (response.includes('250')) {
            socket.write('MAIL FROM:<test@example.com>\r\n');
          }
          if (response.includes('250 OK') && !isOpen) {
            isOpen = true;
            socket.end();
          }
        });

        socket.on('error', () => resolve(false));
        socket.on('timeout', () => {
          socket.destroy();
          resolve(false);
        });
        socket.on('close', () => resolve(isOpen));
      });
    } catch {
      return false;
    }
  }

  private async checkTLSSupport(server: string): Promise<{supportsTLS: boolean, hasValidCert: boolean}> {
    try {
      return new Promise((resolve) => {
        const socket = tls.connect(587, server, {
          rejectUnauthorized: false,
          timeout: 5000
        });

        socket.on('secureConnect', () => {
          const hasValidCert = socket.authorized;
          socket.end();
          resolve({ supportsTLS: true, hasValidCert });
        });

        socket.on('error', () => {
          resolve({ supportsTLS: false, hasValidCert: false });
        });

        socket.on('timeout', () => {
          socket.destroy();
          resolve({ supportsTLS: false, hasValidCert: false });
        });
      });
    } catch {
      return { supportsTLS: false, hasValidCert: false };
    }
  }
}
