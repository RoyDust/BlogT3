const { PrismaClient } = require('./generated/prisma')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase database connection...')
    console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'))

    // 测试连接
    await prisma.$connect()
    console.log('✅ Connected to database successfully!')

    // 执行简单查询
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`
    console.log('✅ Query result:', result)

    // 检查表是否存在
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `
    console.log('📋 Existing tables:', tables)

    console.log('\n✅ All tests passed! Your Supabase database is working correctly.')
  } catch (error) {
    console.error('\n❌ Database connection failed!')
    console.error('Error:', error.message)

    if (error.message.includes("Can't reach database server")) {
      console.error('\n📋 Possible issues:')
      console.error('  1. Supabase project might be paused (check dashboard)')
      console.error('  2. Incorrect DATABASE_URL (check .env file)')
      console.error('  3. Network/Firewall blocking connection')
      console.error('  4. Wrong password in connection string')
      console.error('\n💡 Try:')
      console.error('  - Visit your Supabase dashboard and ensure project is active')
      console.error('  - Use "Transaction" pooler instead of "Session" pooler')
      console.error('  - Check if port 5432 is accessible')
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
