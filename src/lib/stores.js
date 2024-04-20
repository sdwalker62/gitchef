import { writable } from 'svelte/store';

/**
 * @typedef {import("@prisma/client").recipes} recipes
 */

/**
 * @type {import("svelte/store").Writable<recipes[]>}
 */
export let recipesArr = writable([]);
