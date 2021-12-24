
const { PrismaClient } = require("@prisma/client")
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const prisma = new PrismaClient()

//se crea el cliente
async function createClient(nombre, correo, balance) {
  const allUsers = await prisma.cliente.create({
    data: {
      balance: parseFloat(balance),
      email: correo,
      name: nombre,
    }
  })

  console.log(allUsers)


}
//se lee que el cliente si se haya creado satisfactoriamente
async function readCliente(correo) {

  return await prisma.cliente.findFirst({
    where: {
      email: correo
    }
  })
}
//se actualiza el saldo del cliente
async function updateClienteSaldo(id, saldo) {
  return await prisma.cliente.update({
    where: {
      email: id
    }, data: {
      balance: saldo
    }
  })
}

// se crea una orden de un producto x y se descuenta del saldo del cliente
async function createOrder(email, idP) {
  //se crea la data del usuario y el producto que desea comprar

  const product = await prisma.productos.findUnique({
    where: {
      id: parseInt(idP)
    }
  })
  let cliente = await readCliente(email)
  if (cliente.balance >= product.valor) {
    let nuevoSaldo = cliente.balance - product.valor
    await updateClienteSaldo(email, nuevoSaldo);
    await prisma.compra.create({
      data: {
        idcliente: cliente.id,
        idproducto: parseInt(idP)
      }
    })

    console.log('orden creada tu nuevo saldo es: $' + nuevoSaldo)
  } else {
    console.log('saldo insuficiente el producto cuesta: $' + product.valor + ' y cuentas con: $' + cliente.balance)
  }

}

async function Recargas(email, valor) {
  let client = await readCliente(email)

  let saldo = client.balance + parseFloat(valor)
  await updateClienteSaldo(email, saldo)
  console.log('tu nuevo saldo es de: $' + saldo)
}

async function trasnferencia(idEmisor, idReceptor, transfer) {
  let balanceEmisor = await readCliente(idEmisor)
  let balanceReceptor = await readCliente(idReceptor)
  if (balanceEmisor.balance > transfer) {
    let saldoEmisor = balanceEmisor.balance - transfer
    let saldoReceptor = balanceReceptor.balance + transfer
    await updateClienteSaldo(idEmisor, saldoEmisor)
    await updateClienteSaldo(idReceptor, saldoReceptor)
    console.log('transferencia exitosa')
  }
  else {
    console.log('transferencia denegada, saldo insuficiente')
  }

}

function menuPrinter() {

  console.log(" ");
  console.log("MyApp Gabriel Andrés Mercado");
  console.log("===========================");
  console.log(" ");
  console.log("seleccione una opción:");
  console.log(" ");
  console.log("  1.- crear un usuario.");
  console.log("  2.- crear una orden de compra.");
  console.log("  3.- Recargar Saldo");
  console.log("  4.- Transferir Dinero");

  readline.question('escoge una opción ', key => {
    //crear Cliente
    if (key == 1) {
      let nombre;
      let correo;
      let balance;
      readline.question('ingresa tu nombre ', name => {
        nombre = name
        readline.question('ingresa tu correo ', icorreo => {
          correo = icorreo
          readline.question('ingresa tu balance inicial en números ', async ibalance => {
            balance = ibalance
            await createClient(nombre, correo, balance)

            menuPrinter()
          })
        })

      })




    }
    //crear orden de compra
    if (key == 2) {
      let correo;

      readline.question('ingresa tu correo ', async email => {
        correo = email
        let b = false
        let cliente = await readCliente(correo)
        if (cliente) {
          let productos = await prisma.productos.findMany()
          for (prod of productos) {
            console.log(prod.id + '---' + prod.name + ' tiene un valor de: $' + prod.valor)
          }
          console.log('para terminar de comprar unde x')

              readline.question('escoge el id de un producto ', async produ => {
                await createOrder(cliente.email, produ)
                menuPrinter()
              })
         

          

        } else {
          console.log('usuario no registrado intentalo de nuevo')
          menuPrinter()
        }
      })

    }
    //Recargas de saldo
    if (key == 3) {
      let correo;
      let recarga;
      readline.question('ingresa tu correo ', async email => {
        correo = email
        let cliente = await readCliente(correo)
        if (cliente) {
          readline.question('ingresa el valor a recargar ', async valor => {
            recarga = valor;
            await Recargas(correo, recarga)
            menuPrinter()
          })

        } else {
          console.log('usuario no encontrado intentalo de nuevo')
          menuPrinter()
        }
      })
    }
    if (key == 4) {
      let correo;

      readline.question('ingresa tu correo ', async email => {
        correo = email
        let cliente = await readCliente(correo)
        if (cliente) {
          readline.question('ingresa el monto a transferir ', async valor => {
            readline.question('ingresa el correo de a quién deseas transferir ', async emailR => {
              let receptor = await readCliente(emailR)
              if (receptor) {
                await trasnferencia(cliente.email, receptor.email, parseFloat(valor))
              } else {
                console.log('usuario destino encontrado intentalo de nuevo')
                menuPrinter()
              }
              menuPrinter()
            })
          })
        } else {
          console.log('usuario no encontrado intentalo de nuevo')
          menuPrinter()
        }
      })
    }
  })


}


menuPrinter()
