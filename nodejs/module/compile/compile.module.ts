import { Module } from '@nestjs/common';
import CompileService from './compile.service';
import CompileController from './compile.controller';

@Module({
  imports: [],
  controllers: [CompileController],
  providers: [CompileService],
  exports: [],
})
export default class ApplicationModule {}
