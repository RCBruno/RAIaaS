"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeStatus = exports.SLAStatus = exports.SLAPlanType = void 0;
var SLAPlanType;
(function (SLAPlanType) {
    SLAPlanType["STANDARD"] = "STANDARD";
    SLAPlanType["PREMIUM"] = "PREMIUM";
})(SLAPlanType || (exports.SLAPlanType = SLAPlanType = {}));
var SLAStatus;
(function (SLAStatus) {
    SLAStatus["ACTIVE"] = "ACTIVE";
    SLAStatus["DISPUTED"] = "DISPUTED";
    SLAStatus["TERMINATED"] = "TERMINATED";
})(SLAStatus || (exports.SLAStatus = SLAStatus = {}));
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["NONE"] = "NONE";
    DisputeStatus["OPEN"] = "OPEN";
    DisputeStatus["UNDER_AUDIT"] = "UNDER_AUDIT";
    DisputeStatus["RESOLVED_PLATFORM_FAULT"] = "RESOLVED_PLATFORM_FAULT";
    DisputeStatus["RESOLVED_PROVIDER_FAULT"] = "RESOLVED_PROVIDER_FAULT";
    DisputeStatus["REJECTED"] = "REJECTED";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
//# sourceMappingURL=sla.js.map