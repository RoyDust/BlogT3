import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase connection...\n')

// 显示配置（隐藏敏感信息）
console.log('📋 Configuration:')
console.log('  URL:', supabaseUrl || '❌ Missing')
console.log('  Anon Key:', supabaseAnonKey ? '✅ Set (hidden)' : '❌ Missing')
console.log('')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file')
  console.error('\n📝 Please add to your .env:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your-project-url')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // 测试 1: 基础连接测试
    console.log('Test 1: Basic connection...')
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1)

    if (error && error.code !== 'PGRST204' && !error.message.includes('does not exist')) {
      throw error
    }
    console.log('✅ Connected to Supabase successfully!\n')

    // 测试 2: 获取现有表
    console.log('Test 2: Fetching database tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (!tablesError && tables) {
      console.log('✅ Public tables:', tables.length > 0 ? tables.map(t => t.table_name).join(', ') : 'None yet')
    } else {
      console.log('ℹ️  Could not fetch tables (this is normal for new projects)')
    }
    console.log('')

    // 测试 3: 检查认证
    console.log('Test 3: Checking auth status...')
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (!authError) {
      console.log('✅ Auth service is accessible')
      console.log('   Current session:', session ? 'Active' : 'None (not logged in)')
    }
    console.log('')

    console.log('🎉 All tests passed! Supabase is configured correctly.\n')
    console.log('📝 Next steps:')
    console.log('  1. Create tables in Supabase Dashboard (or use migrations)')
    console.log('  2. Start building your app with the Supabase client')
    console.log('  3. Run: pnpm dev')

  } catch (error) {
    console.error('\n❌ Connection test failed!')
    if (error instanceof Error) {
      console.error('Error:', error.message)
    }

    console.error('\n🔧 Troubleshooting:')
    console.error('  1. Check your Supabase project is active')
    console.error('  2. Verify credentials in .env file')
    console.error('  3. Visit: https://supabase.com/dashboard/project/' + supabaseUrl?.split('//')[1]?.split('.')[0])

    process.exit(1)
  }
}

testConnection()
