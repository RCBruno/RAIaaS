"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contracts = exports.FairnessSLAContract = exports.FairnessSLAFactoryContract = exports.FairnessRegistryContract = void 0;
const FairnessRegistryContract_js_1 = require("./registry/FairnessRegistryContract.js");
const FairnessSLAFactoryContract_js_1 = require("./factory/FairnessSLAFactoryContract.js");
const FairnessSLAContract_js_1 = require("./sla/FairnessSLAContract.js");
var FairnessRegistryContract_js_2 = require("./registry/FairnessRegistryContract.js");
Object.defineProperty(exports, "FairnessRegistryContract", { enumerable: true, get: function () { return FairnessRegistryContract_js_2.FairnessRegistryContract; } });
var FairnessSLAFactoryContract_js_2 = require("./factory/FairnessSLAFactoryContract.js");
Object.defineProperty(exports, "FairnessSLAFactoryContract", { enumerable: true, get: function () { return FairnessSLAFactoryContract_js_2.FairnessSLAFactoryContract; } });
var FairnessSLAContract_js_2 = require("./sla/FairnessSLAContract.js");
Object.defineProperty(exports, "FairnessSLAContract", { enumerable: true, get: function () { return FairnessSLAContract_js_2.FairnessSLAContract; } });
exports.contracts = [
    FairnessRegistryContract_js_1.FairnessRegistryContract,
    FairnessSLAFactoryContract_js_1.FairnessSLAFactoryContract,
    FairnessSLAContract_js_1.FairnessSLAContract
];
//# sourceMappingURL=index.js.map