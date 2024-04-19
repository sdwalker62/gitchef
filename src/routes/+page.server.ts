import { db } from '$lib/database';

export async function load() {
	const employees = await db.employees.findMany();
	console.log(employees);
	return {
		employees: employees[0]
	};
}

// main()
// 	.then(async () => {
// 		await db.$disconnect();
// 	})
// 	.catch(async (e) => {
// 		console.error(e);
// 		await db.$disconnect();
// 		process.exit(1);
// 	});
