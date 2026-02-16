export function HATEOASlinksToOneRandom(item) {
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
        {
            rel: "randomFromAll",
            href: `/api/sounds/random`
        },
        {
            rel: "randomFromGroup",
            href: `/api/sounds/groups/${encodeURIComponent(item.SoundGroup)}/random`
        }
    ];
    return item;
}