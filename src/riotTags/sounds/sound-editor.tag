//
    @attribute asset
sound-editor.aView.pad.flexfix(onclick="{tryClose}")
    .flexfix-body.sound-editor-aWrapper
        //- .flexrow
            //- .aCard-aThumbnail
            //-     img(src="{currentWaveformPath}")
            //-     .aSpacer.nogrow
            //-     button.round.square.nogrow(onclick="{togglePlay}")
            //-         svg.feather
            //-             use(xlink:href="#{playing ? 'pause' : 'play'}")
        .flexrow.sound-editor-Columns
            .fifty.npl.flexfix
                .flexfix-header
                    h3.nmt Files
                .flexfix-body
                    .flexrow(each="{sound in asset.variants}")
                        .aCard-aThumbnail
                            img(src="{currentWaveformPath[sound.uid]}")
                        button.square.nogrow.large(onclick="{togglePlay(sound)}" title="{vocGlob.play}")
                            svg.feather
                                use(xlink:href="#{playing ? 'pause' : 'play'}")
                        button.square.nogrow(title="{vocGlob.reimport}")
                            svg.feather
                                use(xlink:href="#refresh-ccw")
                        button.square.nogrow(onclick="{deleteVariant(sound)}" title="{vocGlob.delete}")
                            svg.feather
                                use(xlink:href="#x")
                    label.file.wide
                        .button.wide.nm
                            svg.feather
                                use(xlink:href="#plus")
                            span  {voc.addVariant}
                        input(type="file" ref="inputsound" accept=".mp3,.ogg,.wav" onchange="{importVariant}")
                .flexfix-footer
                    label.checkbox
                        input(type="checkbox")
                        b {voc.preload}
            .fifty.npr
                h3.nmt {voc.effects}
                virtual(each="{prop in ['volume', 'pitch', 'distortion']}")
                    .flexrow.sound-editor-aFilter
                        label.checkbox
                            input(type="checkbox" checked="{asset[prop].enabled}")
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
                        input(type="checkbox" checked="{asset.reverb.enabled}")
                        b {voc.reverb}
                    div
                        span {voc.reverbDuration}
                        range-selector(
                            hide-label="hide-label" hide-legend="hide-legend"
                            min="0" max="200"
                            preset-min="{asset.reverb.secondsMin}" preset-max="{asset.reverb.secondsMax}"
                            onrange-changed="{setReverbDuration}"
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
                            onrange-changed="{setReverbDecay}"
                            circle-focus-border="2px solid {swatches.act}"
                            circle-color="{swatches.act}"
                            circle-border="0"
                            slider-color="{swatches.borderBright}"
                            circle-size="24px"
                        )
                        label.checkbox
                            input(type="checkbox" checked="{asset.reverb.enabled}")
                            b {voc.reverseReverb}
                .flexrow.sound-editor-aFilter
                    label.checkbox
                        input(type="checkbox" checked="{asset.eq.enabled}")
                        b {voc.equalizer}
                    div
                        - var frequences = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
                        each val in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                            .flexrow
                                code.sound-editor-aBand=`${frequences[val]}{voc.hertz}`
                                range-selector(
                                    hide-label="hide-label" hide-legend="hide-legend"
                                    min="0" max="200"
                                    preset-min=`asset.eq[${val}].min` preset-max="asset.eq[${val}].max"
                                    onrange-changed=`{setEq(${val})}`
                                    circle-focus-border="2px solid {swatches.act}"
                                    circle-color="{swatches.act}"
                                    circle-border="0"
                                    slider-color="{swatches.borderBright}"
                                    circle-size="24px"
                                )
        b {voc.name}
        br
        input.wide(type="text" value="{asset.name}" onchange="{wire('this.asset.name')}")
        .anErrorNotice(if="{nameTaken}" ref="errorNotice") {vocGlob.nameTaken}
    .flexfix-footer
        p.nmb
            button.wide(onclick="{soundSave}" title="Shift+Control+S" data-hotkey="Control+S")
                svg.feather
                    use(xlink:href="#check")
                span {vocGlob.apply}
    
    script.
        const path = require('path');
        this.namespace = 'soundView';
        this.mixin(window.riotVoc);
        this.mixin(window.riotWired);
        this.playing = false;
        this.asset = this.opts.asset;

        this.currentWaveformPath = [];

        this.on('update', () => {
            const sound = global.currentProject.sounds.find(sound => 
                this.asset.name === sound.name && this.asset !== sound);
            if (sound) {
                this.nameTaken = true;
            } else {
                this.nameTaken = false;
            }
        });

        this.swatches = require('./data/node_requires/themes').getSwatches();

        this.getWaveform = variant => {
            const sounds = require('./data/node_requires/resources/sounds');
            this.currentWaveformPath = sounds.getThumbnail(this.asset.uid, variant.uid);
        };

        this.reimportVariant = variant => e => {
            // TODO
        };

        this.deleteVariant = variant => e => {
            const newVariants = this.asset.variants.filter(el => {
                return el.uid !== variant.uid;
            })
            this.asset.variants = newVariants;
        };

        this.togglePlay = variant => e => {
            const { sounds: allSounds, soundsLib, pixiSoundPrefix } = require('./data/ct.shared/ctSound');
            const soundResMethods = require('./data/node_requires/resources/sounds');
            const soundName = `${pixiSoundPrefix}${this.asset.name}_${variant.uid}`;
            if(!soundsLib.exists(soundName)) {
                allSounds[soundName] = soundResMethods.loadSound(variant.source, soundName);    
            }
            // TODO: this is probably wrong (because of the api or because have to check if playing/paused/something else)
            if(soundsLib.playing(soundName)) {
                soundsLib.stop(soundName);
            } else {
                soundsLib.play(soundName);
            }
        }

        this.importVariant = async () => {
            const source = this.refs.inputsound.files[0].path;
            const sounds = require('./data/node_requires/resources/sounds');
            if (!this.asset.lastmod && this.asset.name === 'Sound_' + this.asset.uid.split('-').pop()) {
                this.asset.name = path.basename(source, path.extname(source));
            }
            await sounds.addSoundFile(this.asset, source);
            const variantUid = this.asset.variants[this.asset.variants.length - 1].uid;
            this.currentWaveformPath[variantUid] = sounds.getThumbnail(this.asset.uid, variantUid);
            this.update();
        }

        this.setProp = e => {

        };
        this.setReverbDuration = e => {
    
        };
        this.setReverbDecay = e => {
    
        };
        this.setEq = e => {
    
        };

        this.soundSave = () => {
            if (this.nameTaken) {
                // animate the error notice
                require('./data/node_requires/jellify')(this.refs.errorNotice);
                const {soundbox} = require('./data/node_requires/3rdparty/soundbox');
                soundbox.play('Failure');
                return false;
            }
            // TODO: i need this
            //- if (this.playing) {
            //-     this.togglePlay();
            //- }
            this.parent.editing = false;
            this.parent.update();
            require('./data/node_requires/glob').modified = true;
            return true;
        };