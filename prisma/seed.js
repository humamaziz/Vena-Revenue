// One-time / re-runnable seed script for the 5-person team + admin.
//
// Run with:  npm run db:seed
// (also runs automatically after `npx prisma migrate dev` thanks to the
// "prisma.seed" entry in package.json)
//
// Passwords: for each user below, the script first looks for an env var
// override (e.g. SEED_PASSWORD_ANSH). If none is set, it generates a random
// 16-character temporary password and prints it ONCE to the console. Nothing
// is ever written to disk or committed — copy the printed passwords
// somewhere safe immediately and have each person change it after first
// login (see /api/auth/change-password).
//
// Re-running this script is safe: existing users are left untouched (their
// password is NOT reset) unless you pass --reset-passwords.

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const prisma = new PrismaClient()

function randomPassword() {
  return crypto.randomBytes(12).toString('base64url') // ~16 chars, URL-safe
}

const TEAM = [
  { envKey: 'ANSH', name: 'Ansh Swami', email: 'ansh@vena-revenue.com', role: 'ADMIN' },
  { envKey: 'SANCHITA', name: 'Sanchita', email: 'sanchita@vena-revenue.com', role: 'DATA_MANAGER' },
  { envKey: 'AAMAAN', name: 'Aamaan', email: 'aamaan@vena-revenue.com', role: 'LEAD_GEN' },
  { envKey: 'ANANYA', name: 'Ananya', email: 'ananya@vena-revenue.com', role: 'VIDEO_CREATOR' },
  { envKey: 'HUMAM', name: 'Humam', email: 'humam@vena-revenue.com', role: 'PPT_CREATOR' },
]

async function main() {
  const resetPasswords = process.argv.includes('--reset-passwords')
  const created = []

  for (const member of TEAM) {
    const existing = await prisma.user.findUnique({ where: { email: member.email } })

    if (existing && !resetPasswords) {
      console.log(`= skip  ${member.email} (already exists, role=${existing.role})`)
      continue
    }

    const plainPassword = process.env[`SEED_PASSWORD_${member.envKey}`] || randomPassword()
    const passwordHash = await bcrypt.hash(plainPassword, 12)

    if (existing) {
      await prisma.user.update({ where: { email: member.email }, data: { passwordHash, role: member.role, name: member.name, active: true } })
      console.log(`~ reset ${member.email} (role=${member.role})`)
    } else {
      await prisma.user.create({
        data: { name: member.name, email: member.email, role: member.role, passwordHash },
      })
      console.log(`+ create ${member.email} (role=${member.role})`)
    }

    created.push({ email: member.email, role: member.role, password: plainPassword })
  }

  if (created.length === 0) {
    console.log('\nNo new credentials generated. Pass --reset-passwords to rotate existing users.')
    return
  }

  console.log('\n================ SAVE THESE NOW — SHOWN ONLY ONCE ================')
  for (const u of created) {
    console.log(`${u.email.padEnd(30)} role=${u.role.padEnd(14)} password=${u.password}`)
  }
  console.log('=====================================================================')
  console.log('Update each email to your real company domain before sharing logins.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })