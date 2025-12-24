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
			const { results } = await env.cat_sounds_data
				.prepare("SELECT * FROM CatSounds")
				.run();
			return Response.json(results);
		}

        return new Response(
            `Welcome to the D1 API Playground!
            \n\n${pathname}`,
        );
    },
};