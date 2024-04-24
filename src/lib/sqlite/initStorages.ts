import type { TableStructure } from '../../routes/api/data/types';
import { sendMsgToWorker } from './messageBus';
import {
	WorkerMessageTypes,
	type WorkerMessage,
	type TableExistsResponseData,
	type CreateTableRequestData
} from './types';

const storages = ['recipes_v1'];

async function getStructure(storage: string): Promise<TableStructure> {
	const res = await fetch(`/api/data/${storage}/structure`);
	const data = (await res.json()) as TableStructure;
	return data;
}

async function createStorage(storage: string, structure: TableStructure) {
	const res = (await sendMsgToWorker({
		storageId: storage,
		type: WorkerMessageTypes.CREATE_TABLE,
		expectedType: WorkerMessageTypes.CREATE_TABLE_RESPONSE,
		data: { structure } as CreateTableRequestData
	})) as WorkerMessage<TableExistsResponseData>;

	if (res.data.errorMsg) throw new Error(res.data.errorMsg);
}

export default async function initStorages() {
	for (const storageId of storages) {
		const res = (await sendMsgToWorker({
			storageId,
			type: WorkerMessageTypes.TABLE_EXISTS,
			expectedType: WorkerMessageTypes.TABLE_EXISTS_RESPONSE,
			data: undefined
		})) as WorkerMessage<TableExistsResponseData>;

		if (res.data.errorMsg) throw new Error(res.data.errorMsg);

		if (res.data.tableExists) {
			console.log(`Table ${storageId} exists. Has data: ${res.data.hasData}`);
		} else {
			const structure = await getStructure(storageId);
			console.log(`Table ${storageId} does not exist. Creating...`, structure);
			await createStorage(storageId, structure);
		}
	}
}
