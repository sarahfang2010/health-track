const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
Promise.all([
  p.user.count(),
  p.foodEntry.count(),
  p.healthReport.count(),
  p.exerciseEntry.count(),
]).then(([u, f, h, e]) => {
  console.log("注册用户:", u);
  console.log("饮食记录:", f);
  console.log("体检报告:", h);
  console.log("运动记录:", e);
  p.$disconnect();
});
