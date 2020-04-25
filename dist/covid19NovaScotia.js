"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const db_1 = __importDefault(require("./db"));
const crawler_1 = require("./crawler");
function getAll() {
    try {
        return db_1.default.get("covidNews").value();
    }
    catch (err) {
        console.log("error fetch all news from db");
    }
}
exports.getAll = getAll;
function sendLatestNewsToWebhooks() {
    return __awaiter(this, void 0, void 0, function* () {
        const webhooks = db_1.default.get("webhooks").value();
        const requestPromises = [];
        for (let webhook of webhooks) {
            requestPromises.push(new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield axios_1.default.get(webhook.url, { timeout: 2000 });
                    resolve("Webhook " + webhook.url + " is fired!");
                }
                catch (e) {
                    resolve("Webhook " + webhook.url + " doesnt work");
                }
            })));
        }
        const results = yield Promise.all(requestPromises);
        return results;
    });
}
exports.sendLatestNewsToWebhooks = sendLatestNewsToWebhooks;
function updateNewsAndFireMsgToWebhooks() {
    return __awaiter(this, void 0, void 0, function* () {
        const oldLength = db_1.default.get("covidNews").value().length;
        yield crawler_1.updateCovidNews();
        const newLength = db_1.default.get("covidNews").value().length;
        if (newLength > oldLength) {
            console.log("Fetched covid news!");
            const webhookResult = yield sendLatestNewsToWebhooks();
            console.log("Webhook results - ", webhookResult);
            return;
        }
        else {
            console.log("no updates needed");
        }
    });
}
exports.updateNewsAndFireMsgToWebhooks = updateNewsAndFireMsgToWebhooks;
function getLatestNews() {
    try {
        return db_1.default.get("covidNews").take(1).value()[0];
    }
    catch (err) {
        console.log("error fetch all news from db");
    }
}
exports.getLatestNews = getLatestNews;
//# sourceMappingURL=covid19NovaScotia.js.map