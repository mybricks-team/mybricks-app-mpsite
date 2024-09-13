import { makeAutoObservable } from "mobx";

class User {
  user = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user) {
    this.user = user;
  }
}

export const userModel = new User();
