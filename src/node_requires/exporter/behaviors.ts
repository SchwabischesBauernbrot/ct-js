import {getBaseScripts} from './scriptableProcessor';
import {getById} from '../resources';

/**
 * Creates a shallow copy of the specified asset, augmenting its events list with static events
 * of the linked behaviors.
 */
export const embedStaticBehaviors = <T extends IScriptableBehaviors>(asset: T): T => {
    if (!asset.behaviors.length) {
        return asset;
    }
    return {
        ...asset,
        events: asset.events
            .concat(...asset.behaviors.map(bh => getById('behavior', bh).events))
    };
};

export const getBehaviorsList = (asset: IScriptableBehaviors): string[] =>
    asset.behaviors.map(bh => getById('behavior', bh).name);

export const stringifyBehaviors = (behaviors: IBehavior[], project: IProject): string =>
    '{' + behaviors.map(behavior => {
        const scripts = getBaseScripts(behavior, project);
        const isStatic = Object.keys(scripts).some(key => key.startsWith('rootRoom'));
        if (isStatic) {
            return `'${behavior.name}': 'static'`;
        }
        return `'${behavior.name}': {
            ${Object.keys(scripts).map(key => `'${key}': function () {
            ${scripts[key as EventCodeTargets]}
            }`)
            .join(',\n')}
        }`;
    }).join(',\n') + '}';
