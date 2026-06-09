// 📄 src/db.ts
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// 1. Point this directly to the root file to align with your prisma config!
const adapter = new PrismaLibSql({
  url: 'file:./venture_core.db', // ⚡ CHANGED: Removed the "prisma/" subfolder prefix
});

export const prisma = new PrismaClient({ adapter });