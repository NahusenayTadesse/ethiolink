<script lang="ts">
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import RichEditor from '@nahu/admin-kit/formComponents/RichEditor.svelte';
	import * as Tabs from '@nahu/admin-kit/components/ui/tabs/index.js';
	import { LANGUAGES } from '$lib/translated';

	/**
	 * A page's text in the four site languages, one tab each: some single-line fields (a title) and
	 * one rich body. For news posts and job openings, which are too long for a dialog.
	 */
	type Line = { name: string; label: string; optional?: boolean; description?: string };

	let {
		form,
		errors,
		lines,
		rich
	}: {
		// The superforms stores. Fields are named at run time, and a store's type is invariant, so a
		// news form's stores could not be passed as a generic record's.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		form: any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		errors: any;
		lines: Line[];
		rich: { name: string; label: string; placeholder?: string };
	} = $props();

	const filled = (key: string) => String($form[key] ?? '').replace(/<[^>]*>/g, '').trim() !== '';
	const missing = (suffix: string) =>
		suffix !== 'En' &&
		[...lines.map((l) => l.name), rich.name].some((f) => filled(`${f}En`) && !filled(`${f}${suffix}`));
	const invalid = (suffix: string) =>
		[...lines.map((l) => l.name), rich.name].some((f) => $errors[`${f}${suffix}`]);
</script>

<Tabs.Root value="en" class="w-full">
	<Tabs.List class="w-full">
		{#each LANGUAGES as language (language.locale)}
			<Tabs.Trigger value={language.locale} class="gap-1.5">
				{language.name}
				{#if invalid(language.suffix)}
					<span class="size-1.5 rounded-full bg-destructive" title="Has an error"></span>
				{:else if missing(language.suffix)}
					<span class="size-1.5 rounded-full bg-warning" title="Not translated yet"></span>
				{/if}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#each LANGUAGES as language (language.locale)}
		{@const body = `${rich.name}${language.suffix}`}
		<Tabs.Content value={language.locale} class="pt-2" dir={language.locale === 'ar' ? 'rtl' : 'ltr'}>
			{#if language.locale !== 'en'}
				<p class="mb-2 text-xs text-muted-foreground">
					Leave this tab empty to show the English on the {language.name} site.
				</p>
			{/if}
			{#each lines as line (line.name)}
				<InputComp
					{form}
					{errors}
					name="{line.name}{language.suffix}"
					label="{line.label} ({language.name})"
					description={line.description}
					required={language.locale === 'en' && !line.optional}
				/>
			{/each}
			<RichEditor
				bind:value={$form[body]}
				name={body}
				label="{rich.label} ({language.name})"
				placeholder={rich.placeholder}
				error={$errors[body]?.[0]}
				contentClass="rich-text"
			/>
		</Tabs.Content>
	{/each}
</Tabs.Root>
