export function HATEOASlinksToOneItem(item, pathname, partOfAll=false) {
    if (typeof item !== "object") {
        throw new Error("Parameter needs to be array");
    }
    item.SoundLink = `/cdn/${encodeURIComponent(item.SoundFileName)}`;

    // HATEOAS links
    // selfRandom is the pathname
    // if selfRandom is same as randomFromAll, do not include randomFromAll
    // Same with randomFromGroup
    const randomFromAllUrl = `/api/sounds/random`;
    const randomFromGroupUrl = `/api/sounds/groups/${encodeURIComponent(item.SoundGroup)}/random`;
    const selfExact = `/api/sounds/${encodeURIComponent(item.CatSoundID)}`;
    
    // Presumably self link is same as pathname
    var selfLink = pathname;
    // If this is only one item of list of items, self should be selfExact 
    if (partOfAll) {
        selfLink = selfExact;
    }
    item._links = [
        {
            rel: "self",
            href: selfLink
        },
        ...(pathname != randomFromAllUrl ? [{
            rel: "randomFromAll",
            href: randomFromAllUrl
        }] : []),
        ...(pathname != randomFromGroupUrl ? [{
            rel: "randomFromGroup",
            href: randomFromGroupUrl
        }] : []),
        ...(selfLink != selfExact ? [{
            rel: "selfExact",
            href: selfExact
        }] : []),
    ];
    return item;
}