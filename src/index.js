/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
    async fetch(request, env) {
        const {pathname} = new URL(request.url);

		// Enforce rate limit
		const { success } = await env.cat_sounds_edge_rate_limit.limit({ key: pathname }) // key can be any string of your choosing
		if (!success) {
			// Cloudflare .limit() returns only boolean at run time. So the limit numbers in error message are not dynamic.
			return new Response(
			JSON.stringify({ error: "Rate limit is 10 requests per 60 seconds" }), {
				status: 429,
				headers: { "Content-Type": "application/json" }
			});
		}

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
				// HATEOAS links
				const result = {
					_links: {
						self: pathname,
						randomItemFromAll: "/api/sounds/random",
						groups: "/api/sounds/groups",
					}
				};
				return Response.json(result);
			}

			if (pathname === "/api/sounds/random") {
				// Return one random cat sound from the database (with hateoas links)
				const { results } = await env.cat_sounds_data
					.prepare("SELECT * FROM CatSounds ORDER BY RANDOM() LIMIT 1")
					.run();
				const item = results[0];
				return Response.json({
					...item,
					SoundLink: `/cdn/${encodeURIComponent(item.SoundFileName)}`,
					_links: {
						self: pathname,
						randomItemFromGroup: `/api/sounds/groups/${encodeURIComponent(item.SoundGroup)}/random`,
					}
				});
			}

			if (pathname === "/api/sounds/groups") {
				// Return HATEOAS links to show the available groups
				const { results } = await env.cat_sounds_data
					.prepare("SELECT DISTINCT SoundGroup FROM CatSounds")
					.run();
				const result = {
					_links: {
						self: pathname,
					},
					_embedded: {
						groups:
							results.map(item => ({
								SoundGroup: item.SoundGroup,
								_links: {
									self: `/api/sounds/groups/${encodeURIComponent(item.SoundGroup)}`,
									randomItemFromGroup: `/api/sounds/groups/${encodeURIComponent(item.SoundGroup)}/random`
								}
							}))
					}
				}
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
					// HATEOAS links
					return Response.json({
						_links: {
							self: pathname,
							randomItemFromAll: `${pathname}/random`,
						}
					});
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
				// Return one random cat sound from the group
				var group = pathname.split("/")[4];
				// Find the group from the db
				const { results } = await env.cat_sounds_data
					.prepare(`SELECT * FROM CatSounds WHERE SoundGroup="${group}" ORDER BY RANDOM() LIMIT 1`)
					.run();
				// If found, return all
				if (results.length > 0 ) {
					const item = results[0];
					return Response.json({
						...item,
						SoundLink: `/cdn/${encodeURIComponent(item.SoundFileName)}`,
						_links: {
							self: pathname,
							randomFromAll: "/api/sounds/random",
						}
					});
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
				JSON.stringify({ error: "Internal error:" + err }),
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