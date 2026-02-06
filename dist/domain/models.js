"use strict";
/**
 * Domain models representing shipping concepts in a carrier-agnostic way.
 * These types form the boundary between our application and external carrier APIs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceLevel = void 0;
/**
 * Service level options (standardized across carriers)
 */
var ServiceLevel;
(function (ServiceLevel) {
    ServiceLevel["GROUND"] = "GROUND";
    ServiceLevel["TWO_DAY"] = "TWO_DAY";
    ServiceLevel["NEXT_DAY"] = "NEXT_DAY";
    ServiceLevel["NEXT_DAY_EARLY_AM"] = "NEXT_DAY_EARLY_AM";
    ServiceLevel["THREE_DAY"] = "THREE_DAY";
    ServiceLevel["INTERNATIONAL_STANDARD"] = "INTERNATIONAL_STANDARD";
    ServiceLevel["INTERNATIONAL_EXPEDITED"] = "INTERNATIONAL_EXPEDITED";
})(ServiceLevel || (exports.ServiceLevel = ServiceLevel = {}));
//# sourceMappingURL=models.js.map