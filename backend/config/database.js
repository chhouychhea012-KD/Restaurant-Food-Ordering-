require('dotenv').config();

const baseConfig = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'flavor_fleet',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: process.env.SEQUELIZE_LOGGING === 'true' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
  },
};

module.exports = {
  development: baseConfig,
  test: {
    ...baseConfig,
    database: process.env.DB_TEST_NAME || 'flavor_fleet_test',
    logging: false,
  },
  production: {
    ...baseConfig,
    logging: false,
  },
};
