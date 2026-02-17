const randomFromAllUrl = `/api/sounds/random`

export function HATEOASlinksToOneExact(item, randomFromAll=false) {
    if (typeof item !== "object") {
        throw new Error("Parameter needs to be array");
    }
    item.SoundLink = `/cdn/${encodeURIComponent(item.SoundFileName)}`;
    // HATEOAS links
    item._links = [
        {
            rel: "self",
            href: `/api/sounds/${encodeURIComponent(item.CatSoundID)}`
        },
        ...(randomFromAll ? [{
            rel: "randomFromAll",
            href: randomFromAllUrl
        }] : []),
        {
            rel: "randomFromGroup",
            href: `/api/sounds/groups/${encodeURIComponent(item.SoundGroup)}/random`
        }
    ];
    return item;
}

export function HATEOASlinksToOneRandom(item, pathname) {
    if (typeof item !== "object") {
        throw new Error("Parameter needs to be array");
    }
    item.SoundLink = `/cdn/${encodeURIComponent(item.SoundFileName)}`;

    // HATEOAS links
    // selfRandom is the pathname
    // if selfRandom is same as randomFromAll, do not include randomFromAll
    // Same with randomFromGroup
    const randomFromGroupUrl = `/api/sounds/groups/${encodeURIComponent(item.SoundGroup)}/random`

    item._links = [
        {
            rel: "selfRandom",
            href: pathname
        },
        ...(pathname != randomFromAllUrl ? [{
            rel: "randomFromAll",
            href: randomFromAllUrl
        }] : []),
        ...(pathname != randomFromGroupUrl ? [{
            rel: "randomFromGroup",
            href: randomFromGroupUrl
        }] : []),
        {
            rel: "selfExact",
            href: `/api/sounds/${encodeURIComponent(item.CatSoundID)}`
        }
    ];
    return item;
}