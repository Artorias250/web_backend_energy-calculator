import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { readFileSync, readdirSync } from 'fs';
import hbs = require('hbs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.set('view cache', false);

  // Явная регистрация partials с диска при каждом старте
  const partialsDir = join(__dirname, '..', 'views', 'partials');
  for (const file of readdirSync(partialsDir)) {
    if (!file.endsWith('.hbs')) continue;
    const name = file.replace(/\.hbs$/, '');
    hbs.registerPartial(name, readFileSync(join(partialsDir, file), 'utf8'));
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
