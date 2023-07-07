import { sound, filters, Filter, IMediaInstance, PlayOptions, Sound } from "node_modules/@pixi/sound";
import {ctjsGame} from '.';

const fx = [
    'Telephone',
    'Distortion',
    'Stereo',
    'Reverb',
    'Equalizer',
];

const createFilter = (soundName: string, filter: string, ...args: Array<number | boolean>): void => {
    const fx = new filters[`${filter}Filter` as 'Filter'](...args); // TODO: i don't know how to fix this, any idea?
    const snd: Sound = ctjsGame.res.sounds[soundName] as Sound;
    if (snd.filters === undefined) {
        snd.filters = [fx];
    } else {
        snd.filters.push(fx);
    }
};
const soundsLib = {


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
    //     ctjsGame.res.sounds[name] = asset;
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
    play(name: string, options?: PlayOptions | Function ): void {
        sound.play(name, options);    
    },
    // async play(name: string, options?: PlayOptions | Function): Promise<IMediaInstance> {
    //     return (await sound.play(name, options) as IMediaInstance);
    //     //return sound.play(name, options);    
    // },
    // async play(name: string, options?: PlayOptions | Function): Promise<IMediaInstance> {
    //     return ((await sound.play(name, options)) as any) as IMediaInstance;
    // },

    /**
     * Stops a sound if a name is specified, otherwise stops all sound.
     *
     * @param {string} name Sound's name
     * 
     * @returns {void}
     */
    stop(name?: string | IMediaInstance): void {
        if(name) {
            if(typeof name === 'string') {
                sound.stop(name);
            }
            else {
                console.log("i am an instance", name)
                name.stop();
            }
            //if(this.playing(name)) {
                    
            //}
        }
        else {
            //if(this.playing()) {
                sound.stopAll();    
           // } 
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
        if(name) {
            if(this.playing(name)) {
                sound.pause(name);    
            }
        }
        else {
            if(this.playing()) {
                sound.pauseAll();    
            } 
        }
    },

    /**
     * Resumes a sound if a name is specified, otherwise resumes all sound.
     *
     * @param {string} name Sound's name
     * 
     * @returns {void}
     */
    resume (name?: string): void {
        if(name) {
            sound.resume(name);    
        }
        else {
            sound.resumeAll();    
        }
    },

    exists(name: string): boolean {
        return (name in ctjsGame.res.sounds);
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
        const snd: Sound = ctjsGame.res.sounds[name] as Sound;
        if(name) {
            return snd.isPlaying;
        }
        else {
            return sound.isPlaying();    
        }
        
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
        if(volume) {
            sound.volume(name, volume);
        }
        return sound.volume(name);
    },

    /**
     * Set the global volume for all sounds.
     * @param {number} [value] The new volume from `0.0` to `1.0`.
     *
     */
    globalVolume(value: number): void {
        sound.volumeAll = value;
    },

    /**
     * Fades a sound to a given volume. Can affect either a specific instance or the whole group.
     *
     * @param {string} name The name of a sound to affect.
     * @param {number} newVolume The new volume from `0.0` to `1.0`.
     * @param {number} duration The duration of transition, in milliseconds.
     * @param {number} [id] If specified, then only the given sound instance is affected.
     *
     * @returns {void}
     */

    // TODO: deal with id or instance
    fade(name: string, newVolume: number, duration: number, id?:number): void {
       //TODO: add a this.playing condition?
        const startValue = this.volume(name);
        const startTime = performance.now();
        const updateVolume = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const value = startValue + (newVolume - startValue) * progress;
          this.volume(name, value);
          console.log(value)
          if (progress < 1) {
            requestAnimationFrame(updateVolume);
          }
        }
        requestAnimationFrame(updateVolume);
    },

    // WIP
    removeFilter(name: string, filter: string): void {
        const snd: Sound = ctjsGame.res.sounds[name] as Sound;
        const filters = snd.filters;
        if(filters && filters.length > 0) {
            if(!filter.includes("Filter")) {
                filter += "Filter";
            }
            console.log(filter)
            filters.forEach((f:Filter, i: number) => {
                const currentFilter = f.constructor.name;
                if (currentFilter === filter) {
                    console.log(f)
                    // Seems to works but i probably have to refresh the sound or something
                    //snd.filters.splice(i, 1);
                    // https://pixijs.io/sound/docs/filters.DistortionFilter.html
                    // init or destroy or disconnect 
                    //snd.filters[i].init();// no: no effect even if destination, etc are  set to undefined
                    //snd.filters[i].destroy();// no: it seems to kill the sound: destination, etc are set to null
                    //snd.filters[i].disconnect();// no: it seems to kill the sound: destination, etc are NOT set to null
                }
            });
            //console.log(ctjsGame.res.sounds[name])
            // for (const f in filters) {
            //     console.log(Object.keys(f))
            //     // if (ctjsGame.res.sounds[name].filters[f] === filter) {
            //     //     ctjsGame.res.sounds[name].filters.splice(f, 1);
            //     // }
            // }
        }
    }
};

for (const f of fx) {
    sounds[`add${f}Filter`] = (soundName: string, ...args: any): void => {
        createFilter(soundName, f, ...args);
    }
}

export default soundsLib;
