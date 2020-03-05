# Stonebraker

I’m sure you already thought "It would be simpler with some SQL", or "Why the hell can’t I have syntax highlighting with Node Postgres?!". Because, like everyone, we all one time thought something like that. And, well… I think a WebStorm license is probably a little overkill for this. And that’s why Stonebraker come into place!

# What’s that after all?

Stonebraker is a tribute to Michael Stonebraker, the creator of PostgreSQL. Stonebraker is a simple way to use SQL files in your Node.js application. We often use SQL queries within JS, like Node Postgres. But we lose a lot of things: syntax highlighting, linting, checking, and much more. We should be able to use SQL directly from Node, keeping all the niceties of SQL, but with all the cool things from JS. And yet, we still don’t have something like this in JS, even if we have things like this in Webpack, like CSS Modules. That’s the role Stonebraker want to take.

# Getting started

Stonebraker is client and SQL agnostic. It means you can use any SQL of any flavour, as long as each instruction ends with a semicolon. And you can use any client, as long as it follows a simple interface: the same as `node-postgres`. Let’s deep a little bit more.

## Installation

First, install Stonebeaker.

```bash
yarn add stonebraker
# NPM users?
npm install --save stonebraker
```

## Initialize your database connection

In this example, we’ll use a Postgres connection. Let’s install the correct package.

```bash
yarn add pg
# NPM users?
npm install --save pg
```

And let’s initialize the client.

```javascript
const { Client } = require('pg')
const Stonebraker = require('stonebraker')
const path = require('path')

const connectClient = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })  
  await client.connect()
  return client
}
```

## Convert your queries

Now it’s time to convert your queries in order to use them directly as functions in JavaScript.

```sql
-- queries.sql
-- In this file, we define the queries.

-- name: select_user_by_id
-- keys: id
select * from users where id = $id;

-- name: select_post_by_user_and_date
-- keys: user_id, post_date
select * from posts where user_id = $user_id and created_ad = $post_date;
```

Each query must follow a similar pattern: a comment above the SQL code. The comments are the metadata of the query. They must at least contains a `name:` metadata and a potentially a `keys:` matadata, containing all variables of the query.

The `name:` metadata is required and will be the name of the generated function. The `keys:` metadata is there if you use some arguments in your queries. The name and the keys will be automatically translated into CamelCase. So you can write them into whatever format you want (including CamelCase), but you can also write SQL-compliant code and don’t bother about how to use it in JavaScript. Be careful, in `keys:`, you must write the exact same variable names as those you will write in queries.

Let’s continue with the JavaScript side.

```javascript
const main = async () => {
  // Reuse the connectClient function defined earlier.
  const client = await connectClient()

  // Provide the client to Stonebraker. It will generate an other function
  //   which will accept a path to an SQL file and convert its content into
  //   JavaScript.
  const converter = Stonebraker.convert(client)

  // Generates the functions of querying and returns an object similar to a
  //   standard Node.js/Common.js module.
  const queries = converter(path.resolve('./queries.sql'))

  // Now you can query the database easily!
  // The function is async because the client’s query function of node-postgres
  //   is async and Stonebraker use the functions as is.
  const { rows } = await queries.selectUserById({
    id: 'b688f9b6-0651-4382-a1b1-3145207b65e4'
  })
  
  // Do things with the rows.
}
```

Enjoy! You can now use SQL directly inside your Node program!

# State of Stonebraker

The API is really naive at the moment. It will surely be improved in the future as the package will gain in maturity. For now, it should probably not be used in production. But you probably can use production anyway and get the work done.

# Full API

```typescript
type Argument = number | string
type Path = string
type Query = string

type Client<Res> = {
  query: (Query, Argument[]) => Res
}

const convert: Client<Res> => Path => {
  [string]: ({ [string]: Argument }) => Res | () => Res
}

module = {
  convert,
}
```

# Contributing

Do you like this package? Cool! Think about contributions by submitting a PR or opening issues, or event email me! It’s always cool to hear users about your package! :)

# Nodemon Tip

You’re tired of reloading the server each time you modify an SQL file? Me too. But you can configure nodemon to be able to watch SQL files. Just overwrite `ext` field: `ext: '.js, .mjs, .json, .sql'` in your nodemon config (wether it is a file or a config in your `package.json`) and re-run your nodemon. And voilà!
