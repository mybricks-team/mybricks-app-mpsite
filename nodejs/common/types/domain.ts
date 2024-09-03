import { EffectStatus, FieldDBType, FieldType, TableAction } from '../const';

interface Entity {
	/** 表 ID，在前端编辑页使用 */
	id: string;
	/** 表名 */
	name: string;
	/** 表备注 */
	desc: string;
	fieldAry: Field[];
}

export interface Field {
	/** 表字段 ID，真实数据库字段 */
	id: string;
	/** 字段名 */
	name: string;
	/** 字段类型 */
	bizType: FieldType;
	dbType: FieldDBType;
	typeLabel: string;
	desc?: string;
}

interface SQL {
	/** SQL 语句 ID，在前端编辑页使用 */
	id: string;
	/** sql 语句标题 */
	title: string;
	/** 具体 sql 字符串 */
	sql: string;
}

export interface PageJson {
	entityAry: Entity[];
	serviceAry: SQL[];
}

export interface DatabaseInfo {
	host: string;
	username: string;
	password: string;
	database: string;
	port: string;
}

/** 模型表元信息记录 */
export interface TableMetaItem {
	/** meta 表 ID */
	id: number;
	/** 模型表真实表名 */
	table_name: string;
	/** 模型文件 ID */
	domain_file_id: number;
	/** 状态 */
	status: EffectStatus;
	/** 操作记录表ID */
	action_log_id: number;
	creator_id: string;
	create_time: number;
	/** 模型表元信息 */
	table_meta: string;
	/** 模型表操作记录 */
	action_log: string;
}

export interface ParseTableMeta {
	/** 表名 */
	name: string,
	/** 表备注信息 */
	comment: string,
	fields: Field[];
}

export interface ParseTableAction {
	actions: [
		{
			/** 操作对象，表格或者表格字段 */
			scope: 'table' | 'field',
			/** 操作类型 插入/修改/删除 */
			action: TableAction,
			/** 当操作对象为字段时存在，字段描述信息 */
			field: Field;
			/** 当操作对象为表格时存在 */
			table?: {
				name: string;
				comment: string;
			}
		}
	]
}

export type ParseTableMetaItem =
	Omit<TableMetaItem, 'table_meta' | 'action_log'>
	& { table_meta: ParseTableMeta; action_log: ParseTableAction };