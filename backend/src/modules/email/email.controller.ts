import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Param,
  Delete,
  BadRequestException 
} from '@nestjs/common';
import { ImapService } from '../../services/imap.service';
import { SearchService } from '../../services/search.service';
import { Account, AccountDocument } from '../../schemas/account.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Controller('api/emails')
export class EmailController {
  constructor(
    private readonly imapService: ImapService,
    private readonly searchService: SearchService,
    @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
  ) {}

  // -------------------- Account Management --------------------

  @Post('accounts')
  async addAccount(@Body() accountData: any) {
    const canConnect = await this.imapService.testConnection(accountData);
    if (!canConnect) {
      throw new BadRequestException('Invalid credentials or server unreachable');
    }

    const account = await this.accountModel.create(accountData);

    // Connect persistently
    await this.imapService.connectToAccount((account._id as Types.ObjectId).toString());

    return { account, connected: true };
  }

  @Get('accounts')
  async getAccounts() {
    return this.accountModel.find().exec();
  }

  @Delete('accounts/:id')
  async deleteAccount(@Param('id') id: string) {
    const account = await this.accountModel.findById(id);
    if (!account) {
      throw new BadRequestException(`Account ${id} not found`);
    }

    await this.imapService.disconnectAccount(id);
    await this.accountModel.findByIdAndDelete(id);

    return { success: true, message: `Account ${id} deleted` };
  }

  @Post('accounts/:id/sync')
  async syncAccount(@Param('id') accountId: string) {
    const account = await this.accountModel.findById(accountId);
    if (!account) throw new BadRequestException('Account not found');

    if (!account.isConnected) {
      await this.imapService.connectToAccount(accountId);
    }

    // Filter out invalid folder "[Gmail]"
    const validFolders = account.folders.filter(f => f !== '[Gmail]');

    for (const folder of validFolders) {
      await this.imapService.syncFolder(accountId, folder);
    }

    await this.accountModel.findByIdAndUpdate(accountId, { lastSync: new Date() });
    return { success: true };
  }

  @Get(':accountId/fetch')
  async fetchEmails(@Param('accountId') accountId: string) {
    return this.imapService.fetchMessages(accountId, 'INBOX');
  }



  // -------------------- Email Search --------------------

  @Get('search')
  async searchEmails(
    @Query('q') query: string,
    @Query('accountId') accountId?: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number
  ) {
    return this.searchService.searchEmails(query, accountId, { limit, skip });
  }

  @Post('search/advanced')
  async advancedSearch(@Body() criteria: any) {
    return this.searchService.advancedSearch(criteria);
  }
}



