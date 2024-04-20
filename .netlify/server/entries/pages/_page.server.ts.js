import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function load() {
  const recipes = await db.recipes.findMany();
  return {
    recipes
  };
}
export {
  load
};
