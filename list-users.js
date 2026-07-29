const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.user.findMany({ select: { account: true, name: true, createdAt: true } }).then(users => {
  users.forEach(u => console.log(u.account, "|", u.name, "|", u.createdAt));
  p.$disconnect();
});
