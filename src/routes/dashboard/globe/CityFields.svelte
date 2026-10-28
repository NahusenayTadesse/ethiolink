<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import type { z } from 'zod';
	import type { globeCitySchema } from './schema';

	type Form = SuperForm<z.input<typeof globeCitySchema>>;
	let { form, errors }: { form: Form['form']; errors: Form['errors'] } = $props();
</script>

<InputComp {form} {errors} name="id" type="hidden" />
<div class="grid gap-x-4 sm:grid-cols-2">
	<InputComp {form} {errors} name="nameEn" label="Name in English" required />
	<InputComp {form} {errors} name="nameAm" label="Name in Amharic" required />
	<InputComp {form} {errors} name="nameZh" label="Name in Chinese" required />
	<InputComp {form} {errors} name="nameAr" label="Name in Arabic" required />
	<InputComp
		{form}
		{errors}
		name="latitude"
		type="number"
		step="any"
		min="-90"
		max="90"
		label="Latitude"
		description="North is positive, e.g. 25.2 for Dubai."
		required
	/>
	<InputComp
		{form}
		{errors}
		name="longitude"
		type="number"
		step="any"
		min="-180"
		max="180"
		label="Longitude"
		description="East is positive, e.g. 55.3 for Dubai."
		required
	/>
</div>
<InputComp {form} {errors} name="active" type="checkboxSingle" placeholder="Show on the globe" />
