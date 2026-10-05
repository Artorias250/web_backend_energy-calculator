const CURRENT_USER_ID = 1;

class CurrentUserSingleton {
  private static instance: CurrentUserSingleton | null = null;

  private constructor() {}

  static getInstance(): CurrentUserSingleton {
    if (!CurrentUserSingleton.instance) {
      CurrentUserSingleton.instance = new CurrentUserSingleton();
    }
    return CurrentUserSingleton.instance;
  }

  getUserId(): number {
    return CURRENT_USER_ID;
  }
}

export function getCurrentUserId(): number {
  return CurrentUserSingleton.getInstance().getUserId();
}
