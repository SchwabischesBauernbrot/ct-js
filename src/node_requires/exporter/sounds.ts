import {ExporterError} from './ExporterError';
import {ExportedSound} from './_exporterContracts';


export const getSounds = (proj: IProject): ExportedSound[] => {
    const sounds: ExportedSound[] = [];
    for (const s of proj.sounds) {
        if (!s.name) {
            const errorMessage = `The sound asset "${s.name}" does not have an actual sound file attached.`;
            const exporterError = new ExporterError(errorMessage, {
                resourceId: s.uid,
                resourceName: s.name,
                resourceType: 'sound',
                clue: 'emptySound'
            });
            throw exporterError;
        }
        // const wav = s.origname.slice(-4) === '.wav',
        //       mp3 = s.origname.slice(-4) === '.mp3',
        //       ogg = s.origname.slice(-4) === '.ogg';
        // sounds.push({
        //     name: s.name,
        //     wav: wav ? `./snd/${s.uid}.wav` : false,
        //     mp3: mp3 ? `./snd/${s.uid}.mp3` : false,
        //     ogg: ogg ? `./snd/${s.uid}.ogg` : false,
        //     poolSize: s.poolSize || 5,
        //     isMusic: Boolean(s.isMusic)
        // } as exportedSoundData);

        sounds.push({
            name: s.name,
            variants: s.variants.map((v) => ({
                uid: v.uid,
                source: `./snd/${v.uid}.${v.source.slice(-3)}`
            })),
            preload: s.preload,
            volume: (s.volume.enabled && s.volume) || void 0,
            pitch: (s.pitch.enabled && s.pitch) || void 0,
            distortion: (s.distortion.enabled && s.distortion) || void 0,
            reverb: (s.reverb.enabled && s.reverb) || void 0,
            eq: (s.eq.enabled && s.eq) || void 0
        });
    }
    return sounds;
};
