import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('Hello World worker', () => {
	it('responds with welcome (unit style)', async () => {
		const request = new Request(
			'http://example.com/api/sounds',
			{
				headers: {
					Cookie: 'session_id=test-session'
				}
			}
		);
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(await response.text()).toContain("_links");
	});
	/* SELF environment does not have rate limiting bindings, not even the mocked ones
	it('responds with welcome (integration style)', async () => {
		const sessionIdResponse = await SELF.fetch(
			"http://example.com/api/session_id"
		)

		const response = await SELF.fetch(
			'http://example.com/api/sounds'
		);
		const responseJson = await response.json();
		expect(responseJson["data"]).toContain("_links");
	});
	*/
});
