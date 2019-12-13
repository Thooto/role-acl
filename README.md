# Role ACL

This library is an extension of [role-acl][role-acl].

## Added features

- Use JSON Path to compare a key with another in the condition arguments.
- Support for `undefined` (or any boolean-negative value) argument value in the condition.
- Provide a parameter on permission filter to interprete the data as a Sequelize query.

## Guide

```ts
import { AccessControl } from "@thooto/role-acl";

const ac = new AccessControl();
```

### JSON path

```ts
// Assuming:
// Video.hasMany(Review);
// Review.belongsTo(Video);

ac.grant("user")
  .action("read")
  .condition({
    Fn: "EQUALS",
    args: {
      '$.query.include[?(@.model=="User")].where.id': "$.issuer.id", // Restrict to user's own videos
      "$.query.where": undefined // Forbid where parameter
    }
  })
  .on("video");

const req = {
  query: {
    attributes: ["url", "size"],
    include: [{ model: "User", where: { id: 2 } }]
  },
  issuer: {
    id: 2
  }
};

const permission = ac
  .can("user")
  .context(req)
  .execute("read")
  .sync()
  .on("video");
// Should not throw

Video.findAll(req.query);
```

### Query attributes filter

```ts
// Assuming Video and Review are Sequelize models:
// Video.hasMany(Review);
// Review.belongsTo(Video);

ac.grant("user")
  .action("read")
  .on("video", ["url", "Review.commentary"]);

const permission = ac
  .can("user")
  .execute("read")
  .sync()
  .on("video");

const query = {
  attributes: ["url", "size"],
  include: [{ model: "Review", attributes: ["commentary", "mark"] }]
};

permission.filter(query, { query: true });
// Query now is:
// { attributes: ["url"], include: [{ model: "Video", attributes: ["mark"] }] }

Video.findAll(query);
```

## To do

- Add JSON Path usage to all context functions (currently only `Fn: "EQUALS"`).

## Licenses

- [role-acl][this]: [MIT][license].
- [AccessControl][onury-accesscontrol]: [MIT][onury-accesscontrol-license].

[this]: https://github.com/thooto/role-acl
[license]: https://github.com/tensult/role-acl/blob/master/LICENSE
[onury-accesscontrol]: https://github.com/onury/accesscontrol
[onury-accesscontrol-license]: https://github.com/onury/accesscontrol/blob/master/LICENSE
[role-acl]: https://github.com/tensult/role-acl
