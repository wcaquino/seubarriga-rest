module.exports = {
  test: {
    client: 'pg',
    version: '11',
    connection: {
      host: 'localhost',
      user: 'admin',
      password: '123456',
      database: 'barrigaDB',
    },
    migrations: { directory: './src/migrations' },
    seeds: { directory: './src/seeds' },
  },
  prod: {
    client: 'pg',
    version: '11',
    connection: {
      host: 'localhost',
      user: 'admin',
      password: '123456',
      database: 'seubarriga',
    },
    migrations: { directory: './src/migrations' },
  },
};
