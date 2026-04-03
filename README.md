# CatBot

Like ChatBot but CatBot at first glance.

## What is this 'bot'
* Cat like response upon request.
* Randomly selected response.
* API

# Technical specifications
## Cloudflare
* As cloudflare worker
* Data in Cloudflare D1

## Rate limiting
The calls to the api are rate limited to 10 requests per 60 seconds.

Currently per cloudflare edge location (multiple clients)