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
const express_1 = __importDefault(require("express"));
const covid19NovaScotia_1 = require("./covid19NovaScotia");
const db_1 = __importDefault(require("./db"));
const app = express_1.default();
app.get("/all", (req, res) => {
    res.send({
        success: true,
        data: covid19NovaScotia_1.getAll(),
    });
});
app.get("/latest", (req, res) => {
    res.send({
        success: true,
        data: covid19NovaScotia_1.getLatestNews(),
    });
});
app.get("/setWebhook", (req, res) => {
    if (!req.query.url) {
        return res.send({
            success: false,
            message: "Query param is missing: url",
        });
    }
    const url = req.query.url;
    db_1.default.get("webhooks")
        .push({
        timestamp: Date.now(),
        url,
    })
        .write();
    res.send({
        success: true,
        message: "Webhook is set",
        url,
    });
});
const PORT = process.env.PORT || 6003;
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("COVID19 NovaScotia News API is running at ", PORT);
    covid19NovaScotia_1.updateNewsAndFireMsgToWebhooks();
    // fetch every ten minutes
    const tenMins = 1000 * 60 * 10;
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        covid19NovaScotia_1.updateNewsAndFireMsgToWebhooks();
    }), tenMins);
}));
//# sourceMappingURL=app.js.map