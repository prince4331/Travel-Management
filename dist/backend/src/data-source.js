"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./users/user.entity");
const role_entity_1 = require("./auth/role.entity");
const session_entity_1 = require("./auth/session.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'travel_app',
    password: process.env.DB_PASS || 'travel_secret',
    database: process.env.DB_NAME || 'travel_management',
    entities: [user_entity_1.User, role_entity_1.Role, session_entity_1.Session],
    migrations: [__dirname + '/../migrations/*.ts'],
    synchronize: false,
    charset: 'utf8mb4_unicode_ci',
});
