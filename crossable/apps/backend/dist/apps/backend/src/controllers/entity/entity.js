"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Entity {
    constructor(id) {
        this.id = id ? id : crypto.randomUUID();
        this.createdAt = new Date();
    }
}
exports.default = Entity;
