export interface Account {
  _id: string;
  email: string;
  imapHost: string;
  imapPort: number;
  username: string;
  authMethod: 'PLAIN' | 'LOGIN' | 'OAUTH2';
  isActive: boolean;
  lastSync: Date;
  folders: string[];
  isConnected: boolean;
}

export interface Email {
  _id: string;
  messageId: string;
  accountId: string;
  folder: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  sentDate: Date;
  receivedDate: Date;
  body: string;
  flags: {
    read: boolean;
    answered: boolean;
    flagged: boolean;
    deleted: boolean;
    draft: boolean;
  };
  analytics: {
    senderDomain: string;
    esp: string;
    timeDelta: number;
    mailServerInfo: {
      server: string;
      isOpenRelay: boolean;
      supportsTLS: boolean;
      hasValidCert: boolean;
    };
  };
}

export interface SearchCriteria {
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  dateFrom?: Date;
  dateTo?: Date;
  accountId?: string;
}
// Toast Component
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}