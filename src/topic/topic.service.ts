import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto.js';
import { UpdateTopicDto } from './dto/update-topic.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TopicService {
  constructor(private prisma: PrismaService) {}

  create(createTopicDto: CreateTopicDto) {
    return this.prisma.topic.create({ data: createTopicDto });
  }

  findAll() {
    return this.prisma.topic.findMany();
  }

  findOne(id: string) {
    return this.prisma.topic.findUnique({ where: { id } });
  }

  update(id: string, updateTopicDto: UpdateTopicDto) {
    return this.prisma.topic.update({
      where: { id },
      data: updateTopicDto,
    });
  }

  remove(id: string) {
    return this.prisma.topic.delete({ where: { id } });
  }
}
