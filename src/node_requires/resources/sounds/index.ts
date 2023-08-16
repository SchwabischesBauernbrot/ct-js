const path = require('path'),
      fs = require('fs-extra');

import pixiSounds from 'node_modules/@pixi/sound';
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
 * Retrieves the full path to a thumbnail of a given texture.
 * @param {string|ISound} texture Either the id of the texture, or its ct.js object
 * @param {boolean} [x2] If set to true, returns a 128x128 image instead of 64x64.
 * @param {boolean} [fs] If set to true, returns a file system path, not a URI.
 * @returns {string} The full path to the thumbnail.
 */
const getThumbnail = (
    sound: assetRef | ISound,
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
        return `${global.projdir}/snd/${sound.uid}_prev${x2 ? '@2' : ''}.png`;
    }
    return `file:///${global.projdir.replace(/\\/g, '/')}/snd/${sound.uid}_prev${x2 ? '@2' : ''}.png`;
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
            bands: Array(10).map<randomized>(() => ({
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
            const sound = pixiSounds.Sound.from({
                url: file,
                preload: true,
                loaded: async () => {
                    const base = pixiSounds.utils.render(sound, {
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

const addSoundFile = async function addSoundFile(sound: ISound, file: string): Promise<void> {
    // TODO: remove the use of it
    try {
        sound.lastmod = Number(new Date());
        await fs.copy(file, (global as any).projdir + '/snd/s' + sound.uid + path.extname(file));
    } catch (e) {
        console.error(e);
        (window as Window).alertify.error(e);
        throw e;
    }
};

export {
    getThumbnail,
    makeThumbnail,
    getById,
    createNewSound,
    addSoundFile
};
