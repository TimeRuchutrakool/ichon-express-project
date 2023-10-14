const  PrismaClient  = require("@prisma/client");
const { products, brands, categories, users } = require("./data");


const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({ data: products });
  await prisma.brand.createMany({ data: brands });
  await prisma.category.createMany({ data: categories });
  await prisma.user.createMany({ data: users });
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

//   npx prisma db seed 
