import {get as getDefaultBehavior} from './defaultBehavior';
import {getByTypes} from '..';
import {canBeDynamicBehavior, getEventByLib} from '../../events';

export const getThumbnail = (): string => 'behavior';
export const areThumbnailsIcons = true;

export const createAsset = (opts: {
    name?: string,
    behaviorType: BehaviorType
}): IBehavior => {
    const behavior = getDefaultBehavior(opts.behaviorType);
    if (opts.name) {
        behavior.name = opts.name;
    }
    return behavior;
};

export const removeAsset = (asset: IBehavior): void => {
    const {room: rooms, template: templates} = getByTypes();
    for (const room of rooms) {
        room.behaviors = room.behaviors.filter(b => b !== asset.uid);
    }
    for (const template of templates) {
        template.behaviors = template.behaviors.filter(b => b !== asset.uid);
    }
};

import {getIcons as getScriptableIcons} from '../scriptables';
export const getIcons = (asset: IBehavior): string[] => {
    if (!asset.events.every(e => canBeDynamicBehavior(getEventByLib(e.eventKey, e.lib)))) {
        return ['snowflake', ...getScriptableIcons(asset)];
    }
    return getScriptableIcons(asset);
};
