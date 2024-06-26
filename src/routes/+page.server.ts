import { db } from '$lib/database';
import type { recipes } from '@prisma/client';

export async function load() {
	const dbRecipes: recipes[] = await db.recipes.findMany({
		cacheStrategy: { ttl: 60 }
	});
	return {
		recipes: dbRecipes
	};
}
