import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase database connection...')

    // 测试数据库连接
    await prisma.$connect()
    console.log('✅ Database connected successfully!')

    // 执行一个简单的查询
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`
    console.log('✅ Query executed:', result)

    console.log('\n✅ All tests passed! Your Supabase database is configured correctly.')
  } catch (error) {
    console.error('❌ Database connection failed:')
    if (error instanceof Error) {
      console.error('Error message:', error.message)

      // 提供更详细的错误说明
      if (error.message.includes("Can't reach database server")) {
        console.error('\n📋 Troubleshooting steps:')
        console.error('1. Check if your Supabase project is active')
        console.error('2. Verify the DATABASE_URL in your .env file')
        console.error('3. Ensure you are using the connection string with the correct password')
        console.error('4. Check if your network/firewall allows connections to Supabase')
        console.error('5. Try using the "Transaction" pooler URL instead of "Session" pooler')
      }
    } else {
      console.error(error)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
