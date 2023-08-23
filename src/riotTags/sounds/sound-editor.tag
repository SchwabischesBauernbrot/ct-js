//
    @attribute asset
sound-editor.aView.pad.flexfix(onclick="{tryClose}")
    input(type="file" ref="inputsound" accept=".mp3,.ogg,.wav" onchange="{importVariant}")
    .flexfix-body.sound-editor-aWrapper
        .flexrow
            .aCard-aThumbnail
                img(src="{currentWaveformPath}")
                .aSpacer.nogrow
                button.round.square.nogrow(onclick="{togglePlay}")
                    svg.feather
                        use(xlink:href="#{playing ? 'pause' : 'play'}")
        //- .flexrow.sound-editor-Columns
        //-     .fifty.npl.flexfix
        //-         .flexfix-header
        //-             h3.nmt Files
        //-         .flexfix-body
        //-             // TODO: Gallery import
        //-             .flexrow(each="{sound in asset.variants}")
        //-                 img(src="{getWaveform(sound)}")
        //-                 button.square.nogrow.large(onclick="{playVariant(sound)}" title="{vocGlob.play}")
        //-                     svg.feather
        //-                         use(xlink:href="#play")
        //-                 .aSpacer.nogrow
        //-                 button.square.nogrow(onclick="{reimportVariant(sound)}" title="{vocGlob.reimport}")
        //-                     svg.feather
        //-                         use(xlink:href="#play")
        //-                 button.square.nogrow(onclick="{deleteVariant(sound)}" title="{vocGlob.delete}")
        //-                     svg.feather
        //-                         use(xlink:href="#del")
        //-             label.file.wide
        //-                 .button.wide.nm
        //-                     svg.feather(onclick="{importVariant}")
        //-                         use(xlink:href="#plus")
        //-                     span  {voc.addVariant}
        //-                 input(type="file" ref="inputsound" accept=".mp3,.ogg,.wav" onchange="{importVariant}")
        //-         .flexfix-footer
        //-             label.checkbox
        //-                 input(type="checkbox")
        //-                 b {voc.preload}
        //-     .fifty.npr
        //-         h3.nmt {voc.effects}
        //-         virtual(each="{prop in ['volume', 'pitch', 'distortion']}")
        //-             .flexrow.sound-editor-aFilter
        //-                 label.checkbox
        //-                     input(type="checkbox" checked="{asset[prop].enabled}")
        //-                     b {voc[prop]}
        //-                 range-selector(
        //-                     hide-label="hide-label" hide-legend="hide-legend"
        //-                     min="0" max="200"
        //-                     preset-min="{asset[prop].min}" preset-max="{asset[prop].max}"
        //-                     onrange-changed="{setProp(prop)}"
        //-                     circle-focus-border="2px solid {swatches.act}"
        //-                     circle-color="{swatches.act}"
        //-                     circle-border="0"
        //-                     slider-color="{swatches.borderBright}"
        //-                     circle-size="24px"
        //-                 )
        //-         .flexrow.sound-editor-aFilter
        //-             label.checkbox
        //-                 input(type="checkbox" checked="{asset.reverb.enabled}")
        //-                 b {voc.reverb}
        //-             div
        //-                 span {voc.reverbDuration}
        //-                 range-selector(
        //-                     hide-label="hide-label" hide-legend="hide-legend"
        //-                     min="0" max="200"
        //-                     preset-min="{asset.reverb.secondsMin}" preset-max="{asset.reverb.secondsMax}"
        //-                     onrange-changed="{setReverbDuration}"
        //-                     circle-focus-border="2px solid {swatches.act}"
        //-                     circle-color="{swatches.act}"
        //-                     circle-border="0"
        //-                     slider-color="{swatches.borderBright}"
        //-                     circle-size="24px"
        //-                 )
        //-                 span {voc.reverbDecay}
        //-                 range-selector(
        //-                     hide-label="hide-label" hide-legend="hide-legend"
        //-                     min="0" max="200"
        //-                     preset-min="{asset.reverb.decayMin}" preset-max="{asset.reverb.decayMax}"
        //-                     onrange-changed="{setReverbDecay}"
        //-                     circle-focus-border="2px solid {swatches.act}"
        //-                     circle-color="{swatches.act}"
        //-                     circle-border="0"
        //-                     slider-color="{swatches.borderBright}"
        //-                     circle-size="24px"
        //-                 )
        //-                 label.checkbox
        //-                     input(type="checkbox" checked="{asset.reverb.enabled}")
        //-                     b {voc.reverseReverb}
        //-         .flexrow.sound-editor-aFilter
        //-             label.checkbox
        //-                 input(type="checkbox" checked="{asset.eq.enabled}")
        //-                 b {voc.equalizer}
        //-             div
        //-                 - var frequences = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
        //-                 each val in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        //-                     .flexrow
        //-                         code.sound-editor-aBand=`${frequences[val]}{voc.hertz}`
        //-                         range-selector(
        //-                             hide-label="hide-label" hide-legend="hide-legend"
        //-                             min="0" max="200"
        //-                             preset-min=`asset.eq[${val}].min` preset-max="asset.eq[${val}].max"
        //-                             onrange-changed=`{setEq(${val})}`
        //-                             circle-focus-border="2px solid {swatches.act}"
        //-                             circle-color="{swatches.act}"
        //-                             circle-border="0"
        //-                             slider-color="{swatches.borderBright}"
        //-                             circle-size="24px"
        //-                         )
        b {voc.name}
        br
        input.wide(type="text" value="{sound.name}" onchange="{wire('this.sound.name')}")
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
        //- this.asset = this.opts.asset;
        //- console.log(this.asset)
        this.sound = this.opts.sound;

        this.currentWaveformPath = "data/img/notexture.png";

        this.swatches = require('./data/node_requires/themes').getSwatches();

        this.getWaveform = variant => {
            // TODO:
        };

        this.playVariant = variant => e => {

        };
        this.reimportVariant = variant => e => {

        };
        this.deleteVariant = variant => e => {

        };

        this.togglePlay = () => {
            const { sounds: allSounds, soundsLib, pixiSoundPrefix } = require('./data/ct.shared/ctSound');
            const soundResMethods = require('./data/node_requires/resources/sounds');
            const soundName = `${pixiSoundPrefix}${this.sound.name}`;
            if(!soundsLib.exists(soundName)) {
                allSounds[soundName] = soundResMethods.loadSound(this.sound.path, soundName);    
            }
            soundsLib.play(soundName);
        }

        this.importVariant = async () => {
            const val = this.refs.inputsound.files[0].path;
            this.sound.path = val;
            this.refs.inputsound.value = '';
            const sounds = require('./data/node_requires/resources/sounds');
            if (!this.sound.lastmod && this.sound.name === 'Sound_' + this.sound.uid.split('-').pop()) {
                this.sound.name = path.basename(val, path.extname(val));
            }
            await sounds.addSoundFile(this.sound, val);
            this.currentWaveformPath = sounds.getThumbnail(this.sound.uid);
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
