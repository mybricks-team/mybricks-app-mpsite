function getEnv() {
	return process.env.NODE_ENV;
}

function isProd() {
	return process.env.NODE_ENV === 'production';
}

export { getEnv, isProd };
