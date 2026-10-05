"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const fs_1 = require("fs");
const hbs = require("hbs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    app.setBaseViewsDir((0, path_1.join)(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    app.set('view cache', false);
    const partialsDir = (0, path_1.join)(__dirname, '..', 'views', 'partials');
    for (const file of (0, fs_1.readdirSync)(partialsDir)) {
        if (!file.endsWith('.hbs'))
            continue;
        const name = file.replace(/\.hbs$/, '');
        hbs.registerPartial(name, (0, fs_1.readFileSync)((0, path_1.join)(partialsDir, file), 'utf8'));
    }
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map