/**
 * A refused write as an answer the page can show: the reason under its field and as the form's
 * message, a 400 — never a 500.
 */
import { fail } from '@sveltejs/kit';
import { message, setError, type SuperValidated } from 'sveltekit-superforms';
import { WriteRefused } from '@nahu/admin-kit/server/childCrud';

type Message = { type: 'success' | 'error'; text: string };

export function refusedForm<T extends Record<string, unknown>>(
	form: SuperValidated<T, Message>,
	err: unknown
) {
	if (err instanceof WriteRefused) {
		if (err.field) setError(form, err.field as never, err.message);
		return message(form, { type: 'error', text: err.message }, { status: 400 });
	}
	throw err;
}

/** For a plain action (`ConfirmAction`): the refusal as the message the page toasts. */
export function refusedPlain(err: unknown) {
	if (err instanceof WriteRefused) {
		return fail(400, { message: { type: 'error', text: err.message } satisfies Message });
	}
	throw err;
}
