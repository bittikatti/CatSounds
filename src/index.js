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

		// Only GET method allowed
		if ( request.method !== "GET" ) {
			return new Response(
				JSON.stringify({ error: "Method not supported. Only GET is supported." }), {
					status: 405,
					headers: { "Allow": "GET", "Content-Type": "application/json" }
				});
		}

		// From the database
		if (pathname === "/api/sounds") {
			try {
				const { results } = await env.cat_sounds_data
					.prepare("SELECT * FROM CatSounds")
					.run();
				return Response.json(results);
			} catch (err) {
                return new Response(
                    JSON.stringify({ error: "Internal server error" }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }
		}

		// /api/sounds/random
		if (pathname === "/api/sounds/random") {
			try {
				const { results } = await env.cat_sounds_data
					.prepare("SELECT * FROM CatSounds ORDER BY RANDOM() LIMIT 1")
					.run();
				return Response.json(results[0]);
			} catch (err) {
                return new Response(
                    JSON.stringify({ error: "Internal server error" }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }
		}

		// /api/sounds/<id>
		if (pathname.match(/^\/api\/sounds\/([0-9]+)$/)) {
			var id = pathname.split("/").pop();
			try {
				// Find the id from the db
				const { results } = await env.cat_sounds_data
					.prepare(`SELECT * FROM CatSounds WHERE CatSoundID=${id}`)
					.run();
				// If found, return the first
				if (results.length == 1 ) {
					return Response.json(results[0]);
				} else {
					// If id not found, return 404
					return new Response(
						JSON.stringify({ error: "Not found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" }
						});
				}
			} catch (err) {
                return new Response(
                    JSON.stringify({ error: "Internal server error" }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }
		}

		// /api/sounds/groups
		if (pathname === "/api/sounds/groups") {
			// SELECT DISTINCT department FROM employees
			try {
				const { results } = await env.cat_sounds_data
					.prepare("SELECT DISTINCT SoundGroup FROM CatSounds")
					.run();
				// HATEOAS links to the results
				const result = results.map(item => ({
					SoundGroup: item.SoundGroup,
						_links: {
							soundsByGroup: {
								href: `/api/sounds/groups/${encodeURIComponent(item.SoundGroup)}`
							}
						}
					}));
				return Response.json(result);
			} catch (err) {
                return new Response(
                    JSON.stringify({ error: "Internal server error" }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }
		}

		// /api/sounds/groups/<group (e.g. happy)>
		if (pathname.match(/^\/api\/sounds\/groups\/([a-zA-Z]+)$/)) {
			var group = pathname.split("/").pop();
			try {
				// Find the group from the db
				const { results } = await env.cat_sounds_data
					.prepare(`SELECT * FROM CatSounds WHERE SoundGroup="${group}"`)
					.run();
				// If found, return all
				if (results.length > 0 ) {
					return Response.json(results);
				} else {
					// If group not found, return 404
					return new Response(
						JSON.stringify({ error: "Not found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" }
						});
				}
			} catch (err) {
                return new Response(
                    JSON.stringify({ error: "Internal server error" }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }
		}

		// /api/sounds/groups/<group (e.g. happy)>/random
		if (pathname.match(/^\/api\/sounds\/groups\/([a-zA-Z]+)\/random$/)) {
			var group = pathname.split("/")[4];
			try {
				// Find the group from the db
				const { results } = await env.cat_sounds_data
					.prepare(`SELECT * FROM CatSounds WHERE SoundGroup="${group}" ORDER BY RANDOM() LIMIT 1`)
					.run();
				// If found, return all
				if (results.length > 0 ) {
					return Response.json(results[0]);
				} else {
					// If group not found, return 404
					return new Response(
						JSON.stringify({ error: "Not found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" }
						});
				}
			} catch (err) {
                return new Response(
                    JSON.stringify({ error: "Internal server error" }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }
		}

		// Default message if any other path
        return new Response(
			JSON.stringify({ error: "Not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
    },
};