import type { ColType, TableStructure } from '../../../../routes/api/data/types';

/*
Translates JS types to SQL types
*/
function getDataType(coltype: ColType): string {
	switch (coltype) {
		case 'string':
			return 'text';
		case 'number':
			return 'real';
		default:
			throw new Error(`Unknown column type: ${coltype}`);
	}
}

/*
Creates a SQL statement from the provided table structure
*/
export default function genTabSrc(storageId: string, structure: TableStructure) {
	let statement = `Create Table ${storageId} (`;

	const atomics: string[] = [];

	for (const col of structure.columns) {
		atomics.push(`${col.name} ${getDataType(col.type)}`);
	}

	atomics.push(`PRIMARY KEY (${structure.pkColumn})`);

	statement += `   ${atomics.join(', ')}    ) strict;`;

	return statement;
}
