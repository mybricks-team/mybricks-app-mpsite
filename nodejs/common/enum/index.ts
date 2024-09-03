enum EResponseResultCode {
  SUCCESS = 1,
  ERROR = -1,

  USERID_MISSED = 10001,
  KPN_MISSED = 11001,

  PROGRAM_EXCEPTION = 99999,
}

enum EResponseResultCodeDesc {
  EResponseResultCode = '成功',
  USERID_MISSED = '用户ID缺失，请确认是否登陆',
  KPN_MISSED = '用户ID缺失，请确认是否登陆',
  ERROR = '网络错误，请稍后重试',
}

enum EExtName {
  /** 组件 */
  COM = 'component',
  /** 组件库 */
  COMLIB = 'comlib',
  /** 云组件 */
  CDM = 'cdm',
}

export {
	EExtName,
	EResponseResultCode,
	EResponseResultCodeDesc
};