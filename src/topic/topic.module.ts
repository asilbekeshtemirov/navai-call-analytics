import { Module } from '@nestjs/common';
import { TopicService } from './topic.service.js';
import { TopicController } from './topic.controller.js';

@Module({
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
