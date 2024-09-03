/** 字段类型 */
export enum FieldType {
	STRING = 'string',
	NUMBER = 'number',
}

/** 数据库字段类型 */
export enum FieldDBType {
	VARCHAR = 'varchar',
	BIGINT = 'bigint',
	MEDIUMTEXT = 'mediumtext',
}

export enum TableAction {
	INSERT_FIELD = 'insert_field',
	MODIFY_FIELD = 'modify_field',
	DELETE_FIELD = 'delete_field',
	MODIFY_TABLE_COMMENT = 'modify_table_comment',
	MODIFY_TABLE = 'modify_table',
	INSERT_TABLE = 'insert_table',
	MODIFY_TABLE_NAME = 'modify_table_name',
	DELETE_TABLE = 'delete_table',
}

export enum TableActionScope {
	TABLE = 'table',
	FIELD = 'field',
}

export enum EffectStatus {
	EFFECT = 1,
	DELETE = -1,
}