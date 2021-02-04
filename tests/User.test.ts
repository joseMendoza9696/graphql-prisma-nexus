import { createTestContext } from "./__helpers";
import {formatError, printError} from "graphql";

const ctx = createTestContext();

it("ensures that creates a user and it is unique", async () => {
  const createUser = await ctx.client.request(`
        mutation {
            createUser(name:"User",email:"user@gmail.com",password:"psswd"){
                id
                name
                email
            }
        }
    `);
  expect(createUser).toMatchInlineSnapshot(`
    Object {
      "createUser": Object {
        "email": "user@gmail.com",
        "id": 1,
        "name": "User",
      },
    }
  `);
});
