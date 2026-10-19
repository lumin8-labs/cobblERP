import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      name: 'CobblERP API',
      status: 'online',
      timestamp: new Date().toISOString(),
      architecture: {
        monorepo: 'Turborepo',
        apps: ['Next.js (web)', 'React Native (mobile)', 'NestJS (api)'],
        orm: 'Drizzle ORM',
        database: 'Neon Serverless Postgres',
      },
    };
  }
}
