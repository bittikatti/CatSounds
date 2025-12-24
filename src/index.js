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

		// /api/sounds/groups

		// /api/sounds/groups/<group (e.g. happy)>

		// /api/sounds/groups/<group (e.g. happy)>/random

		// /api/sounds/groups/<group (e.g. happy)>/<id?>

		// Default message if any other path
        return new Response(
			JSON.stringify({ error: "Not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
    },
};