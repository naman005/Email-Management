import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from '../schemas/email.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
  ) {
    // Create text indexes
    this.createTextIndexes();
  }

  private async createTextIndexes() {
    try {
      await this.emailModel.collection.createIndex({
        subject: 'text',
        body: 'text',
        from: 'text',
        'to': 'text'
      });
    } catch (error) {
      console.error('Failed to create text indexes:', error);
    }
  }

  async searchEmails(query: string, accountId?: string, options: any = {}): Promise<EmailDocument[]> {
    const searchCriteria: any = {
      $text: { $search: query }
    };

    if (accountId) {
      searchCriteria.accountId = accountId;
    }

    return this.emailModel
      .find(searchCriteria, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(options.limit || 50)
      .skip(options.skip || 0)
      .exec();
  }

  async advancedSearch(criteria: {
    from?: string;
    to?: string;
    subject?: string;
    body?: string;
    dateFrom?: Date;
    dateTo?: Date;
    hasAttachment?: boolean;
    accountId?: string;
  }): Promise<EmailDocument[]> {
    const query: any = {};

    if (criteria.accountId) query.accountId = criteria.accountId;
    if (criteria.from) query.from = { $regex: criteria.from, $options: 'i' };
    if (criteria.to) query.to = { $elemMatch: { $regex: criteria.to, $options: 'i' } };
    if (criteria.subject) query.subject = { $regex: criteria.subject, $options: 'i' };
    if (criteria.body) query.body = { $regex: criteria.body, $options: 'i' };
    
    if (criteria.dateFrom || criteria.dateTo) {
      query.sentDate = {};
      if (criteria.dateFrom) query.sentDate.$gte = criteria.dateFrom;
      if (criteria.dateTo) query.sentDate.$lte = criteria.dateTo;
    }

    return this.emailModel.find(query).sort({ sentDate: -1 }).exec();
  }
}
