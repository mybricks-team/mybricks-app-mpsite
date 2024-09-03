/** parse JSON string，同时 catch 错误 */
export const safeParse = (content: string, defaultValue = {}) => {
	try {
		return JSON.parse(content);
	} catch {
		return defaultValue;
	}
};

/** 编码 */
export const safeEncodeURIComponent = (content: string) => {
	try {
		return encodeURIComponent(content);
	} catch {
		return content || '';
	}
};

/** 解码 */
export const safeDecodeURIComponent = (content: string) => {
	try {
		return decodeURIComponent(content);
	} catch {
		return content || '';
	}
};

export function getNextVersion(version, max = 100) {
	if (!version) return '1.0.0';
	const vAry: any[] = version.split('.');
	let carry = false;
	const isMaster = vAry.length === 3;
	if (!isMaster) {
		max = -1;
	}
	
	for (let i = vAry.length - 1; i >= 0; i--) {
		const res: number = Number(vAry[i]) + 1;
		if (i === 0) {
			vAry[i] = res;
		} else {
			if (res === max) {
				vAry[i] = 0;
				carry = true;
			} else {
				vAry[i] = res;
				carry = false;
			}
		}
		if (!carry) break;
	}
	
	return vAry.join('.');
}

