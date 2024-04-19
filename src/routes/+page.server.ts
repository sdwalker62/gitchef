import { db } from '$lib/database';

export async function load() {
	const recipes = await db.recipes.findMany();
	return {
		recipes: recipes
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
