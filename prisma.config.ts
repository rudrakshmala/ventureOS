// 📄 prisma.config.ts
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    provider: 'sqlite',
    url: 'file:./venture_core.db',
  },
});