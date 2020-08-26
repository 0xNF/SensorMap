interface HubkitSubmission {
    readonly Name: string;
    readonly Address: string;
    readonly MapImage: string;
}

interface MapImage {
    readonly Url: string,
    readonly Height: number;
    readonly Width: number;
}

export {
    HubkitSubmission,
    MapImage
}