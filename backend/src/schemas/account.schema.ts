import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema()
export class Account {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  imapHost!: string;

  @Prop({ required: true })
  imapPort!: number;

  @Prop({ required: true })
  username!: string;

  @Prop({ required: true })
  password!: string; // Should be encrypted in production

  @Prop({ default: 'PLAIN' })
  authMethod!: 'PLAIN' | 'LOGIN' | 'OAUTH2';

  @Prop()
  oauthToken?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: new Date() })
  lastSync!: Date;

  @Prop([String])
  folders!: string[];

  @Prop({ default: false })
  isConnected!: boolean;
}


export const AccountSchema = SchemaFactory.createForClass(Account);
