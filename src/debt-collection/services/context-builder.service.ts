import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface DebtCallContext {
  debtor: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  debt: {
    amount: number;
    currency: string;
    contractNumber: string;
    dueDate: string;
    daysOverdue: number;
    productService: string;
  };
  organization: {
    id: number;
    name: string;
  };
  callId: string;
  roomName: string;
  timestamp: string;
}

@Injectable()
export class ContextBuilderService {
  constructor(private prisma: PrismaService) {}

  async buildContext(
    debtorId: string,
    campaignId: string,
    roomName: string,
    assignmentId: string,
  ): Promise<DebtCallContext> {
    // Fetch debtor with organization
    const debtor = await this.prisma.debtor.findUnique({
      where: { id: debtorId },
      include: {
        organization: true,
      },
    });

    if (!debtor) {
      throw new Error('Qarzdor topilmadi');
    }

    const context: DebtCallContext = {
      debtor: {
        id: debtor.id,
        firstName: debtor.firstName,
        lastName: debtor.lastName,
        phone: debtor.phone,
      },
      debt: {
        amount: debtor.debtAmount,
        currency: debtor.currency,
        contractNumber: debtor.contractNumber,
        dueDate: debtor.dueDate.toISOString().split('T')[0],
        daysOverdue: debtor.daysOverdue,
        productService: debtor.productService,
      },
      organization: {
        id: debtor.organization.id,
        name: debtor.organization.name,
      },
      callId: assignmentId,
      roomName: roomName,
      timestamp: new Date().toISOString(),
    };

    // Store context in campaign debtor assignment
    await this.prisma.debtCampaignDebtor.update({
      where: { id: assignmentId },
      data: { callContext: context as any },
    });

    return context;
  }

  async getContextByRoomName(roomName: string): Promise<DebtCallContext | null> {
    const assignment = await this.prisma.debtCampaignDebtor.findUnique({
      where: { liveKitRoomName: roomName },
    });

    if (!assignment || !assignment.callContext) {
      return null;
    }

    return assignment.callContext as unknown as DebtCallContext;
  }

  async getContextByPhoneNumber(phone: string): Promise<DebtCallContext | null> {
    // Remove all non-digit characters for matching
    const phoneDigits = phone.replace(/\D/g, '');

    // Find debtor by phone number
    const debtor = await this.prisma.debtor.findFirst({
      where: {
        phone: {
          contains: phoneDigits,
        },
      },
    });

    if (!debtor) {
      return null;
    }

    // Find the most recent active debt assignment for this debtor
    const assignment = await this.prisma.debtCampaignDebtor.findFirst({
      where: {
        debtorId: debtor.id,
        callStatus: {
          in: ['PENDING', 'FAILED'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        campaign: true,
      },
    });

    if (!assignment) {
      return null;
    }

    // Build context dynamically for this inbound call
    const roomName = `inbound-${phoneDigits}-${Date.now()}`;
    const context = await this.buildContext(
      debtor.id,
      assignment.campaignId,
      roomName,
      assignment.id,
    );

    // Store the context back to the assignment for tracking
    await this.prisma.debtCampaignDebtor.update({
      where: { id: assignment.id },
      data: {
        liveKitRoomName: roomName,
        callContext: context as any,
        callStatus: 'CALLING',
      },
    });

    return context;
  }
}
