import { observable } from 'rxui-t';
import { UserInfo } from '@/types/user';
import { removeCookie, setCookie } from '@/utils';
import { COOKIE_LOGIN_USER } from '@/constants';

class User {
	user: UserInfo = null;

	constructor() {
	}

	setUser(user: UserInfo) {
		this.user = user;
	}
	
	login(user: UserInfo) {
		this.user = user;
		
		setCookie(COOKIE_LOGIN_USER, JSON.stringify(user), 30);
	}
	
	logout() {
		this.user = null;
		removeCookie(COOKIE_LOGIN_USER);
	}
}

export const userModel: User = observable(new User());
