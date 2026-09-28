"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fabric_service_js_1 = require("./services/fabric.service.js");
const ipfs_service_js_1 = require("./services/ipfs.service.js");
const actor_routes_js_1 = require("./routes/actor.routes.js");
const sla_routes_js_1 = require("./routes/sla.routes.js");
const metrics_routes_js_1 = require("./routes/metrics.routes.js");
const dispute_routes_js_1 = require("./routes/dispute.routes.js");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    const fabricService = new fabric_service_js_1.FabricService();
    const ipfsService = new ipfs_service_js_1.IPFSService();
    app.get('/health', (req, res) => {
        res.json({ status: 'UP', service: 'RAIaaS REST API Gateway' });
    });
    app.use('/api/v1/actors', (0, actor_routes_js_1.createActorRouter)(fabricService));
    app.use('/api/v1/sla', (0, sla_routes_js_1.createSLARouter)(fabricService));
    app.use('/api/v1/metrics', (0, metrics_routes_js_1.createMetricsRouter)(fabricService, ipfsService));
    app.use('/api/v1/dispute', (0, dispute_routes_js_1.createDisputeRouter)(fabricService));
    return { app, fabricService, ipfsService };
}
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    const { app } = createApp();
    app.listen(PORT, () => {
        console.log(`RAIaaS API Gateway running on port ${PORT}`);
    });
}
//# sourceMappingURL=app.js.map