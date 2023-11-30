// ⚠️⚠️⚠️ THIS FILE IS USED IN BOTH CT.JS CLIENT LIB AND CT.IDE
// DO NOT import any other ct.release files in this one, as it will import
// the rest of the client lib and break ct.IDE.
//
// `import type` is ok.

// TODO: make a custom class that will handle the randomized sounds
// to allow making them looping while still giving the user the ability
// to stop the sound at any time.

/* eslint no-use-before-define: 0 */
import {sound as pixiSound, filters as pixiSoundFilters, Filter, IMediaInstance, PlayOptions, Sound, SoundLibrary} from 'node_modules/@pixi/sound';
import type {webaudio} from 'node_modules/@pixi/sound/lib';
import type {ExportedSound} from '../node_requires/exporter/_exporterContracts';

import * as pixiMod from 'node_modules/pixi.js';
declare var PIXI: typeof pixiMod & {
    sound: typeof pixiSound & {
        filters: typeof pixiSoundFilters;
    }
};

// ⚠️ DO NOT put into res.ts, see the start of the file.
export const exportedSounds = [/*!@sounds@*/][0] as ExportedSound[] ?? [];
/** All the sound data objects exported from ct.IDE, mapped by their asset name. */
export const soundMap = {} as Record<string, ExportedSound>;
for (const exportedSound of exportedSounds) {
    soundMap[exportedSound.name] = exportedSound;
}
/**
 * A map of Sound instances of both exported sounds' variants
 * and user-loaded ones with res.loadSound.
 */
export const pixiSoundInstances = {} as Record<string, Sound>;

type FilterPreserved = Filter & {
    preserved: string;
};

type fxName = Exclude<keyof typeof pixiSoundFilters, 'Filter' | 'StreamFilter'>;
const fxNames = Object.keys(pixiSoundFilters)
.filter((name: keyof typeof pixiSoundFilters) => name !== 'Filter' && name !== 'StreamFilter');
const fxNamesToClasses = {} as {
    [T in fxName]: typeof pixiSoundFilters[T]
};
for (const fxName of fxNames) {
    fxNamesToClasses[fxName] = pixiSoundFilters[fxName];
}

/** A prefix for PIXI.Loader to distinguish between sounds and other asset types like textures. */
export const pixiSoundPrefix = 'pixiSound-';

const randomRange = (min: number, max: number): number => Math.random() * (max - min) + min;

/**
 * Applies a method onto a sound — regardless whether it is a sound exported from ct.IDE
 * (with variants) or imported by a user though `res.loadSound`.
 */
const withSound = <T>(name: string, fn: (sound: Sound) => T): T => {
    const pixiFind = pixiSound.find(name);
    if (pixiFind) {
        return fn(pixiFind);
    }
    if (name in pixiSoundInstances) {
        return fn(pixiSoundInstances[name]);
    } else if (name in soundMap) {
        for (const variant of soundMap[name].variants) {
            return fn(pixiSoundInstances[`${pixiSoundPrefix}${variant.uid}`]);
        }
    } else {
        throw new Error(`[sounds] Sound "${name}" was not found. Is it a typo?`);
    }
    return null;
};

/**
 * Plays a variant of a sound by applying randomized filters (if applicable)
 * as exported from ct.IDE.
 *
 * @param {string} name Sound's name
 */
export const playVariant = (
    sound: ExportedSound,
    variant: ExportedSound['variants'][0],
    options?: PlayOptions
): webaudio.WebAudioInstance => {
    const pixiSoundInst = pixiSound.find(`${pixiSoundPrefix}${variant.uid}`).play(options) as
        webaudio.WebAudioInstance;
    if (sound.volume?.enabled) {
        (pixiSoundInst as IMediaInstance).volume =
            randomRange(sound.volume.min, sound.volume.max) * (options?.volume || 1);
    } else if (options?.volume !== void 0) {
        (pixiSoundInst as IMediaInstance).volume = options.volume;
    }
    if (sound.pitch?.enabled) {
        (pixiSoundInst as IMediaInstance).speed =
            randomRange(sound.pitch.min, sound.pitch.max) * (options?.speed || 1);
    } else if (options?.speed !== void 0) {
        (pixiSoundInst as IMediaInstance).speed = options.speed;
    }
    if (sound.distortion?.enabled) {
        soundsLib.addDistortion(
            pixiSoundInst,
            randomRange(sound.distortion.min, sound.distortion.max)
        );
    }
    if (sound.reverb?.enabled) {
        soundsLib.addReverb(
            pixiSoundInst,
            randomRange(sound.reverb.secondsMin, sound.reverb.secondsMax),
            randomRange(sound.reverb.decayMin, sound.reverb.decayMax),
            sound.reverb.reverse
        );
    }
    if (sound.eq?.enabled) {
        soundsLib.addEqualizer(
            pixiSoundInst,
            ...(sound.eq.bands.map(band => randomRange(band.min, band.max)) as
                [number, number, number, number, number, number, number, number, number, number])
            // 🍝
        );
    }
    return pixiSoundInst;
};

export const playWithoutEffects = (
    sound: ExportedSound,
    variant: ExportedSound['variants'][0],
    options?: PlayOptions
): webaudio.WebAudioInstance => {
    const pixiSoundInst = pixiSound.find(`${pixiSoundPrefix}${variant.uid}`).play(options) as
        webaudio.WebAudioInstance;
    return pixiSoundInst;
};

export const playRandomVariant = (
    sound: ExportedSound,
    options?: PlayOptions
): webaudio.WebAudioInstance => {
    const variant = sound.variants[Math.floor(Math.random() * sound.variants.length)];
    return playVariant(sound, variant, options);
};

export const soundsLib = {
    /**
     * Preloads a sound. This is usually applied to music files before playing
     * as they are not preloaded by default.
     *
     * @param {string} name The name of a sound
     * @returns {Promise<string>} A promise that resolves into the name of the loaded sound asset.
     */
    async load(name: string): Promise<string> {
        const key = `${pixiSoundPrefix}${name}`;
        if (!PIXI.Assets.cache.has(key)) {
            throw new Error(`[sounds.load] Sound "${name}" was not found. Is it a typo? Did you mean to use res.loadSound instead?`);
        }
        await PIXI.Assets.load<Sound>(key);
        return name;
    },

    /**
     * Plays a sound.
     *
     * @param {string} name Sound's name
     * @param {PlayOptions} [options] Options used for sound playback.
     * @param {Function} options.complete When completed.
     * @param {number} options.end End time in seconds.
     * @param {filters.Filter[]} options.filters Filters that apply to play.
     * @param {Function} options.loaded If not already preloaded, callback when finishes load.
     * @param {boolean} options.loop Override default loop, default to the Sound's loop setting.
     * @param {boolean} options.muted If sound instance is muted by default.
     * @param {boolean} options.singleInstance Setting true will stop any playing instances.
     * @param {number} options.speed Override default speed, default to the Sound's speed setting.
     * @param {number} options.start Start time offset in seconds.
     * @param {number} options.volume Override default volume.
     * @returns Either a sound instance, or a promise that resolves into a sound instance.
     */
    play(name: string, options?: PlayOptions): Promise<IMediaInstance> | IMediaInstance {
        if (name in soundMap) {
            // Exported sounds
            const exported = soundMap[name];
            return playRandomVariant(exported, options);
        }
        if (name in pixiSoundInstances) {
            // User-loaded sounds
            return pixiSoundInstances[name].play(options);
        }
        throw new Error(`[sounds.play] Sound "${name}" was not found. Is it a typo?`);
    },

    /**
     * Stops a sound if a name is specified, otherwise stops all sound.
     *
     * @param {string|IMediaInstance} [name] Sound's name, or the sound instance.
     *
     * @returns {void}
     */
    stop(name?: string | IMediaInstance): void {
        if (name) {
            if (typeof name === 'string') {
                withSound(name, sound => sound.stop());
            } else {
                name.stop();
            }
        } else {
            PIXI.sound.stopAll();
        }
    },

    /**
     * Pauses a sound if a name is specified, otherwise pauses all sound.
     *
     * @param {string} [name] Sound's name
     *
     * @returns {void}
     */
    pause(name?: string): void {
        if (name) {
            withSound(name, sound => sound.pause());
        } else {
            PIXI.sound.pauseAll();
        }
    },

    /**
     * Resumes a sound if a name is specified, otherwise resumes all sound.
     *
     * @param {string} [name] Sound's name
     *
     * @returns {void}
     */
    resume(name?: string): void {
        if (name) {
            withSound(name, sound => sound.resume());
        } else {
            PIXI.sound.resumeAll();
        }
    },

    /**
     * Returns whether a sound with the specified name was added to the game.
     * This doesn't tell whether it is fully loaded or not, it only checks
     * for existance of sound's metadata in your game.
     *
     * @param {string} name Sound's name
     *
     * @returns {boolean}
     */
    exists(name: string): boolean {
        return (name in soundMap) || (name in pixiSoundInstances);
    },

    /**
     * Returns whether a sound is currently playing if a name is specified,
     * otherwise if any sound is currently playing.
     *
     * @param {string} [name] Sound's name
     *
     * @returns {boolean} `true` if the sound is playing, `false` otherwise.
     */
    playing(name?: string): boolean {
        if (!name) {
            return PIXI.sound.isPlaying();
        }
        if (name in pixiSoundInstances) {
            return pixiSoundInstances[name].isPlaying;
        } else if (name in soundMap) {
            for (const variant of soundMap[name].variants) {
                if (pixiSoundInstances[`${pixiSoundPrefix}${variant.uid}`].isPlaying) {
                    return true;
                }
            }
        } else {
            throw new Error(`[sounds] Sound "${name}" was not found. Is it a typo?`);
        }
        return false;
    },

    /**
     * Get or set the volume for a sound.
     *
     * @param {string|IMediaInstance} name Sound's name or instance
     * @param {number} [volume] The new volume where 1 is 100%.
     * If empty, will return the existing volume.
     *
     * @returns {number} The current volume of the sound.
     */
    volume(name: string | IMediaInstance, volume?: number): number {
        if (volume !== void 0) {
            if (typeof name === 'string') {
                withSound(name, sound => {
                    sound.volume = volume;
                });
            } else {
                (name as IMediaInstance).volume = volume;
            }
        }
        if (typeof name === 'string') {
            return withSound(name, sound => sound.volume);
        }
        return (name as IMediaInstance).volume;
    },

    /**
     * Set the global volume for all sounds.
     * @param {number} value The new volume where 1 is 100%.
     *
     */
    globalVolume(value: number): void {
        PIXI.sound.volumeAll = value;
    },

    /**
     * Fades a sound to a given volume. Can affect either a specific instance or the whole group.
     *
     * @param [name] Sound's name or instance to affect. If null, all sounds are faded.
     * @param [newVolume] The new volume where 1 is 100%. Default is 0.
     * @param [duration] The duration of transition, in milliseconds. Default is 1000.
     */
    fade(name?: string | IMediaInstance | SoundLibrary, newVolume = 0, duration = 1000): void {
        const start = {
            time: performance.now(),
            value: null
        };
        if (name) {
            start.value = soundsLib.volume(name as string | IMediaInstance);
        } else {
            start.value = PIXI.sound.context.volume;
        }
        const updateVolume = (currentTime: number) => {
            const elapsed = currentTime - start.time;
            const progress = Math.min(elapsed / duration, 1);
            const value = start.value + (newVolume - start.value) * progress;
            if (name) {
                soundsLib.volume(name as string | IMediaInstance, value);
            } else {
                soundsLib.globalVolume(value);
            }
            if (progress < 1) {
                requestAnimationFrame(updateVolume);
            }
        };
        requestAnimationFrame(updateVolume);
    },

    /**
     * Adds a filter to the specified sound and remembers its constructor name.
     * This method is not intended to be called directly.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     */
    addFilter(
        sound: false | string | Sound | webaudio.WebAudioInstance,
        filter: pixiSoundFilters.Filter
    ): void {
        const fx = filter as FilterPreserved;
        fx.preserved = fx.toString().slice(8, -1);
        if (sound === false) {
            PIXI.sound.filtersAll = [...(PIXI.sound.filtersAll || []), fx];
        } else if (typeof sound === 'string') {
            withSound(sound, soundInst => {
                soundInst.filters = [...(soundInst.filters || []), fx];
            });
        } else if (sound) {
            sound.filters = [...(sound.filters || []), fx];
        } else {
            throw new Error(`[sounds.addFilter] Invalid sound: ${sound}`);
        }
    },

    /**
     * Adds a distortion filter.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     * @param {number} amount The amount of distortion to set from 0 to 1. Default is 0.
     */
    addDistortion(
        sound: false | string | Sound | webaudio.WebAudioInstance,
        amount: number
    ): pixiSoundFilters.DistortionFilter {
        const fx = new PIXI.sound.filters.DistortionFilter(amount);
        soundsLib.addFilter(sound, fx);
        return fx;
    },

    /**
     * Adds an equalizer filter.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     * @param {number} f32 Default gain for 32 Hz. Default is 0.
     * @param {number} f64 Default gain for 64 Hz. Default is 0.
     * @param {number} f125 Default gain for 125 Hz. Default is 0.
     * @param {number} f250 Default gain for 250 Hz. Default is 0.
     * @param {number} f500 Default gain for 500 Hz. Default is 0.
     * @param {number} f1k Default gain for 1000 Hz. Default is 0.
     * @param {number} f2k Default gain for 2000 Hz. Default is 0.
     * @param {number} f4k Default gain for 4000 Hz. Default is 0.
     * @param {number} f8k Default gain for 8000 Hz. Default is 0.
     * @param {number} f16k Default gain for 16000 Hz. Default is 0.
     */

    // eslint-disable-next-line max-params
    addEqualizer(
        sound: false | string | Sound | webaudio.WebAudioInstance,
        f32: number,
        f64: number,
        f125: number,
        f250: number,
        f500: number,
        f1k: number,
        f2k: number,
        f4k: number,
        f8k: number,
        f16k: number
    ): pixiSoundFilters.EqualizerFilter {
        // eslint-disable-next-line max-len
        const fx = new PIXI.sound.filters.EqualizerFilter(f32, f64, f125, f250, f500, f1k, f2k, f4k, f8k, f16k);
        soundsLib.addFilter(sound, fx);
        return fx;
    },

    /**
     * Combine all channels into mono channel.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     */
    addMonoFilter(sound: false | string | Sound | webaudio.WebAudioInstance):
        pixiSoundFilters.MonoFilter {
        const fx = new PIXI.sound.filters.MonoFilter();
        soundsLib.addFilter(sound, fx);
        return fx;
    },

    /**
     * Adds a reverb filter.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     * @param {number} seconds Seconds for reverb. Default is 3.
     * @param {number} decay The decay length. Default is 2.
     * @param {boolean} reverse Reverse reverb. Default is false.
     */
    addReverb(
        sound: false | string | Sound | webaudio.WebAudioInstance,
        seconds: number,
        decay: number,
        reverse: boolean
    ): pixiSoundFilters.ReverbFilter {
        const fx = new PIXI.sound.filters.ReverbFilter(seconds, decay, reverse);
        soundsLib.addFilter(sound, fx);
        return fx;
    },

    /**
     * Adds a filter for stereo panning.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     * @param {number} pan The amount of panning: -1 is left, 1 is right. Default is 0 (centered).
     */
    addStereoFilter(
        sound: false | string | Sound | webaudio.WebAudioInstance,
        pan: number
    ): pixiSoundFilters.StereoFilter {
        const fx = new PIXI.sound.filters.StereoFilter(pan);
        soundsLib.addFilter(sound, fx);
        return fx;
    },

    /**
     * Adds a telephone-sound filter.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     */
    addTelephone(sound: false | string | Sound | webaudio.WebAudioInstance):
        pixiSoundFilters.TelephoneFilter {
        const fx = new PIXI.sound.filters.TelephoneFilter();
        soundsLib.addFilter(sound, fx);
        return fx;
    },

    /**
     * Remove a filter to the specified sound.
     *
     * @param {string} [name] The sound to affect. Can be a name of the sound asset
     * or the specific sound instance you get from running `sounds.play`.
     * If set to false, it affects all sounds.
     * @param {string} [filter] The name of the filter. If omitted, all the filters are removed.
     *
     * @returns {void}
     */
    removeFilter(name?: false | string | Sound | webaudio.WebAudioInstance, filter?: fxName): void {
        let filters: pixiSoundFilters.Filter[];
        if (!name) {
            filters = PIXI.sound.filtersAll;
        } else if (name && typeof name !== 'string') {
            ({filters} = name);
        }
        if (!filters && name) {
            if (typeof name === 'string') {
                // clear all variants' filters
                withSound(name, sound => {
                    soundsLib.removeFilter(sound, filter);
                });
                return;
            }
            soundsLib.removeFilter(name, filter);
            return;
        }
        if (filters && filters.length > 0) {
            if (!filter.includes('Filter')) {
                filter += 'Filter';
            }
            const copy = [...filters];
            if (filter) {
                filters.forEach((f: FilterPreserved, i: number) => {
                    if (f.preserved === filter) {
                        copy.splice(i, 1);
                    }
                });
            }
        }
    },

    /**
     * Set the speed (playback rate) of a sound.
     *
     * @param {string|IMediaInstance} name Sound's name or instance
     * @param {number} [value] The new speed, where 1 is 100%.
     * If empty, will return the existing speed value.
     *
     * @returns {number} The current speed of the sound.
     */
    speed(name: string | IMediaInstance, value?: number): number { // TODO: make an overload
        if (value) {
            if (typeof name === 'string') {
                withSound(name, sound => {
                    sound.speed = value;
                });
            } else {
                (name as IMediaInstance).speed = value;
            }
            return value;
        }
        if (typeof name === 'string') {
            if (name in soundMap) {
                // Return the speed of the first variant
                return pixiSoundInstances[soundMap[name as string].variants[0].uid].speed;
            }
            if (name in pixiSoundInstances) {
                return pixiSoundInstances[name as string].speed;
            }
            throw new Error(`[sounds.speed] Invalid sound name: ${name}. Is it a typo?`);
        }
        return name.speed;
    },

    /**
     * Set the global speed (playback rate) for all sounds.
     * @param {number} value The new speed, where 1 is 100%.
     *
     */
    speedAll(value: number): void {
        PIXI.sound.speedAll = value;
    },


    /**
    * Toggle muted property for all sounds.
    * @returns {boolean} `true` if all sounds are muted.
    */
    toggleMuteAll(): boolean {
        return PIXI.sound.toggleMuteAll();
    },

    /**
    * Toggle paused property for all sounds.
    * @returns {boolean} `true` if all sounds are paused.
    */
    togglePauseAll(): boolean {
        return PIXI.sound.togglePauseAll();
    }

};

export default soundsLib;
