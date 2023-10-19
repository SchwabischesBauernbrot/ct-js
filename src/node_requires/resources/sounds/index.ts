const path = require('path'),
      fs = require('fs-extra');

import {sound, utils as pixiSoundUtils, Sound as pixiSoundSound} from 'node_modules/@pixi/sound';
import {Sprite, Texture, Application} from 'node_modules/pixi.js';
import {outputCanvasToFile} from '../../utils/imageUtils';

const getById = function getById(id: string): ISound {
    const sound = global.currentProject.sounds.find((s: ISound) => s.uid === id);
    if (!sound) {
        throw new Error(`Attempt to get a non-existent sound with ID ${id}`);
    }
    return sound;
};

/**
 * Retrieves the full path to a thumbnail of a given sound variation.
 * @param {string|ISound} sound Sound's name, or the sound instance.
 * @param {string|ISound} variantUid Variant's uid.
 * @param {boolean} [x2] If set to true, returns a 128x128 image instead of 64x64.
 * @param {boolean} [fs] If set to true, returns a file system path, not a URI.
 * @returns {string} The full path to the thumbnail.
 */
const getThumbnail = (
    sound: assetRef | ISound,
    variantUid: string,
    x2?: boolean,
    fs?: boolean
): string => {
    if (sound === -1) {
        return 'data/img/notexture.png';
    }
    if (typeof sound === 'string') {
        sound = getById(sound);
    }
    if (fs) {
        return `${global.projdir}/snd/s${sound.uid}_${variantUid}_prev${x2 ? '@2' : ''}.png`;
    }
    return `file:///${global.projdir.replace(/\\/g, '/')}/snd/s${sound.uid}_${variantUid}_prev${x2 ? '@2' : ''}.png`;
};

const createNewSound = function (name?: string): ISound {
    const generateGUID = require('./../../generateGUID');
    var id = generateGUID(),
        slice = id.slice(-6);
    const newSound: ISound = {
        name: name || ('Sound_' + slice),
        uid: id,
        type: 'sound' as resourceType,
        lastmod: Number(new Date()),
        preload: true,
        variants: [],
        distortion: {
            enabled: false,
            min: 0,
            max: 1
        },
        pitch: {
            enabled: false,
            min: 0,
            max: 1
        },
        reverb: {
            enabled: false,
            decayMin: 2,
            decayMax: 2,
            secondsMin: 2,
            secondsMax: 3,
            reverse: false
        },
        volume: {
            enabled: false,
            min: 0,
            max: 1
        },
        eq: {
            enabled: false,
            bands: Array(10).fill(({
                min: 0,
                max: 1
            }) as randomized) as eqBands
        }
    };
    global.currentProject.sounds.push(newSound);
    return newSound;
};

const makeThumbnail = (
    file: string,
    path: string,
    x2?: boolean
): Promise<string> => new Promise((resolve, reject) => {
    setTimeout(() => {
        try {
            const sound = pixiSoundSound.from({
                url: file,
                preload: true,
                loaded: async () => {
                    const base = pixiSoundUtils.render(sound, {
                        height: x2 ? 128 : 64,
                        width: x2 ? 128 : 64,
                        fill: 'white'
                    });
                    const waveform = new Sprite(new Texture(base));
                    const app = new Application();
                    app.stage.addChild(waveform);
                    waveform.updateTransform();
                    const canvas = await app.renderer.extract.canvas(waveform) as HTMLCanvasElement;
                    await outputCanvasToFile(canvas, path);
                    resolve(path);
                }
            });
        } catch (e) {
            reject(e);
        }
    }, 0);
});

export const getVariantBasePath = (sound: ISound, variant: ISound['variants'][0]): string =>
    `${global.projdir}/snd/s${sound.uid}_${variant.uid}`;
export const getVariantPath = (sound: ISound, variant: ISound['variants'][0]): string =>
    `${getVariantBasePath(sound, variant)}${path.extname(variant.source)}`;

const addSoundFile = async function addSoundFile(sound: ISound, file: string): Promise<void> {
    try {
        const generateGUID = require('./../../generateGUID');
        const uid = generateGUID();
        sound.lastmod = Number(new Date());
        const variant: soundVariant = {
            uid,
            source: file
        };
        sound.variants.push(variant);
        await fs.copy(file, getVariantPath(sound, variant));
        await this.makeThumbnail(file, `${getVariantBasePath(sound, variant)}_prev.png`);// TODO more sizes
    } catch (e) {
        console.error(e);
        (window as Window).alertify.error(e);
        throw e;
    }
};

const pixiSoundPrefix = 'pixiSound-';

const loadSound = (asset: ISound): void => {
    for (const variant of asset.variants) {
        const key = `${pixiSoundPrefix}${variant.uid}`;
        if (sound.exists(key)) {
            continue;
        }
        sound.add(key, {
            url: getVariantPath(asset, variant),
            preload: true
        });
    }
};

export {
    getThumbnail,
    makeThumbnail,
    getById,
    createNewSound,
    addSoundFile,
    loadSound
};
