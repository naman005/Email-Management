import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { EmailController } from './modules/email/email.controller';
import { ImapService } from './services/imap.service';
import { AnalyticsService } from './services/analytics.service';
import { SearchService } from './services/search.service';

import { Email, EmailSchema } from './schemas/email.schema';
import { Account, AccountSchema } from './schemas/account.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI!,),
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
      { name: Account.name, schema: AccountSchema }
    ]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [EmailController],
  providers: [ImapService, AnalyticsService, SearchService],
})
export class AppModule {}
