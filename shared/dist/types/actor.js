"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorStatus = exports.ActorRole = void 0;
var ActorRole;
(function (ActorRole) {
    ActorRole["PLATFORM"] = "PLATFORM";
    ActorRole["PROVIDER"] = "PROVIDER";
    ActorRole["AUDITOR"] = "AUDITOR";
    ActorRole["ORACLE"] = "ORACLE";
    ActorRole["GOVERNANCE"] = "GOVERNANCE";
})(ActorRole || (exports.ActorRole = ActorRole = {}));
var ActorStatus;
(function (ActorStatus) {
    ActorStatus["ACTIVE"] = "ACTIVE";
    ActorStatus["SUSPENDED"] = "SUSPENDED";
    ActorStatus["SLASHED"] = "SLASHED";
})(ActorStatus || (exports.ActorStatus = ActorStatus = {}));
//# sourceMappingURL=actor.js.map