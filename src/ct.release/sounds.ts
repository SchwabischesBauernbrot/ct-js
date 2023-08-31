/* eslint no-use-before-define: 0 */
import {sound as pixiSound, filters as pixiSoundFilters, Filter, IMediaInstance, PlayOptions, Sound, SoundLibrary} from 'node_modules/@pixi/sound';

import * as pixiMod from 'node_modules/pixi.js';
declare var PIXI: typeof pixiMod & {
    sound: typeof pixiSound & {
        filters: typeof pixiSoundFilters;
    }
};

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
type fxConstructorOptions = {
    [T in fxName]: ConstructorParameters<typeof pixiSoundFilters[T]>
}

export const sounds: Record<string, Sound> = {};

/**
 * Used for removing filter
 * @param {string} [name] The name of a sound to affect. If omitted, it affects all sounds.
 * @param {string} [filter] The name of the filter. If omitted, all filters are removed.
 * @returns An array of filter(s) (after the removal(s)) or null (if no filter remains).
 */
const remainingFilter = (
    name?: string | Sound,
    filter?: fxName
): Filter[] => {
    // eslint-disable-next-line no-nested-ternary
    const filters = name ? (typeof name === 'string' ? sounds[name as string].filters : name.filters) : PIXI.sound.filtersAll;
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
            return copy;
        }
    }
    return [];
};

export const pixiSoundPrefix = 'pixiSound-';

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
        if (!soundsLib.exists(name)) {
            throw new Error(`[sounds.play] Sound "${name}" was not found. Is it a typo?`);
        } else {
            return sounds[name].play(options);
        }
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
                PIXI.sound.stop(`${pixiSoundPrefix}${name}`);
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
            PIXI.sound.pause(`${pixiSoundPrefix}${name}`);
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
            PIXI.sound.resume(`${pixiSoundPrefix}${name}`);
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
        return (name in sounds);
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
        if (soundsLib.exists(name)) {
            const snd: Sound = sounds[name] as Sound;
            if (name) {
                return snd.isPlaying;
            }
            return PIXI.sound.isPlaying();
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
        const pixiName = `${pixiSoundPrefix}${name}`;
        if (volume) {
            if (typeof name === 'string') {
                PIXI.sound.volume(pixiName, volume);
            } else {
                (name as IMediaInstance).volume = volume;
            }
        }
        return typeof name === 'string' ? PIXI.sound.volume(pixiName) : (name as IMediaInstance).volume;
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
            if (typeof name === 'string') {
                start.value = sounds[name].volume;
            } else {
                start.value = (name as IMediaInstance).volume;
            }
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
     * Add a filter to the specified sound. Existing filters are:
     * DistortionFilter/EqualizerFilter/MonoFilter/ReverbFilter/StereoFilter/TelephoneFilter
     *
     * @param name The name of a sound to affect.
     * @param {fxName} filter The name of the filter.
     * @param {fxConstructorOptions[T]} args Arguments depending of the filter.
     */
    addFilter<T extends fxName>(
        sound: string | Sound,
        filter: T,
        ...args: fxConstructorOptions[T]
    ): void {
        const fx = new PIXI.sound.filters[filter as 'FilterPreserved'](...args);
        fx.preserved = filter;
        const snd = typeof sound === 'string' ? sounds[sound] : sound;
        if (!snd.filters || snd.filters.length === 0) {
            snd.filters = [fx];
        } else {
            const copy = snd.filters;
            snd.filters = [...copy, fx];
        }
    },

    /**
     * Add a filter to all sounds. Existing filters are:
     * DistortionFilter/EqualizerFilter/MonoFilter/ReverbFilter/StereoFilter/TelephoneFilter
     *
     * @param {fxName} filter The name of the filter.
     * @param {fxConstructorOptions[T]} args Arguments depending of the filter.
     *
     * @returns {void}
     */
    addFilterToAll<T extends fxName>(
        filter: T,
        ...args: fxConstructorOptions[T]
    ): void {
        const fx = new PIXI.sound.filters[filter as 'FilterPreserved'](...args);
        fx.preserved = filter;
        const copy = PIXI.sound.filtersAll;
        PIXI.sound.filtersAll = !PIXI.sound.filtersAll ? [fx] : [...copy, fx];
    },

    /**
     * Remove a filter to the specified sound.
     *
     * @param {string} name The name of a sound to affect.
     * @param {string} [filter] The name of the filter. If omitted, all filters are removed.
     *
     * @returns {void}
     */
    removeFilter(name: string | Sound, filter?: fxName): void {
        const filters: Filter[] = remainingFilter(name, filter);
        const snd = typeof name === 'string' ? sounds[name as string] : name;
        snd.filters = filters;
    },

    /**
     * Remove a filter added with addFilterToAll().
     *
     * @param {string} [filter] The name of the filter. If omitted, all filters are removed.
     *
     * @returns {void}
     */
    removeFilterFromAll(filter?: fxName): void {
        PIXI.sound.filtersAll = filter ? remainingFilter(null, filter) : [];
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
    speed(name: string | IMediaInstance, value?: number): number {
        const pixiName = `${pixiSoundPrefix}${name}`;
        if (value) {
            if (typeof name === 'string') {
                PIXI.sound.speed(pixiName, value);
            } else {
                (name as IMediaInstance).speed = value;
            }
        }
        return typeof name === 'string' ? PIXI.sound.speed(pixiName) : (name as IMediaInstance).speed;
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
     * Plays a variant of a sound by applying a small randomized speed value.
     *
     * @param {string} name Sound's name
     * @param {number} [deviation] A higher number means a bigger variant (depends also on sound).
     * @returns {void}
     */
    playVariant(name: string, deviation = 0.1): void {
        const ran = Math.random() * deviation * (Math.random() < 0.5 ? -1 : 1);
        soundsLib.play(name, {
            speed: 1 + ran
        });
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
