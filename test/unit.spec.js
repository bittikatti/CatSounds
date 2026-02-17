import {
    env,
    createExecutionContext,
    waitOnExecutionContext,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
// Import your worker so you can unit test it
import worker from "../src";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request;

describe("local worker alive", () => {
    it("responds", async () => {
        const request = new IncomingRequest("http://example.com/api/sounds");
        // Create an empty context to pass to `worker.fetch()`
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(200);
    });
});

describe("local worker denies PUT", () => {
    it("responds", async () => {
        const request = new IncomingRequest('http://example.com/api/resource', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'value' }),
        });
        // Create an empty context to pass to `worker.fetch()`
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(405);
    });
});

describe("local worker returns random sound", () => {
    it("responds", async () => {
        const request = new IncomingRequest("http://example.com/api/sounds/random");
        // Create an empty context to pass to `worker.fetch()`
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(200);
        expect(await response.json()).to.contain.keys([
            "CatSoundID",
            "Transcript",
            "SoundGroup", 
            "SoundFileName",
            "SoundLicence",
            "OriginalLink"
        ]);
    });
});

describe("local worker finds groups", () => {
    it("responds", async () => {
        const request = new IncomingRequest("http://example.com/api/sounds/groups");
        // Create an empty context to pass to `worker.fetch()`
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body).to.have.property("_links");
        // check keys
        expect(body).to.have.property("_embedded");
        expect(body._embedded).to.have.property("groups");
        expect(body._embedded.groups[0]).to.have.property("SoundGroup");
        expect(body._embedded.groups[0]).to.have.property("_links");
    });
});

describe("local worker finds happy from groups", () => {
    it("responds", async () => {
        const request = new IncomingRequest("http://example.com/api/sounds/groups/happy");
        // Create an empty context to pass to `worker.fetch()`
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(200);
    });
});

describe("local worker does not find monster from groups", () => {
    it("responds", async () => {
        const request = new IncomingRequest("http://example.com/api/sounds/groups/monster");
        // Create an empty context to pass to `worker.fetch()`
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(404);
    });
});

describe("local worker returns random from happy", () => {
    it("responds", async () => {
        const request = new IncomingRequest("http://example.com/api/sounds/groups/happy/random");
        // Create an empty context to pass to `worker.fetch()`
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(200);
        expect(await response.json()).to.contain.keys([
            "CatSoundID",
            "Transcript",
            "SoundGroup", 
            "SoundFileName",
            "SoundLicence",
            "OriginalLink"
        ]);
    });
});