import {Sprite, Texture, Application} from 'node_modules/pixi.js';
import {utils as pixiSoundUtils, Sound as pixiSoundSound} from 'node_modules/@pixi/sound';
import {getVariantPath} from '../sounds';
import {outputCanvasToFile} from '../../utils/imageUtils';
import {join} from 'path';

export class SoundPreviewer {
    static get(sound: ISound, fileSys?: boolean | 'last', variantUid?: string, long?: boolean): string {
        if (!variantUid) {
            variantUid = sound.variants[0].uid;
        }
        const basename = `snd${sound.uid}_${variantUid}${long ? '_long' : ''}.png`;
        if (fileSys) {
            if (fileSys === 'last') {
                return `snd${sound.uid}.png`;
            }
            return join(global.projdir, 'prev', basename);
        }
        return `file://${global.projdir.replace(/\\/g, '/')}/prev/${basename}?cache=${sound.lastmod}`;
    }

    static getClassic(sound: ISound, _x2: boolean, fileSys: boolean): string {
        return SoundPreviewer.get(sound, fileSys);
    }

    static retain(_sounds: ISound[]): string[] {
        return [];
    }

    static retainPreview(sounds: ISound[]): string[] {
        const filenames: string[] = [];
        for (const sound of sounds) {
            for (const variant of sound.variants) {
                filenames.push(SoundPreviewer.get(sound, 'last', variant.uid));
                filenames.push(SoundPreviewer.get(sound, 'last', variant.uid, true));
            }
        }
        return filenames;
    }

    static create(soundAsset: ISound, variant?: ISound['variants'][0], long?: boolean): Promise<HTMLCanvasElement> {
        return new Promise<HTMLCanvasElement>((resolve) => {
            const soundInstance = pixiSoundSound.from({
                url: getVariantPath(soundAsset, variant || soundAsset.variants[0]),
                preload: true,
                loaded: async () => {
                    const base = pixiSoundUtils.render(soundInstance, {
                        height: long ? 100 : 128,
                        width: long ? 960 : 128,
                        fill: 'red'
                    });
                    const waveform = new Sprite(new Texture(base));
                    const app = new Application();
                    app.stage.addChild(waveform);
                    waveform.updateTransform();
                    const canvas = await app.renderer.extract.canvas(waveform) as HTMLCanvasElement;
                    resolve(canvas);
                }
            });
        });
    }

    static save(sound: ISound, variant?: ISound['variants'][0]): Promise<string> {
        if (variant) {
            return Promise.all([
                SoundPreviewer.create(sound, variant, false),
                SoundPreviewer.create(sound, variant, true)
            ])
            .then((canvases) => Promise.all(canvases.map((canvas, id) =>
                outputCanvasToFile(canvas, SoundPreviewer.get(
                    sound,
                    true,
                    variant.uid,
                    Boolean(id)
                )))))
            .then(() => SoundPreviewer.get(sound, true, variant.uid, false));
        }
        return Promise.all(sound.variants.map((variant) =>
            SoundPreviewer.save(sound, variant)))
        .then(() => SoundPreviewer.get(sound, true));
    }
}
