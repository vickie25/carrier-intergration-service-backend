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
exports.config = void 0;
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env file
dotenv.config();
/**
 * Configuration object for managing environment variables.
 * Uses lazy loading via getters to avoid throwing at import time during tests.
 */
class Config {
    _ups = null;
    /**
     * UPS Configuration - lazily loaded
     */
    get ups() {
        if (!this._ups) {
            this._ups = {
                clientId: this.getRequired('UPS_CLIENT_ID'),
                clientSecret: this.getRequired('UPS_CLIENT_SECRET'),
                apiBaseUrl: this.get('UPS_API_BASE_URL', 'https://onlinetools.ups.com/api'),
                authUrl: this.get('UPS_AUTH_URL', 'https://onlinetools.ups.com/security/v1/oauth/token'),
            };
        }
        return this._ups;
    }
    // General Configuration
    nodeEnv = this.get('NODE_ENV', 'development');
    maxRetries = parseInt(this.get('MAX_RETRIES', '3'), 10);
    requestTimeout = parseInt(this.get('REQUEST_TIMEOUT_MS', '30000'), 10);
    /**
     * Get an environment variable or return default
     */
    get(key, defaultValue) {
        return process.env[key] || defaultValue;
    }
    /**
     * Get a required environment variable or throw/fallback for tests
     */
    getRequired(key) {
        const value = process.env[key];
        if (!value) {
            // In test environment, return a placeholder value
            if (this.nodeEnv === 'test') {
                return `test_${key.toLowerCase()}`;
            }
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return value;
    }
    /**
     * Check if running in production
     */
    isProduction() {
        return this.nodeEnv === 'production';
    }
    /**
     * Check if running in test environment
     */
    isTest() {
        return this.nodeEnv === 'test';
    }
}
// Export singleton instance
exports.config = new Config();
//# sourceMappingURL=config.js.map