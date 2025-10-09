"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomXWord = void 0;
const api_interfaces_1 = require("@nx/api-interfaces");
const fs = __importStar(require("fs"));
const mapEntries = (entries) => {
    return entries.map((entry) => ({
        ...entry,
        cell: {
            row: entry.row,
            col: entry.col,
        },
        isComplete: false,
        direction: entry.direction === 'Across' ? api_interfaces_1.Direction.across : api_interfaces_1.Direction.down,
    }));
};
const getRandomXWord = () => {
    const path = __dirname + '/assets/generated_xWords/';
    const filePaths = fs.readdirSync(path);
    const randomFile = (0, api_interfaces_1.getNRandom)(filePaths, 1)[0];
    const jsonXWord = JSON.parse(fs.readFileSync(path + randomFile).toString());
    return {
        ...jsonXWord,
        grid: (0, api_interfaces_1.mapGrid)(jsonXWord.grid),
        entries: mapEntries(jsonXWord.entries),
    };
};
exports.getRandomXWord = getRandomXWord;
