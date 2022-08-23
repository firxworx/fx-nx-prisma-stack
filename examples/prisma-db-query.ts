// import from standard prisma client path (generate the client first - refer to docs + README)
import { PrismaClient } from '@prisma/client'

// example of importing from a custom output path (as would be defined in schema.prism)
// import { PrismaClient } from './apps/api/src/generated/prisma-client'

/**
 * Connect to a database using prisma, execute a select query, output the results,
 * and disconnect. May be executed via ts-node or compiled to js and executed via node.
 *
 * Script examples are independent of the nx monorepo.
 */
const main = async () => {
  const prisma = new PrismaClient()

  console.log('connecting to database...')
  await prisma.$connect()

  console.log('executing query...')
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: 'user@example.com',
    },
  })

  console.log('query output...', JSON.stringify(user, null, 2))

  console.log('disconnecting...')
  prisma.$disconnect()
}

main()
  .then(() => console.log('query complete'))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
