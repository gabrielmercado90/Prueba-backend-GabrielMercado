
const { PrismaClient } = require("@prisma/client")


const prisma = new PrismaClient()

async function createProduct() {
    const allUsers = await prisma.productos.create({
        data:{
          valor: 1000000000,
          name:  'pollo',
        }
      })
    
      console.log(allUsers)


}

createProduct()
  .catch(e => {
    throw e
  })
  // 5
  .finally(async () => {
    await prisma.$disconnect()
  })