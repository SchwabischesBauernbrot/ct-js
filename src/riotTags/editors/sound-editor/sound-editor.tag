sound-editor.aView.pad.flexfix(onclick="{tryClose}")
    .flexfix-body.sound-editor-aWrapper
        .flexrow
            // TODO: make it dynamic
            // need to somehow get the played variant back
            // from the sound lib
            img.soundthumbnail(src="{getPreview(asset.variants[0], true)}" if="{asset.variants.length}")
            .aSpacer(if="{!asset.variants.length}")
            .aSpacer.nogrow
            button.round.square.nogrow.alignmiddle(onclick="{test}")
                svg.feather
                    use(xlink:href="#{playing ? 'pause' : 'play'}")
        .flexrow.sound-editor-Columns
            .fifty.npl.flexfix
                .flexfix-header
                    h2.nmt {voc.variants}
                .flexfix-body
                    .aSpacer
                    .flexrow.wide(each="{variant in asset.variants}")
                        img.aVariantThumbnail.soundthumbnail(src="{getPreview(variant, true)}")
                        button.square.nogrow.large(onclick="{togglePlay(variant)}" title="{vocGlob.play}")
                            svg.feather
                                use(xlink:href="#{playing(variant.uid) ? 'pause' : 'play'}")
                        button.square.nogrow(title="{vocGlob.reimport}")
                            svg.feather
                                use(xlink:href="#refresh-ccw")
                        button.square.nogrow(onclick="{deleteVariant(variant)}" title="{vocGlob.delete}")
                            svg.feather
                                use(xlink:href="#x")
                    .flexrow
                        button(onclick="{openRecorder}")
                            svg.feather
                                use(xlink:href="#mic")
                                span {vocFull.sounds.record}
                        .aSpacer.nogrow
                        button(onclick="{openGallery}")
                            svg.feather
                                use(xlink:href="#music")
                                span {vocGlob.openAssetGallery}
                        .aSpacer.nogrow
                        label.file
                            .button.wide.nm
                                svg.feather
                                    use(xlink:href="#folder-plus")
                                span  {voc.addVariant}
                            input(type="file" ref="inputsound" accept=".mp3,.ogg,.wav" onchange="{importVariant}")
                .flexfix-footer
                    h2.nmt {vocGlob.settings}
                    .aSpacer
                    label.checkbox
                        input(type="checkbox")
                        b {voc.preload}
            .fifty.npr
                h2.nmt {voc.effects}
                .aSpacer
                virtual(each="{prop in ['volume', 'pitch', 'distortion']}")
                    .flexrow.sound-editor-aFilter
                        label.checkbox
                            input(
                                type="checkbox"
                                checked="{asset[prop].enabled}"
                                onchange="{toggleCheckbox(prop)}"
                            )
                            b {voc[prop]}
                        range-selector(
                            hide-label="hide-label" hide-legend="hide-legend"
                            min="0" max="200"
                            preset-min="{asset[prop].min}" preset-max="{asset[prop].max}"
                            onrange-changed="{setProp(prop)}"
                            circle-focus-border="2px solid {swatches.act}"
                            circle-color="{swatches.act}"
                            circle-border="0"
                            slider-color="{swatches.borderBright}"
                            circle-size="24px"
                        )
                .flexrow.sound-editor-aFilter
                    label.checkbox
                        input(type="checkbox" checked="{asset.reverb.enabled}" onchange="{toggleCheckbox('reverb')}")
                        b {voc.reverb}
                    div
                        span {voc.reverbDuration}
                        range-selector(
                            hide-label="hide-label" hide-legend="hide-legend"
                            min="0" max="200"
                            preset-min="{asset.reverb.secondsMin}" preset-max="{asset.reverb.secondsMax}"
                            onrange-changed="{setProp('reverb', 'seconds')}"
                            circle-focus-border="2px solid {swatches.act}"
                            circle-color="{swatches.act}"
                            circle-border="0"
                            slider-color="{swatches.borderBright}"
                            circle-size="24px"
                        )
                        span {voc.reverbDecay}
                        range-selector(
                            hide-label="hide-label" hide-legend="hide-legend"
                            min="0" max="200"
                            preset-min="{asset.reverb.decayMin}" preset-max="{asset.reverb.decayMax}"
                            onrange-changed="{setProp('reverb', 'decay')}"
                            circle-focus-border="2px solid {swatches.act}"
                            circle-color="{swatches.act}"
                            circle-border="0"
                            slider-color="{swatches.borderBright}"
                            circle-size="24px"
                        )
                        label.checkbox
                            input(type="checkbox" checked="{asset.reverb.reverse}" onchange="{toggleCheckbox('reverse')}")
                            b {voc.reverseReverb}
                .flexrow.sound-editor-aFilter
                    label.checkbox
                        input(type="checkbox" checked="{asset.eq.enabled}" onchange="{toggleCheckbox('eq')}")
                        b {voc.equalizer}
                    div
                        - var frequences = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
                        each val in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                            .flexrow
                                code.sound-editor-aBand=`${frequences[val]}{voc.hertz}`
                                range-selector(
                                    hide-label="hide-label" hide-legend="hide-legend"
                                    min="0" max="200"
                                    preset-min=`{asset.eq.bands[${val}].min}` preset-max=`{asset.eq.bands[${val}].max}`
                                    onrange-changed=`{setProp('eq', ${val})}`
                                    circle-focus-border="2px solid {swatches.act}"
                                    circle-color="{swatches.act}"
                                    circle-border="0"
                                    slider-color="{swatches.borderBright}"
                                    circle-size="24px"
                                )
    .flexfix-footer.sound-editor-aWrapper
        p.nmb
            button.wide(onclick="{saveAndClose}" title="Shift+Control+S" data-hotkey="Control+S")
                svg.feather
                    use(xlink:href="#check")
                span {vocGlob.apply}
    builtin-asset-gallery(
        if="{showGallery}"
        type="sounds" sound="{asset}"
        onclose="{closeGallery}"
    )
    script.
        const path = require('path');
        this.namespace = 'soundView';
        this.mixin(require('./data/node_requires/riotMixins/voc').default);
        this.mixin(require('./data/node_requires/riotMixins/wire').default);
        this.mixin(require('./data/node_requires/riotMixins/discardio').default);

        const soundResMethods = require('./data/node_requires/resources/sounds');
        const {SoundPreviewer} = require('./data/node_requires/resources/preview/sound');
        const { sounds: allSounds, soundsLib, pixiSoundPrefix } = require('./data/ct.shared/ctSound');

        this.currentSoundPlaying = null;
        soundResMethods.loadSound(this.asset);

        console.log("11h_filter") // TODO: remove

        this.getPreview = (variant, long) => SoundPreviewer.get(this.asset, false, variant.uid, long);

        this.swatches = require('./data/node_requires/themes').getSwatches();

        this.reimportVariant = variant => e => {
            // TODO:
            // remove the old variant from pixi.sound first
        };

        this.deleteVariant = variant => e => {
            const newVariants = this.asset.variants.filter(el => {
                return el.uid !== variant.uid;
            })
            this.asset.variants = newVariants;
        };

        this.defineSoundName = variantUid => {
            return `${pixiSoundPrefix}${variantUid}`;
        }

        this.stop = () => {
            if(this.currentSoundPlaying) {
                soundsLib.stop(this.currentSoundPlaying);
                this.currentSoundPlaying = null;
            }
        }

        this.test = () => {
            soundsLib.playDirectVariant(this.asset);
        }

        this.play = variantUid => {
            this.stop();
            const soundName = this.defineSoundName(variantUid);
            this.currentSoundPlaying = soundName.replace(pixiSoundPrefix, "");
            soundsLib.playDirectVariant(this.asset);
        }

        this.playing = variantUid => {
            if(this.currentSoundPlaying !== null) {
                return soundsLib.playing(this.defineSoundName(variantUid));
            }
            return false;
        }

        this.togglePlay = variant => e => {
            // TODO/WIP: use callback to know when the sound finished "itself" from playing 
            const soundName = this.defineSoundName(variant.uid);
            if(this.currentSoundPlaying === soundName.replace(pixiSoundPrefix, "")) {
                this.stop();
            } else {
                this.play(variant.uid);
            }
        }

        this.importVariant = async () => {
            const source = this.refs.inputsound.files[0].path;
            const sounds = require('./data/node_requires/resources/sounds');
            if (!this.asset.lastmod && this.asset.name === 'Sound_' + this.asset.uid.split('-').pop()) {
                this.asset.name = path.basename(source, path.extname(source));
            }
            const variant = await sounds.addSoundFile(this.asset, source);
            this.smallWaveforms[variant.uid] =
                SoundPreviewer.get(this.asset, false, variant.uid, false);
            this.largeWaveforms[variant.uid] =
                SoundPreviewer.get(this.asset, false, variant.uid, true);
            this.update();
            soundResMethods.loadSound(this.asset);
        }

        this.toggleCheckbox = prop => e => {
            // TODO: volume and pitch
            console.log(prop);
            this.asset[prop].enabled = !this.asset[prop].enabled;
            if (this.currentSoundPlaying) {
                this.stop();
            }
        };
        this.setProp = (prop, arg = null) => e => {
            const { minRangeValue: min, maxRangeValue: max } = e.detail;
            if(arg !== null) {
                if(prop === "eq") {
                    this.asset[prop].bands[parseInt(arg)] = {
                        min,
                        max
                    };
                } else {
                    this.asset[prop][arg + 'Min'] = min;
                    this.asset[prop][arg + 'Max'] = max;
                }
            } else {
                this.asset[prop].min = min;
                this.asset[prop].max = max;
            }
        };

        this.saveAsset = () => {
            this.writeChanges();
            this.stop();
            return true;
        };
        this.saveAndClose = () => {
            this.saveAsset();
            this.opts.ondone(this.asset);
        };


        // Built-in asset gallery

        this.showGallery = false;
        this.openGallery = () => {
            this.showGallery = true;
        };
        this.closeGallery = () => {
            this.showGallery = false;
            this.update();
        };
