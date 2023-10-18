const { PrismaClient } = require("@prisma/client");
const {
  products,
  brands,
  categories,
  users,
  productImages,
  status,
  sales,
} = require("./data");

const prisma = new PrismaClient();

async function main() {
  await prisma.brand.createMany({ data: brands });
  await prisma.status.createMany({ data: status });
  await prisma.category.createMany({ data: categories });
  await prisma.user.createMany({ data: users });
  await prisma.product.createMany({ data: products });
  await prisma.sales.createMany({ data: sales });
  await prisma.productImage.createMany({ data: productImages });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

//   npx prisma db seed
