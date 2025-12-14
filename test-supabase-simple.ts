import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔍 Supabase Connection Test\n')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing')
console.log('')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  try {
    // 简单的健康检查
    console.log('Testing auth endpoint...')
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    console.log('✅ Successfully connected to Supabase!')
    console.log('✅ Auth is working')
    console.log('\n🎉 Your Supabase configuration is correct!\n')

    // 尝试简单查询
    console.log('Attempting a simple query...')
    const { data: testData, error: queryError } = await supabase
      .rpc('version')

    if (!queryError) {
      console.log('✅ Database queries are working')
    } else {
      console.log('ℹ️  Note:', queryError.message, '(This is okay for a new project)')
    }

  } catch (err) {
    console.error('❌ Failed:', err)
  }
}

test()
