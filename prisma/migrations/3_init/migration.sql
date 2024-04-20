-- CreateTable
CREATE TABLE "recipes" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "region" TEXT,
    "prep_time" INTEGER,
    "cook_time" INTEGER,
    "total_time" INTEGER,
    "ingredients" JSONB,
    "directions" TEXT[],
    "notes" TEXT[],
    "nutrition" JSONB,
    "proteins" TEXT[],
    "vegetables" TEXT[],
    "fruits" TEXT[],
    "grains" TEXT[],
    "is_vegan" BOOLEAN,
    "is_vegetarian" BOOLEAN,
    "is_gluten_free" BOOLEAN,
    "is_dairy_free" BOOLEAN,
    "is_nut_free" BOOLEAN,
    "is_soy_free" BOOLEAN,
    "is_fish_free" BOOLEAN,
    "is_shellfish_free" BOOLEAN,
    "is_pork_free" BOOLEAN,
    "is_red_meat_free" BOOLEAN,
    "is_poultry_free" BOOLEAN,
    "is_grain_free" BOOLEAN,
    "is_egg_free" BOOLEAN,
    "is_sugar_free" BOOLEAN,
    "is_low_sodium" BOOLEAN,
    "is_low_fat" BOOLEAN,
    "is_low_carb" BOOLEAN,
    "is_high_protein" BOOLEAN,
    "is_organic" BOOLEAN,
    "is_paleo" BOOLEAN,
    "is_keto" BOOLEAN,
    "is_favorite" BOOLEAN,
    "servings" INTEGER,
    "rating" INTEGER,
    "necessary_tools" TEXT[],
    "name" TEXT,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipes_name_key" ON "recipes"("name");

