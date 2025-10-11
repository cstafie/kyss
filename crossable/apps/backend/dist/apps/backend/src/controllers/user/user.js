"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entity_1 = __importDefault(require("../entity/entity"));
class User extends entity_1.default {
    constructor({ name, socket, id }) {
        super(id);
        this.currentGameId = "";
        this.name = name;
        this.socket = socket;
    }
}
exports.default = User;
