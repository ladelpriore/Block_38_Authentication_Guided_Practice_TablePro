const bcrypt = require("bcrypt");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient().$extends({
  model: {
    customer: {
      // TODO: Add register and login methods
      
      //Creates a new customer with the provided credentials.The password is hashed with bcrypt before the customer is saved.
      async register(email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const customer = await prisma.customer.create({
          data: { email, password: hashedPassword },
        });
        return customer;
      },
      
      //Finds the customer with the provided email, as long as the provided password matches what's saved in the database.
      async login(email, password) {
        const customer = await prisma.customer.findUniqueOrThrow({
          where: { email },
        });
        const valid = await bcrypt.compare(password, customer.password);
        if (!valid) throw Error("Invalid password");
        return customer;
      },



    },
  },
});

module.exports = prisma;
