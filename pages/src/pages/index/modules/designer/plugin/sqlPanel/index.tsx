import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {Modal} from 'antd';
import {
	exampleOpenSQLParamsFunc,
	exampleSelectOpenSQLParamsFunc,
	exampleSQLParamsFunc,
} from '../constant';

import styles from './index.less';

interface SQLPanelProps {
	onClose?(): void;
	openFileSelector(): Promise<any>;
	originConnectors: any[];
	connectorService: {
		add(item: Record<string, any>): void;
		remove(item: Record<string, any>): void;
		update(item: Record<string, any>): void;
		test(item: Record<string, any>, params: any): void;
	};
}

/** 字段类型 */
enum FieldBizType {
	STRING = 'string',
	NUMBER = 'number',
	DATETIME = 'datetime',
	JSON = 'json',
	/** 枚举 */
	ENUM = 'enum',
	/** 外键，关联其他表 */
	RELATION = 'relation',
	/** 映射其他表 */
	MAPPING = 'mapping',
	/** 系统表 */
	SYS_USER = 'SYS_USER',
	SYS_ROLE = 'SYS_ROLE',
	SYS_ROLE_RELATION = 'SYS_ROLE_RELATION',
}
const uuid = (len = 6) => {
	const seed = 'abcdefhijkmnprstwxyz';
	const maxPos = seed.length;
	let rtn = '';
	for (let i = 0; i < len; i++) {
		rtn += seed.charAt(Math.floor(Math.random() * maxPos));
	}
	return 'u_' + rtn;
}
const getSchemaTypeByFieldType = (field) => {
	switch (field.bizType) {
		case FieldBizType.ENUM:
			return 'string';
		case FieldBizType.DATETIME:
			return field.showFormat ? 'string' : 'number';
		case FieldBizType.STRING:
			return 'string';
		case FieldBizType.NUMBER:
			return 'number';
		case FieldBizType.JSON:
			return 'any';
		case FieldBizType.RELATION:
			return 'number';
		case FieldBizType.SYS_USER:
			return 'number';
		case FieldBizType.SYS_ROLE:
			return 'number';
		case FieldBizType.SYS_ROLE_RELATION:
			return 'number';
	}
};
const getParamsFromSchema = (schema, params) => {
	if (schema.type === 'object' || schema.type === 'array') {
		const properties = schema.properties || schema.items?.properties || {};
		Object.keys(properties).forEach((key) => {
			const item: any = { id: uuid(), name: key, type: properties[key].type };
			const isNested = properties[key].type === 'object' || properties[key].type === 'array';
			if (isNested) {
				item.children = [];
			}
			
			params.push(item);
			
			if (isNested) {
				getParamsFromSchema((properties[key] || properties[key].items) || {}, item.children);
			}
		});
	} else {
		params.push({ id: uuid(), name: schema.name, type: schema.type });
	}
};
const HttpIcon = (
	<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
		<path d="M764.41958 521.462537l37.594406-37.594405a202.037962 202.037962 0 0 0 59.588412-144.23976 169.302697 169.302697 0 0 0-53.45055-121.734266l-6.137862-6.137862a163.932068 163.932068 0 0 0-127.872128-53.962038 193.854146 193.854146 0 0 0-135.032967 60.0999l-38.105894 37.082917zM373.386613 254.977023l106.901099-102.297702a281.318681 281.318681 0 0 1 197.69031-84.13986 250.117882 250.117882 0 0 1 160.095904 53.962038l127.872128-122.501499L1022.977023 58.565435l-127.872128 127.872127a279.784216 279.784216 0 0 1-30.689311 360.599401l-100.251748 102.297702zM227.100899 530.157842a189.250749 189.250749 0 0 0-5.370629 265.718282l6.137862 6.137862a164.443556 164.443556 0 0 0 127.872128 53.706294 194.621379 194.621379 0 0 0 135.032967-59.844156l42.965035-43.476524L270.065934 486.937063zM0 967.224775l133.242757-139.892108a278.761239 278.761239 0 0 1 30.689311-360.343656L270.065934 359.064935l80.559441 81.070929L430.929071 359.064935l57.798202 58.053946L409.190809 498.701299l120.1998 120.967033 83.628372-83.884116 53.962038 55.496503-85.418581 85.93007 74.933066 75.444556-106.133866 106.901099a283.108891 283.108891 0 0 1-198.457542 84.651348 251.396603 251.396603 0 0 1-160.095904-53.706293L58.30969 1024z"></path>
	</svg>
);
const KeyMap = {
	INSERT: '新增接口',
	UPDATE: '更新接口',
	SELECT: '查询接口',
	DELETE: '删除接口',
};
const SQLPanel: FC<SQLPanelProps> = props => {
	const { openFileSelector, onClose, originConnectors = [], connectorService } = props;
  const [domainFile, setDomainFile] = useState(null);
  const [originSQLList, setOriginSQList] = useState([]);
  const [entityList, setEntityList] = useState([]);
  const [selectedSQLList, setSelectedSQLList] = useState([]);
	const domainFileRef = useRef(null);
	
  const onItemClick = useCallback((item) => {
    setSelectedSQLList((sql) => [...sql, { ...item, id: uuid() }]);
  }, [originConnectors]);

  const onSave = () => {
    onSaveSQl(selectedSQLList);
		setDomainFile(null);
		setSelectedSQLList([]);
		onClose?.();
  };
	
	const onSaveSQl = useCallback((sqlList: any[]) => {
		setDomainFile(null);
		domainFileRef.current = null;

		for(let l = sqlList.length, i=0; i<l; i++) {
			const item: any = sqlList[i];
			const { fileId, isOpen, serviceId, action } = item;

			let inputSchema: any = item.inputSchema || { type: 'any' };
			let outputSchema: any = item.outputSchema || { type: 'any' };
			let debugParams = [];
			const fields: Array<{ name: string }> = [];
			
			if (isOpen) {
				if (action === 'SELECT') {
					debugParams = [{ id: uuid(), name: 'keyword', type: 'string' }];
					outputSchema = {
						type: 'object',
						properties: {
							dataSource: { type: 'array', items: { type: 'object', properties: {} } },
							total: { type: 'number' },
							pageNum: { type: 'number' },
							pageSize: { type: 'number' }
						}
					};
					inputSchema = {
						type: 'object',
						properties: {
							keyword: { type: 'string' },
							fields: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										name: { type: 'string' },
									}
								}
							},
							orders: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										fieldName: { type: 'string' },
										order: { type: 'string' },
									}
								}
							},
							page: {
								type: 'object',
								properties: {
									pageNum: { type: 'number' },
									pageSize: { type: 'number' }
								}
							}
						}
					};
					
					try {
						item.originEntity?.fieldAry
						.filter(field => field.bizType !== 'mapping' && !field.isPrivate)
						.forEach(field => {
							fields.push({ name: field.name });
							outputSchema.properties.dataSource.items.properties[field.name] = { type: getSchemaTypeByFieldType(field) };
						});
					} catch (e) {
						console.log('parse outputSchema error', e);
					}
				} else if (action === 'UPDATE' || action === 'INSERT') {
					inputSchema = { type: 'object', properties: {} };
					
					item.originEntity?.fieldAry
						.filter(field => field.bizType !== 'mapping' && !field.isPrivate)
						.forEach(field => {
							debugParams.push({ id: uuid(), name: field.name, type: getSchemaTypeByFieldType(field) });
							inputSchema.properties[field.name] = { type: getSchemaTypeByFieldType(field) };
						});
					
					if (action === 'INSERT') {
						outputSchema = {type: 'number'};
						delete inputSchema.properties.id;
					}
				} else if (action === 'DELETE') {
					debugParams = [{ id: uuid(), name: 'id', type: 'number' }];
					inputSchema = { type: 'object', properties: { id: { type: 'number' } } };
				}
			} else {
				getParamsFromSchema(inputSchema, debugParams);
			}
			
			connectorService.add({
        id: item.id,
        title: item.title,
        method: 'POST',
        type: 'http-sql',
        inputSchema: inputSchema,
        outputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'number',
            },
            data: outputSchema,
            msg: {
              type: 'string',
            },
          },
        },
        resultSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'number',
            },
	          data: outputSchema,
            msg: {
              type: 'string',
            },
          },
        },
        domainServiceMap: { serviceId, fileId },
        params: debugParams
          ? {
              type: 'root',
              name: 'root',
              children: debugParams,
            }
          : void 0,
        input: encodeURIComponent(
          isOpen
	          ? (action === 'SELECT' ? exampleSelectOpenSQLParamsFunc : exampleOpenSQLParamsFunc)
	            .replace('__serviceId__', serviceId)
	            .replace('__fileId__', item.fileId)
	            .replace('__action__', action)
		          .replace('__fields__', JSON.stringify(fields))
	          : exampleSQLParamsFunc
              .replace('__serviceId__', serviceId)
              .replace('__fileId__', item.fileId)
        ),
        path: '/api/system/domain/run',
      });
		}
	}, [entityList, connectorService, originConnectors]);
	
	const getBundle = useCallback((fileId: number) => {
			axios.get(`/paas/api/domain/bundle?fileId=${fileId}`)
				.then((res) => {
					if (res.data.code === 1) {
						const originSQLList = [
							...res.data.data.service.map(service => ({ ...service, id: uuid(), serviceId: service.id, fileId })),
							...res.data.data.entityAry
								.filter(entity => entity.isOpen)
								.map(entity => ({ id: uuid(), serviceId: entity.id, entityName: entity.name, title: `${entity.name}的领域服务`, originEntity: entity, fileId, isOpen: true }))
						];
						setOriginSQList(originSQLList);
						setEntityList(res.data.data.entityAry);
					}
				});
		}, []);

	const cancelSelect = useCallback((selectedSQL) => {
		setSelectedSQLList(pre => pre.filter(item => item.id !== selectedSQL.id));
	}, []);
	
	useEffect(() => {
		if (domainFileRef.current) {
			domainFileRef.current = null;
			setDomainFile(null);
		}
		openFileSelector?.()
			.then(file => {
				if (!file) {
					onClose?.();
					return;
				}
				domainFileRef.current = file;
				setDomainFile(file);
				
				setOriginSQList([]);
				setEntityList([]);
				file && getBundle(file.id);
			});
	}, [onClose]);
	
	return (
		<Modal
			wrapClassName="fangzhou-theme"
			visible={!!domainFile}
			className={styles.domainModal}
			title="领域接口选择"
			onCancel={onClose}
			onOk={onSave}
			destroyOnClose
			width={800}
			cancelText="取消"
			okText="确定"
		>
			<div className={styles.domainContainer}>
				<div className={styles.leftPanel}>
					<div className={styles.header}>
						 已选择领域接口列表:
					</div>
					<div className={styles.panelContent}>
						{
							selectedSQLList.length
								? selectedSQLList.map(sql => {
									return (
										<div key={sql.id} className={styles.sqlHttp}>
											{HttpIcon}
											<div className={styles.title}>{sql.title}</div>
											<div className={styles.operate}>
												<svg onClick={() => cancelSelect(sql)} viewBox="64 64 896 896" width="16" height="16" fill="currentColor">
													<path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"/>
												</svg>
											</div>
										</div>
									);
								})
								: <div className={styles.empty}>未添加领域接口</div>
						}
					</div>
				</div>
				<div className={styles.rightPanel}>
					<div className={styles.header}>
						来自于模型：{domainFile?.name}
					</div>
					<div className={styles.panelContent}>
						{
							originSQLList.length ? (
								<>
									{
										originSQLList?.filter(sql => !sql.isOpen).map((sql) => {
											return (
												<div
													key={sql.id}
													className={styles.sqlHttpItem}
													onClick={() => onItemClick(sql)}
												>
													{HttpIcon}
													<div className={styles.title}>{sql.title}</div>
												</div>
											);
										})
									}
									{
										originSQLList?.filter(sql => sql.isOpen).map((sql) => {
											return (
												<div key={sql.id} className={styles.sqlHttpGroup}>
													<div className={styles.groupTitle}>{sql.title}</div>
													<div className={styles.groupContent}>
														{['SELECT', 'INSERT', 'UPDATE', 'DELETE'].map((key) => {
															return (
																<div
																	key={key}
																	className={styles.sqlHttpItem}
																	onClick={() => onItemClick({ ...sql, title: `${sql.entityName}的${KeyMap[key]}`, action: key })}
																>
																	{HttpIcon}
																	<div className={styles.title}>{sql.entityName}的{KeyMap[key]}</div>
																</div>
															);
														})}
													</div>
												</div>
											);
										})
									}
								</>
							) : <div className={styles.empty}>暂无可添加的领域接口</div>
						}
					</div>
				</div>
			</div>
		</Modal>
	);
}

export default SQLPanel;
