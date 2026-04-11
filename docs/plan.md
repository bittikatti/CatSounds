# Overview

# Draft
[X] CatSounds REST API
[ ] Host API and restrict access to web app only

[ ] Cat responses as audio and text

[ ] Example HTML site to display CatSounds in action
    * Include permanent disclaimer to credit if Freesound is used: "This app uses sounds from Freesound.org."
    * TODO: How to gracefully credit each author of each sound? And keep the web app and the credits accessible? Should the full list be in some other page and that list be linked?

### Use case
1. User opens the chatbot in web app
2. If user does not have session id, request one (for rate limiting)
3. User "sends" message
4. Cat responds.
Repeat 3 and 4 with some wait to stay below the rate limit.

**Rate limit:**
* If edge rate limit is hit, show error message.
* If session rate limit is hit, wait and disable the client inputs during the wait.

## CatSounds REST API
+ Possible operations: GET
+ Keep it simple.
    + No queries
        + List resources can be used for an external query layer for whatever query needs there is or will be.
    + No options to exclude some ids from random
    + No other operations in addition to GET.
    + No authentication (for now at least)
    + No pagination (for now)
+ Do not cache random operations. Other requests can be cached (though would it improve anything in this case?)

### Resources

"-" or "_" in resource names instead of spaces

**Basic**
+ cat_bot_domain/documentation (Is this a good way to give the API's documentation?)
+ cat_bot_domain/sounds/random (one random cat sound from all available cat sounds)
+ cat_bot_domain/sounds/groups (list of available groups)
    + no random for this resource level (there will be random from all and random from a group, so why random from group**s**?).

**Groups**
+ cat_bot_domain/sounds/groups/aggressive (hiss, growling)
+ cat_bot_domain/sounds/groups/happy (purr, meow)
+ cat_bot_domain/sounds/groups/neutral (more meows)
+ cat_bot_domain/sounds/groups/other (snoring, using a litter box, eating)

**Further resources in the group**
+ cat_bot_domain/sounds/groups/\<group_list_name\> (list of all cat sounds in given group)
+ cat_bot_domain/sounds/groups/\<group_list_name\>/random (one random cat sound from the group)

### JSON structures of responses

Status codes:
1. 200 OK
2. Should something be returned if user tried to PUT, DELETE, POST or PATCH? If so, should it return
    + 403 FORBIDDEN
    + 405 METHOD NOT ALLOWED (Requires returned json to include list of possible operations)

**Only one sound**
Random.
+ cat_bot_domain/sounds/random

```yaml
Content-Type: "application/json"
{
    "Transcript": "Cat meowing",
    "SoundFileName": <Link to the sound file>,
    "SoundLicence": "c0",
    "SoundGroup": "happy",
    "links" : { # HATEOAS
    }
}
```
+ Similar response but different links from
    + cat_bot_domain/sounds/groups/<group_list_name>/random
    + cat_bot_domain/sounds/groups/<group_list_name>/

**List all**
+ cat_bot_domain/sounds

```yaml
Content-Type: "application/json"
{
    "list": [],
    "links" : { # HATEOAS
        "self" : "cat_bot_domain/sounds",
        "random" : "cat_bot_domain/sounds/random",
        "groups" : "cat_bot_domain/sounds/groups"
    }
}
```
+ cat_bot_domain/sounds/groups/\<group_list_name\>
```yaml
Content-Type: "application/json"
{
    "list": [],
    "links" : { # HATEOAS
        "self" : "cat_bot_domain/sounds/groups/<group_list_name>",
        "random" : "cat_bot_domain/sounds/groups/<group_list_name>/random",
    }
}
```

**List all in group**
+ cat_bot_domain/sounds/groups

### File structure

```text
CatSounds/
├── .gitignore
├── README.md
├── package.json
├── src/
│   ├── index.js
│   ├── controllers/
│   │   └── controller.js
│   │       GET for all routes
│   │       links to responses
│   ├── routes/
│   │   └── routes.js
│   │       sounds
│   │       sounds/random
│   │       sounds/groups
│   │       sounds/groups/<group_list_name>
│   │       sounds/groups/<group_list_name>/random
│   │       
│   ├── utils/
│   │   └── <logging?>
│   └── database/
│       └── <basically simple table to combine each sound transcription to its sound url>
├── test/
│   ├── unit_tests.js
│   ├── local_end_to_end_tests.js
│   └── cloudflare_end_to_end_tests.js
```

### Architecture
Store sound files in CloudFlare R2. Distribute via CloudFlare CDN.
* Use Cloudflare caching

Other data in CloudFlare D1. (autoincrementid in case database grows in the future)

REST API with CloudFlare workers

Rate limit

Random:
* Random from group or all
* If consecutive same responses bother, consider excluding previous response from next random pool.

## Legal specs
Intent is to allow others to use this code freely.
 -> MIT license?
 -> Check licenses of frameworks etc. before including into this.

Use (cat) sounds that are not copyrighted.
Record own cats.
Distribute the cat records as open.

Intent to maybe create openly available API? No.