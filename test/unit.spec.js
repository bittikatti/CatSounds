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
        const request = new IncomingRequest(
            "http://example.com/api/sounds",
            {headers: {Cookie: 'session_id=test-session'}}
        );
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
        const request = new IncomingRequest(
            "http://example.com/api/resource", {
            method: 'PUT',
            headers: {Cookie: 'session_id=test-session'},
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
        const request = new IncomingRequest(
            "http://example.com/api/sounds/random",
            {headers: {Cookie: 'session_id=test-session'}}
        );
        // Create an empty context to pass to `worker.fetch()`
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(200);
        const responseJson = await response.json();
        expect(responseJson["success"]).toBe(true);
        expect(responseJson["data"]).to.contain.keys([
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
        const request = new IncomingRequest(
            "http://example.com/api/sounds/groups",
            {headers: {Cookie: 'session_id=test-session'}}
        );
        // Create an empty context to pass to `worker.fetch()`
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body["data"]).to.have.property("_links");
        // check keys
        expect(body["data"]).to.have.property("_embedded");
        expect(body["data"]._embedded).to.have.property("groups");
        expect(body["data"]._embedded.groups[0]).to.have.property("SoundGroup");
        expect(body["data"]._embedded.groups[0]).to.have.property("_links");
    });
});

describe("local worker finds happy from groups", () => {
    it("responds", async () => {
        const request = new IncomingRequest(
            "http://example.com/api/sounds/groups/happy",
            {headers: {Cookie: 'session_id=test-session'}}
        );
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
        const request = new IncomingRequest(
            "http://example.com/api/sounds/groups/monster",
            {headers: {Cookie: 'session_id=test-session'}}
        );
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
        const request = new IncomingRequest(
            "http://example.com/api/sounds/groups/happy/random",
            {headers: {Cookie: 'session_id=test-session'}}
        );
        // Create an empty context to pass to `worker.fetch()`
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(200);
        const responseJson = await response.json();
        expect(responseJson["success"]).toBe(true);
        expect(await responseJson["data"]).to.contain.keys([
            "CatSoundID",
            "Transcript",
            "SoundGroup", 
            "SoundFileName",
            "SoundLicence",
            "OriginalLink"
        ]);
    });
});