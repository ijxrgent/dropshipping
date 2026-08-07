import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required')
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin creado:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
