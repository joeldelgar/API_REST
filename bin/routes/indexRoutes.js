"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); //Import SOME modules from express.
//This is only an intermediate page for potential future uses. This page currently shows you the URL to the API.
class IndexRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }
    routes() {
        this.router.get('/', (req, res) => res.status(200).send('API: /api'));
    }
}
const indexRoutes = new IndexRoutes();
indexRoutes.routes();
exports.default = indexRoutes.router;
