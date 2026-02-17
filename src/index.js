/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { HATEOASlinksToOneExact } from './json_structure.js'

export default {
    async fetch(request, env) {
        const {pathname} = new URL(request.url);

		// Only GET method allowed
		if ( request.method !== "GET" ) {
			return new Response(
				JSON.stringify({ error: "Method not supported. Only GET is supported." }), {
					status: 405,
					headers: { "Allow": "GET", "Content-Type": "application/json" }
				});
		}
		try {
			// 1. CDN route (cached)
			if (pathname.startsWith("/cdn/")) {
				// Cache mp3 files to /cdn/<soundFileName path
				const key = pathname.replace("/cdn/", "");

				const object = await env.sound_files.get(key);

				if (!object) {
					return new Response("Not found", { status: 404 });
				}

				return new Response(object.body, {
					headers: {
					"Content-Type": object.httpMetadata?.contentType || "audio/mpeg",
					"Cache-Control": "public, max-age=31536000, immutable"
					}
				});
			}

			// From the database
			if (pathname === "/api/sounds") {
				const { results } = await env.cat_sounds_data
					.prepare("SELECT * FROM CatSounds")
					.run();
				
				// HATEOAS links to the results
				const result = results.map(item => (
					HATEOASlinksToOneExact(item, true)
				));
				return Response.json(result);
			}

			if (pathname === "/api/sounds/random") {
				const { results } = await env.cat_sounds_data
					.prepare("SELECT * FROM CatSounds ORDER BY RANDOM() LIMIT 1")
					.run();
				
				// HATEOAS links to the results
				const result = results.map(item => ({
					...item,
					SoundLink: `/cdn/${encodeURIComponent(item.SoundFileName)}`,
					_links: [
						{
							rel: "selfRandom",
							href: pathname
						},
						{
							rel: "selfExact",
							href: `/api/sounds/${encodeURIComponent(item.CatSoundID)}`
						},
						{
							rel: "randomFromGroup",
							href: `/api/sounds/groups/${encodeURIComponent(item.SoundGroup)}/random`
						}
					]
				}))[0];
				return Response.json(result);
			}

			// /api/sounds/<id>
			if (pathname.match(/^\/api\/sounds\/([0-9]+)$/)) {
				var id = pathname.split("/").pop();
				// Find the id from the db
				const { results } = await env.cat_sounds_data
					.prepare(`SELECT * FROM CatSounds WHERE CatSoundID=${id}`)
					.run();
				// If found, return the first
				if (results.length == 1 ) {
					const result = HATEOASlinksToOneExact(results[0], true);
					return Response.json(result);
				} else {
					// If id not found, return 404
					return new Response(
						JSON.stringify({ error: "Not found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" }
						});
				}
			}

			if (pathname === "/api/sounds/groups") {
				const { results } = await env.cat_sounds_data
					.prepare("SELECT DISTINCT SoundGroup FROM CatSounds")
					.run();
				// HATEOAS links to the results
				const result = results.map(item => ({
					SoundGroup: item.SoundGroup,
						_links: [
							{
								rel: "soundsByGroup",
								href: `/api/sounds/groups/${encodeURIComponent(item.SoundGroup)}`
							},
							{
								rel: "randomFromGroup",
								href: `/api/sounds/groups/${encodeURIComponent(item.SoundGroup)}/random`
							}
						]
					}));
				return Response.json(result);
			}

			// /api/sounds/groups/<group (e.g. happy)>
			if (pathname.match(/^\/api\/sounds\/groups\/([a-zA-Z]+)$/)) {
				var group = pathname.split("/").pop();
				// Find the group from the db
				const { results } = await env.cat_sounds_data
					.prepare(`SELECT * FROM CatSounds WHERE SoundGroup="${group}"`)
					.run();
				// If found, return all
				if (results.length > 0 ) {
					// HATEOAS links to the results
					const result = HATEOASlinksToOneExact(results[0]);
					return Response.json(result);
				} else {
					// If group not found, return 404
					return new Response(
						JSON.stringify({ error: "Not found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" }
						});
				}
			}

			// /api/sounds/groups/<group (e.g. happy)>/random
			if (pathname.match(/^\/api\/sounds\/groups\/([a-zA-Z]+)\/random$/)) {
				var group = pathname.split("/")[4];
				// Find the group from the db
				const { results } = await env.cat_sounds_data
					.prepare(`SELECT * FROM CatSounds WHERE SoundGroup="${group}" ORDER BY RANDOM() LIMIT 1`)
					.run();
				// If found, return all
				if (results.length > 0 ) {
					// HATEOAS links to the results
					const result = results.map(item => ({
						...item,
						SoundLink: `/cdn/${encodeURIComponent(item.SoundFileName)}`,
						_links: [
							{
								rel: "self",
								href: pathname
							},
							{
								rel: "exactSelf",
								href: `/api/sounds/${encodeURIComponent(item.CatSoundID)}`
							}
						]
					}))[0];
					return Response.json(result);
				} else {
					// If group not found, return 404
					return new Response(
						JSON.stringify({ error: "Not found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" }
						});
				}
			}
		} catch (err) {
			return new Response(
				JSON.stringify({ error: "Internal error" }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
		

		// Default message if any other path
        return new Response(
			JSON.stringify({ error: "Not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
    },
};