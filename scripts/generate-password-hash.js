// 生成 bcrypt 密码哈希的脚本
// 运行: node scripts/generate-password-hash.js

import bcrypt from 'bcryptjs';

const password = 'admin123';
const saltRounds = 10;

const hash = await bcrypt.hash(password, saltRounds);

console.log('密码:', password);
console.log('Bcrypt 哈希:', hash);
console.log('\n将此哈希复制到 create-default-user.sql 文件的第 21 行');
