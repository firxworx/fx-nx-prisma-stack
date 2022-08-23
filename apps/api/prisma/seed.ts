import { Prisma, PrismaClient } from '../src/generated/prisma-client' // import from custom output path (@see schema.prisma)
import { hash } from 'argon2'

const INSECURE_SHARED_DEV_PASSWORD = 'passpass123'

const prisma = new PrismaClient()

const userData: Omit<Prisma.UserCreateInput, 'password'>[] = [
  {
    name: 'Alice',
    email: 'alice@example.com',
    profile: {
      create: {
        locale: 'en-US',
        tz: '',
      },
    },
  },
  {
    name: 'Bob',
    email: 'bob@example.com',
    profile: {
      create: {
        locale: 'en-US',
        tz: '',
      },
    },
  },
  {
    name: 'Izzy',
    email: 'izzy@example.com',
    profile: {
      create: {
        locale: 'en-US',
        tz: '',
      },
    },
  },
]

async function main() {
  console.log(`Start seeding ...`)

  const password = await hash(INSECURE_SHARED_DEV_PASSWORD)

  await prisma.user.deleteMany()
  console.log('Deleted records in user table')

  // ALTER SEQUENCE User_id_seq RESTART WITH 1;
  // console.log('reset user auto increment to 1')

  for (const item of userData) {
    const user = await prisma.user.create({
      data: {
        ...item,
        password,
      },
    })
    console.log(`Created user ${user.email} with id: ${user.id}`)
  }

  console.log(`Seeding complete.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
