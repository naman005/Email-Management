import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailDocument = Email & Document;

@Schema({ timestamps: true })
export class Email {
  @Prop({ required: true })
  messageId!: string;

  @Prop({ required: true })
  accountId!: string;

  @Prop({ required: true })
  folder!: string;

  @Prop({ required: true })
  from!: string;

  @Prop([String])
  to!: string[];

  @Prop([String])
  cc!: string[];

  @Prop([String])
  bcc!: string[];

  @Prop({ required: true })
  subject!: string;

  @Prop({ type: Date, required: true })
  sentDate!: Date;

  @Prop({ type: Date, required: true })
  receivedDate!: Date;

  @Prop({ required: true })
  body!: string;

  @Prop({ type: Object })
  headers!: Record<string, any>;

  @Prop({
    type: {
      read: Boolean,
      answered: Boolean,
      flagged: Boolean,
      deleted: Boolean,
      draft: Boolean
    }
  })
  flags!: {
    read: boolean;
    answered: boolean;
    flagged: boolean;
    deleted: boolean;
    draft: boolean;
  };

  @Prop({ type: Object })
  analytics!: {
    senderDomain: string;
    esp: string;
    timeDelta: number; // milliseconds between sent and received
    mailServerInfo: {
      server: string;
      isOpenRelay: boolean;
      supportsTLS: boolean;
      hasValidCert: boolean;
    };
  };

  @Prop({ default: false })
  processed!: boolean;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
