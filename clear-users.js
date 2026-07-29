const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
Promise.all([
  p.exerciseEntry.deleteMany(),
  p.foodEntry.deleteMany(),
  p.dailySummary.deleteMany(),
  p.healthReport.deleteMany(),
  p.user.deleteMany(),
]).then(() => {
  console.log("所有用户已清除");
  p.$disconnect();
}).catch(e => { console.error(e.message); p.$disconnect(); });
