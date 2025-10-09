"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class Entity {
    constructor(id) {
        this.id = id ? id : (0, uuid_1.v4)();
        this.createdAt = new Date();
    }
}
exports.default = Entity;
