"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lowdb_1 = __importDefault(require("lowdb"));
const FileSync_1 = __importDefault(require("lowdb/adapters/FileSync"));
const path_1 = __importDefault(require("path"));
const adapter = new FileSync_1.default(path_1.default.join(__dirname, "../db.json"));
const db = lowdb_1.default(adapter);
exports.default = db;
//# sourceMappingURL=db.js.map