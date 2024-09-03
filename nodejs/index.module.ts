import { Module } from '@nestjs/common';

// interceptor
import CompileModule from './module/compile/compile.module';
import MockModule from './module/mock/mock.module';

@Module({
	imports: [
		CompileModule,
		MockModule
	],
})
export default class IndexModule {}
