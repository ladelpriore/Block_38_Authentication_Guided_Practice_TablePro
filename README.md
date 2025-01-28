# Block 38, Authentication, Guided Practice: Table Pro
Introducing Table Pro, the successor to Table! Customers will now need to make an account and log in before they are able to make reservations for a table at a restaurant of their choice.


## Customer Accounts in Database

<figure>

![Visualized schema. The textual representation in DBML is linked below.](/docs/schema.svg)

<figcaption>

[textual representation of schema in DBML](/docs/schema.dbml)

</figcaption>
</figure>

1.  `npm install bcrypt`, which we will be using to hash customer passwords.
2.  In `prisma/index.js`, we will _extend_ the Prisma Client to [add some methods to our customer model](https://www.prisma.io/docs/orm/prisma-client/client-extensions/model#add-a-custom-method-to-a-specific-model).

    1.  Add a method named `register` to the `customer` model, which takes `email` and `password` as parameters. It will [hash the given password](https://github.com/kelektiv/node.bcrypt.js?tab=readme-ov-file#to-hash-a-password) using `bcrypt` with 10 salt rounds. Then, it will create a new customer with the provided email and the _hashed_ password. This newly created customer is returned.

    2.  Add a method named `login` to the `customer` model, which takes `email` and `password` as parameters. It will find the customer with the provided email. Then, it will [compare the given password](https://github.com/kelektiv/node.bcrypt.js?tab=readme-ov-file#to-check-a-password) to the hashed password saved in the database. If the password does not match, it will throw an error. Otherwise, it returns the found customer.

3.  Rename `example.env` to `.env` and update the `DATABASE_URL` with your Postgres credentials.
4.  Apply the migration and seed your local database with `npx prisma migrate reset`. This will also generate a new Prisma Client with your newly defined customer methods.

We can now use these custom methods to handle our API's register and login routes!

## Configuring the Environment

1. `npm install dotenv`
2. In your `.env` file, change the `JWT_SECRET` to something secure. Anyone who knows this string will be able to decrypt any token this backend generates. A good minimum length is 32 characters.

3. Add this line to the top of `server.js`. This will allow the rest of your app to access the variables defined in your `.env` file.

## Creating the Auth Router

1. `npm install jsonwebtoken`
2. Near the top of `api/auth.js`, import `jsonwebtoken` and grab the `JWT_SECRET` from `process.env`.
3. Write a function `createToken` that takes an `id` as a parameter. We will be calling this function later. Use [`jwt.sign`](https://github.com/auth0/node-jsonwebtoken?tab=readme-ov-file#jwtsignpayload-secretorprivatekey-options-callback) to create a token with `{ id }` as the payload and `JWT_SECRET` as the key. The token should expire in 1 day. Return the token.
4. Continue to the token-checking middleware. It has been partially defined for you. Make sure to read how the token is grabbed from the request headers.

   1. Use [`jwt.verify`](https://github.com/auth0/node-jsonwebtoken?tab=readme-ov-file#jwtverifytoken-secretorpublickey-options-callback) with `JWT_SECRET` to get the `id` from the token.
   2. Find the customer with that `id`.
   3. Set `req.customer` to that customer.
   4. Continue to the next middleware.

5. Create the `POST /register` route.

   1. Pass the `email` and `password` from the request body into `prisma.customer.register`, which is the custom method that you defined earlier. Save the returned customer in a variable named `customer`.
   2. Pass the `id` of that `customer` into `createToken`, which you also defined earlier. Save the returned token in a variable named `token`.
   3. Respond with `{ token }` and a status of 201.

6. Create the `POST /login` route.

   1. Pass the `email` and `password` into `prisma.customer.login`. Save the returned customer in a variable named `customer`.
   2. Pass the `id` of that `customer` into `createToken`. Save the returned token in a variable named `token`.
   3. Respond with `{ token }`.

7. Read the `authenticate` function, which has already been written. Why does it check for `req.customer`?

To recap: we now have routes for registering a new customer and logging in as an existing customer. Both routes will send a token if successful. We also have middleware to associate a request with a specific customer according to the attached token.

## Authenticated Routes

In this section, we'll define some routes that will only work if the customer is logged in. This allows us to _protect_ our routes and limit who is allowed to access our database.

`/reservations` router

1. Notice how `authenticate` is used in the `GET /` route. What do you think it's doing?

2. Write the rest of the `GET /` route. Send all of the reservations made by the customer stored in `req.customer`. Include the `restaurant` of each reservation.

3. Create the `POST /` route. It should only be accessible to a customer that is logged in. It will create a new reservation under the logged in customer, according to the `partySize` and `restaurantId` specified in the request body. It then sends the newly created reservation with status 201.
  
`/restaurants` router

1. Read the `GET /:id` route. What changes if a customer is logged in?
  
