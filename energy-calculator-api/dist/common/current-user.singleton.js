"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUserId = getCurrentUserId;
const CURRENT_USER_ID = 1;
class CurrentUserSingleton {
    static instance = null;
    constructor() { }
    static getInstance() {
        if (!CurrentUserSingleton.instance) {
            CurrentUserSingleton.instance = new CurrentUserSingleton();
        }
        return CurrentUserSingleton.instance;
    }
    getUserId() {
        return CURRENT_USER_ID;
    }
}
function getCurrentUserId() {
    return CurrentUserSingleton.getInstance().getUserId();
}
//# sourceMappingURL=current-user.singleton.js.map