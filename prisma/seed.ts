import 'dotenv/config'
import ws from 'ws'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

// Necesario en Node.js local — Neon usa WebSockets
neonConfig.webSocketConstructor = ws

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('jt2604V', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'jtoncelviloria@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'jtoncelviloria@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin creado:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
