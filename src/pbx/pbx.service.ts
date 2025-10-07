import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { CallStatus } from '@prisma/client';

@Injectable()
export class PbxService {
  private readonly logger = new Logger(PbxService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  // History webhook - qo'ng'iroq tugagandan keyin
  async handleHistory(data: any) {
    try {
      const {
        callid,
        type, // in/out
        status, // Success/missed/Cancel/etc
        phone,
        user, // extCode
        start,
        duration,
        link, // audio fayl linki
        diversion,
        ext,
      } = data;

      // User ni topish
      const employee = await this.prisma.user.findFirst({
        where: {
          OR: [{ extCode: user }, { extCode: ext }],
        },
      });

      if (!employee) {
        this.logger.warn(`Employee not found for extCode: ${user || ext}`);
        return { status: 'error', message: 'Employee not found' };
      }

      // Call date ni parse qilish
      const callDate = new Date(start.replace('T', ' ').replace('Z', ''));

      // Qo'ng'iroqni database ga saqlash
      const call = await this.prisma.call.upsert({
        where: {
          organizationId_externalId: {
            organizationId: employee.organizationId,
            externalId: callid,
          },
        },
        update: {
          status: status === 'Success' ? CallStatus.UPLOADED : CallStatus.ERROR,
          durationSec: parseInt(duration) || 0,
          fileUrl: link || null,
        },
        create: {
          organizationId: employee.organizationId, // Multi-tenancy
          externalId: callid,
          callerNumber: type === 'in' ? phone : diversion,
          calleeNumber: type === 'in' ? diversion : phone,
          callDate,
          fileUrl: link || null,
          status: status === 'Success' ? CallStatus.UPLOADED : CallStatus.ERROR,
          durationSec: parseInt(duration) || 0,
          employeeId: employee.id,
        },
      });

      this.logger.log(`Call saved: ${call.id}`);

      // Agar muvaffaqiyatli qo'ng'iroq bo'lsa va audio fayl bor bo'lsa, AI processing ga yuborish
      if (status === 'Success' && link && parseInt(duration) > 10) {
        this.aiService.processCall(call.id);
        this.logger.log(`Call ${call.id} sent for AI processing`);
      }

      return { status: 'success', call_id: call.id };
    } catch (error) {
      this.logger.error('Error handling history webhook:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Event webhook - qo'ng'iroq jarayoni
  async handleEvent(data: any) {
    try {
      const {
        callid,
        type, // INCOMING/ACCEPTED/COMPLETED/etc
        phone,
        user,
        direction, // in/out
        ext,
      } = data;

      this.logger.log(`Call event: ${type} for call ${callid}`);

      // Bu yerda real-time events ni handle qilish mumkin
      // Masalan, websocket orqali frontend ga yuborish

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error handling event webhook:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Contact webhook - mijoz ma'lumotlarini so'rash
  async handleContact(data: any) {
    try {
      const { phone, callid } = data;

      // Bu yerda mijoz ma'lumotlarini database dan qidirish mumkin
      // Hozircha oddiy response qaytaramiz

      return {
        contact_name: `Client ${phone}`,
        responsible: 'admin', // yoki tegishli manager
      };
    } catch (error) {
      this.logger.error('Error handling contact webhook:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Rating webhook - mijoz bahosi
  async handleRating(data: any) {
    try {
      const { callid, rating, phone, user, ext } = data;

      // Call ni topish va rating ni saqlash
      const call = await this.prisma.call.findFirst({
        where: { externalId: callid },
      });

      if (call) {
        await this.prisma.call.update({
          where: { id: call.id },
          data: {
            analysis: {
              ...(call.analysis as any),
              customerRating: parseInt(rating),
            },
          },
        });

        this.logger.log(`Rating ${rating} saved for call ${callid}`);
      }

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error handling rating webhook:', error);
      return { status: 'error', message: error.message };
    }
  }
}
