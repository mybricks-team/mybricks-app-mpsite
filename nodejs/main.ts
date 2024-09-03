import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import bodyParser from 'body-parser';
import IndexModule from './index.module';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(IndexModule);

	app.enableCors();
	app.use(bodyParser.json({ limit: '100mb' }));

	await app.listen(3000);
}
bootstrap();