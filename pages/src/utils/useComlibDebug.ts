import React, { useCallback, useMemo, useState } from 'react';

const debugServer = new URL(window.location?.href)?.searchParams?.get?.('bricks_debug_server');

/** 使用debug模式的 */
export default () => {
	const isDebugComlib = useMemo(() => {
		return !!debugServer;
	}, []);

	const debugCompileApiUrl = useMemo(() => {
		return `${debugServer}/api/compile`;
	}, [isDebugComlib]);

	const debugComlibUrl = useMemo(() => {
		return `${debugServer}/libEdt.js`;
	}, [isDebugComlib]);
  

	return {
		isDebugComlib,
		debugCompileApiUrl,
		debugComlibUrl
	};
};
