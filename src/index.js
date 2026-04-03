/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

function successfullResponse(data, headers = {}) {
	return Response.json(
		{ success: true, data: data},
		{
			status: 200,
			headers,
		}
	)
}

function unsuccessfullResponse(status, message, headers = {}) {
	return Response.json(
		{
			success: false,
			error: { message }
		},
		{
			status,
			headers,
		}
	)
}

export default {
    async fetch(request, env) {
        const {pathname} = new URL(request.url);

		// Enforce edge rate limit
		const { success } = await env.cat_sounds_edge_rate_limit.limit({ key: "edge" }) // key can be any string of your choosing
		if (!success) {
			// Cloudflare .limit() returns only boolean at run time. So the limit numbers in error message are not dynamic.
			return new unsuccessfullResponse(429,"Rate limit for your region is 100 requests per 60 seconds");
		}

		// Get session id
		const cookies = request.headers.get('Cookie') || '';
		const match = cookies.match(/session_id=([^;]+)/);
		var sessionId = match ? match[1] : null;
		if (
			request.method === "GET" &&
			pathname !== "/api/session_id" &&
			!sessionId
		) {
			// Exception: Session id does not exists, but client is not requesting it
			return new unsuccessfullResponse(400,"First request and set to cookies a session id via GET /api/session_id");
		}

		// Rate limit per session id
		if (sessionId) {
			const { success } = await env.cat_sounds_session_rate_limit.limit({ key: sessionId })
			if (!success) {
				return new unsuccessfullResponse(429, "Rate limit per session is 10 requests per 60 seconds");
			}
		}

		// Only GET method allowed
		if ( request.method !== "GET" ) {
			return new unsuccessfullResponse(405, "Method not supported. Only GET is supported.", {"Allow": "GET"});
		}
		try {
			// Request session token
			// NOTE: Is it GET though?
			if (pathname === "/api/session_id") {
				if (sessionId) {
					// Session id has already been set.
					return new unsuccessfullResponse(400, "Session id has already been set.");
				}
				sessionId = crypto.randomUUID();
				// Set the cookie
				return new successfullResponse("Set session", {'Set-Cookie': `session_id=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`});
			}

			// CDN route (cached)
			if (pathname.startsWith("/cdn/")) {
				// Cache mp3 files to /cdn/<soundFileName path
				const key = pathname.replace("/cdn/", "");

				const object = await env.sound_files.get(key);

				if (!object) {
					return new unsuccessfullResponse(404, "Not found");
				}
				// object.body is binary file. Do not wrap in json
				return new Response(object.body, {
					status: 200,
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
				return new successfullResponse(result);
			}

			if (pathname === "/api/sounds/random") {
				// Return one random cat sound from the database (with hateoas links)
				const { results } = await env.cat_sounds_data
					.prepare("SELECT * FROM CatSounds ORDER BY RANDOM() LIMIT 1")
					.run();
				const item = results[0];
				return new successfullResponse({
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
				return new successfullResponse(result);
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
					return successfullResponse({
						_links: {
							self: pathname,
							randomItemFromAll: `${pathname}/random`,
						}
					});
				} else {
					// If group not found, return 404
					return new unsuccessfullResponse(404, "Not found");
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
					return successfullResponse({
						...item,
						SoundLink: `/cdn/${encodeURIComponent(item.SoundFileName)}`,
						_links: {
							self: pathname,
							randomFromAll: "/api/sounds/random",
						}
					});
				} else {
					// If group not found, return 404
					return new unsuccessfullResponse(404, "Not found");
				}
			}
		} catch (err) {
			return new unsuccessfullResponse(500, "Internal error");
		}
		

		// Default message if any other path
        return new Response(
			JSON.stringify({ error: "Not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
    },
};