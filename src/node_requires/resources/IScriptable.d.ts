interface IScriptableEvent {
    lib: 'core' | string;
    arguments: {
        [key: string]: assetRef | string | number | boolean;
    };
    code: string;
    eventKey: string;
}

/** Describes an asset that supports scripting through ct.js events */
interface IScriptable extends IAsset {
    name: string;
    events: IScriptableEvent[];
}
