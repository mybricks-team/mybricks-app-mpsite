export const exampleParamsFunc = `export default function ({ params, data, headers, url, method }) {
  // 设置请求query、请求体、请求头
  return { params, data, headers, url, method };
 }
`;

export const exampleResultFunc = `export default function (result, { method, url, params, data, headers }) {
  // return {
  //  total: result.all,
  //  dataSource: result.list.map({id, name} => ({
  //     value:id, label: name
  //  }))
  // }
  return result;
}
`;

export const exampleSQLParamsFunc = `export default function ({ params, data, headers, url, method }) {
  const domainInfo = {
    serviceId: '__serviceId__',
    fileId: '__fileId__'
  }
  // 设置请求query、请求体、请求头
  return { params, data: {
    params: {
      ...data
    },
    ...domainInfo,
  }, headers, url, method };
 }
`;

/** 领域服务的模板 */
export const exampleSelectOpenSQLParamsFunc = `export default function ({ params, data, headers, url, method }) {
  const domainInfo = {
    serviceId: '__serviceId__',
    fileId: '__fileId__'
  }
  const fields = (Array.isArray(data.fields) && data.fields.length ? data.fields : null) || __fields__;
  const query = data.keyword ? fields.reduce((pre, item) => {
    return { ...pre, [item.name]: { operator: 'LIKE', value: data.keyword } };
  }, {}) : undefined;
  
  // 设置请求query、请求体、请求头
  return { params, data: {
    params: {
			...data,
      query,
			fields,
			action: '__action__'
    },
    ...domainInfo,
  }, headers, url, method };
 }
`;

/** 领域服务的模板 */
export const exampleOpenSQLParamsFunc = `export default function ({ params, data, headers, url, method }) {
  const domainInfo = {
    serviceId: '__serviceId__',
    fileId: '__fileId__'
  }
  const logParams = {};
  if (data && data.showToplLog) {
    logParams.showToplLog = data.showToplLog;
  }
  
  // 设置请求query、请求体、请求头
  return { params, data: {
    params: {
      ...logParams,
      query: data,
			action: '__action__'
    },
    ...domainInfo,
  }, headers, url, method };
 }
`;
