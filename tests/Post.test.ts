import { createTestContext } from "./__helpers";

const ctx = createTestContext();

it("ensures that draft can be created and published", async () => {
  const createUser = await ctx.client.request(`
        mutation {
            createUser(name: "Nombre prueba", email: "prueba@gmail.com", password: "psswd"){
                id
                name
                email
                password
            }
        }
    `);
  expect(createUser).toMatchInlineSnapshot(`
    Object {
      "createUser": Object {
        "email": "prueba@gmail.com",
        "id": 1,
        "name": "Nombre prueba",
        "password": "psswd",
      },
    }
  `);

  const draftResult = await ctx.client.request(`
        mutation {
            createDraft(title: "Nexus", body:"...", user: 1){
                id
                title
                body
                published
            }
        }
    `);
  expect(draftResult).toMatchInlineSnapshot(`
    Object {
      "createDraft": Object {
        "body": "...",
        "id": 1,
        "published": false,
        "title": "Nexus",
      },
    }
  `);

  const publishResult = await ctx.client.request(
    `
        mutation publishDraft($draftId: Int!) {
            publish(draftId: $draftId) {
                id
                title
                body
                published
            }
        }
    `,
    { draftId: draftResult.createDraft.id }
  );
  expect(publishResult).toMatchInlineSnapshot(`
    Object {
      "publish": Object {
        "body": "...",
        "id": 1,
        "published": true,
        "title": "Nexus",
      },
    }
  `);
});
