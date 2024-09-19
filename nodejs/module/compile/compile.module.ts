import { Module } from '@nestjs/common';
// import CompileService from './compile.service';
import CompileController from './compile.controller';

@Module({
  imports: [],
  controllers: [CompileController],
  providers: [],
  exports: [],
})
export default class ApplicationModule {}
