# Overview

# Draft
[] CatBot REST API

[] Cat responses as audio and text

[] Example HTML site to display CatBot in action

## CatBot REST API
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
+ cat_bot_domain/sounds (list of all available cat sounds)
+ cat_bot_domain/sounds/1 (cat sound of id 1)
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
+ cat_bot_domain/sounds/groups/\<group_list_name\>/2 (cat sound of id 2 from the group)

### JSON structures of responses

Status codes:
1. 200 OK
2. Should something be returned if user tried to PUT, DELETE, POST or PATCH? If so, should it return
    + 403 FORBIDDEN
    + 405 METHOD NOT ALLOWED (Requires returned json to include list of possible operations)

**Only one sound**
Random or specific id.
+ cat_bot_domain/sounds/1 or cat_bot_domain/sounds/random

```yaml
Content-Type: "application/json"
{
    "transcript": "Cat meowing",
    "soundFile": <Link to the sound file>,
    "license": "In case it really is necessary to include in the free sounds",
    "group": "happy",
    "links" : { # HATEOAS
        "self" : "cat_bot_domain/sounds/1",
        "selfInGroup" : "cat_bot_domain/sounds/groups/happy/1"
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

## Legal specs
Intent is to allow others to use this code freely.
 -> MIT license?
 -> Check licenses of frameworks etc. before including into this.

Use (cat) sounds that are not copyrighted.
Record own cats.
Distribute the cat records as open.

Intent to maybe create openly available API?