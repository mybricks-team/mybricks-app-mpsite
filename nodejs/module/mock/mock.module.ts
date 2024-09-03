import { Module } from '@nestjs/common';
import MockService from './mock.service';
import MockController from './mock.controller';

@Module({
  imports: [],
  controllers: [MockController],
  providers: [MockService],
  exports: [],
})
export default class ApplicationModule {}
