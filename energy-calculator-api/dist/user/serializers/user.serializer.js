"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSerializer = exports.UserResponse = void 0;
class UserResponse {
    userId;
    userName;
    email;
}
exports.UserResponse = UserResponse;
class UserSerializer {
    static toPublic(user) {
        return {
            userId: user.userId,
            userName: user.userName,
            email: user.email,
        };
    }
}
exports.UserSerializer = UserSerializer;
//# sourceMappingURL=user.serializer.js.map