"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jwt_1 = require("../common/jwt");
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }
    try {
        req.user = (0, jwt_1.verifyToken)(token);
        return next();
    }
    catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session",
        });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this resource",
            });
        }
        return next();
    };
};
exports.requireRole = requireRole;
