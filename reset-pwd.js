const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const p = new PrismaClient();
hash("123456", 10).then(h =>
  p.user.update({ where: { account: "18616996380" }, data: { password: h } })
).then(() => {
  console.log("密码已重置为 123456");
  p.$disconnect();
}).catch(e => {
  console.error(e.message);
  p.$disconnect();
});
