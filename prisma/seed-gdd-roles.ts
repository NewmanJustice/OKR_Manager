import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "Senior delivery manager" },
    { name: "Senior developer - management" },
    { name: "Senior product manager" }
  ];

  for (const role of roles) {
    await prisma.gddRole.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log("GDD roles seeded!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());