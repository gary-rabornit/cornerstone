import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.activity.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.clientAccess.deleteMany()
  await prisma.proposalApproval.deleteMany()
  await prisma.proposal.deleteMany()
  await prisma.contentAsset.deleteMany()
  await prisma.deal.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const hashedPassword = await hash('GaryIsAwesome12$$$', 12)

  await prisma.user.create({
    data: {
      name: 'Gary Raborn',
      email: 'gary@rabornmedia.com',
      hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Created admin user: gary@rabornmedia.com')
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
