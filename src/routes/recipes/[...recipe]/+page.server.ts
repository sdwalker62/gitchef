import { db } from '$lib/database';
import type { recipes } from '@prisma/client';

export async function load({ params }) {
	const recipe: recipes | null = await db.recipes.findFirst({
		where: { name: params.recipe }
	});
	return {
		recipe: recipe!
	};
}
