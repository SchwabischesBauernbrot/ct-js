import {sound as pixiSound, filters as pixiSoundFilters, Filter, IMediaInstance, PlayOptions, Sound} from 'node_modules/@pixi/sound';
import resLib from 'res';

import * as pixiMod from 'node_modules/pixi.js';
declare var PIXI: typeof pixiMod & {
    sound: typeof pixiSound & {
        filters: typeof pixiSoundFilters;
    }
};

const fx = [
    'Telephone',
    'Distortion',
    'Stereo',
    'Reverb',
    'Equalizer',
];

const createFilter = (soundName: string, filter: string, ...args: Array<number | boolean>): void => {
    //@ts-ignore
    const fx = new PIXI.sound.filters[`${filter}Filter` as 'Filter'](...args);// Seems there is no solution to type it properly
    const snd: Sound = resLib.sounds[soundName] as Sound;
    if (snd.filters === undefined) {
        snd.filters = [fx];
    } else {
        snd.filters.push(fx);
    }
};

export const soundsLib: Record<string, any> = {
    /**
     * Creates a new Sound object and puts it in resource object
     *
     * @param {string} name Sound's name
     * @param {Object} options An options object
     *
     * @returns {Object} Sound's object
     */

    // TODO
    // init(name: string, options: ArrayBuffer | AudioBuffer | String | Options | HTMLAudioElement): Sound {
    //     const asset = sound.add(name, options);
    //     resLib.sounds[name] = asset;
    // },

    // TODO: what to do with this?
    /**
     * Preloads a sound. This is usually applied to music files before playing
     * as they are not preloaded by default.
     *
     * @param {string} name The name of a sound
     * @returns {void}
     */
    // ct.sound.load = function load(name) {
    //     ct.res.sounds[name].load();
    // };


    // TODO: doc, options, callback
    /**
     * Plays a sound.
     *
     * @param {string} name Sound's name
     *
     * @returns {void}
     */
    // play(name: string, options?: PlayOptions | Function ): void {
    //     //@ts-ignore
    //     sound.play(name, options);// TODO: find a solution for options
    // },
    async play(name: string, options?: PlayOptions | Function): Promise<IMediaInstance> {
        //@ts-ignore
        return (await sound.play(name, options) as IMediaInstance);// TODO: find a solution for options
        // TODO: idk why, but in the editor, return is a WebAudioInstance not an IMediaInstance so it doesn't have the expected methods
    },

    /**
     * Stops a sound if a name is specified, otherwise stops all sound.
     *
     * @param {string} name Sound's name
     * 
     * @returns {void}
     */
    stop(name?: string | IMediaInstance): void {
        if (name) {
            if (typeof name === 'string') {
                PIXI.sound.stop(name);
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
     * @param {string} name Sound's name
     * 
     * @returns {void}
     */
    pause(name?: string): void {
        if (name) {
            //if(this.playing(name)) {
            PIXI.sound.pause(name);
            //}
        } else {
            //if(this.playing()) {
            PIXI.sound.pauseAll();
            //}
        }
    },

    /**
     * Resumes a sound if a name is specified, otherwise resumes all sound.
     *
     * @param {string} name Sound's name
     * 
     * @returns {void}
     */
    resume(name?: string): void {
        if (name) {
            PIXI.sound.resume(name);
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
        return (name in resLib.sounds);
    },

    /**
     * Returns whether a sound is currently playing if a name is specified, otherwise if any sound is currently playing,
     * either an exact sound (found by its ID) or any sound of a given name.
     *
     * @param {string} name Sound's name
     * 
     * @returns {boolean} `true` if the sound is playing, `false` otherwise.
     */
    playing(name?: string): boolean {
        const snd: Sound = resLib.sounds[name] as Sound;
        if (name) {
            return snd.isPlaying;
        }
        return PIXI.sound.isPlaying();
    },

    /**
     * Get or set the volume for a sound.
     *
     * @param {string} name Sound's name.
     * @param {number} [volume] The new volume from `0.0` to `1.0`.
     * If empty, will return the existing volume.
     *
     * @returns {number} The current volume of the sound.
     */
    volume(name: string, volume?: number): number {
        if (volume) {
            PIXI.sound.volume(name, volume);
        }
        return PIXI.sound.volume(name);
    },

    /**
     * Set the global volume for all sounds.
     * @param {number} [value] The new volume from `0.0` to `1.0`.
     *
     */
    globalVolume(value: number): void {
        PIXI.sound.volumeAll = value;
    },

    /**
     * Fades a sound to a given volume. Can affect either a specific instance or the whole group.
     *
     * @param {string} name The name of a sound to affect. If null, all sounds are faded.
     * @param {number} newVolume The new volume from `0.0` to `1.0`.
     * @param {number} duration The duration of transition, in milliseconds.
     * @param {number} [id] If specified, then only the given sound instance is affected.
     *
     * @returns {void}
     */
    fade(name: string, newVolume: number, duration: number, id?:number): void {
        // TODO: deal with id or instance
        const start = {
            time: performance.now(),
            value: null,
        }
        if(name) {
            start.value = this.volume(name);
        }
        else {
            // Find the first playing sound and get its volume (as we can't access any kind of global volume)
            for (const snd of Object.values(resLib.sounds) as Sound[]) {
                if(snd.isPlaying) {
                    start.value = snd.volume;
                    break;
                }
            }
        }
        const updateVolume = (currentTime: number) => {
          const elapsed = currentTime - start.time;
          const progress = Math.min(elapsed / duration, 1);
          const value = start.value + (newVolume - start.value) * progress;
          if(name) {
            this.volume(name, value);
          }
          else {
            this.globalVolume(value);
          }
          
          if (progress < 1) {
            requestAnimationFrame(updateVolume);
          }
        }
        requestAnimationFrame(updateVolume);
    },

    // WIP
    removeFilter(name: string, filter: string): void {
        const snd: Sound = resLib.sounds[name] as Sound;
        const filters = snd.filters;
        if(filters && filters.length > 0) {
            if(!filter.includes("Filter")) {
                filter += "Filter";
            }
            filters.forEach((f:Filter, i: number) => {
                const currentFilter = f.constructor.name;
                if (currentFilter === filter) {
                    snd.filters.splice(i, 1);
                    // Splice "works" but maybe i have to refresh the sound or something
                    // https://pixijs.io/sound/docs/filters.DistortionFilter.html
                    // init or destroy or disconnect 
                    //snd.filters[i].init();// no: no effect even if destination, etc are  set to undefined
                    //snd.filters[i].destroy();// no: it seems to kill the sound: destination, etc are set to null
                    //snd.filters[i].disconnect();// no: it seems to kill the sound: destination, etc are NOT set to null
                }
            });
        }
    }
};

for (const f of fx) {
    soundsLib[`add${f}Filter`] = (soundName: string, ...args: any): void => {
        createFilter(soundName, f, ...args);
    }
}

export default soundsLib;
