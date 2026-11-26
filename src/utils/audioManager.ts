// Studio JRPG Audio Engine for Tessera_legacy
// Powered by Fire Emblem Heroes (FEH) high-fidelity audio library with procedural Web Audio fallbacks
import { ElementType } from '../types/game';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmInterval: number | null = null;

  // Studio sample buffer cache
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private pendingFetches: Map<string, Promise<AudioBuffer | null>> = new Map();
  private hasPreloadedCore: boolean = false;

  constructor() {
    // Check saved audio preference
    const savedMute = localStorage.getItem('tessera_muted');
    this.isMuted = savedMute === 'true';
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Trigger preloading of core combat & UI audio upon first interaction
    if (!this.hasPreloadedCore) {
      this.hasPreloadedCore = true;
      this.preloadCoreSounds();
    }
  }

  // Preload most common combat and UI sounds in background
  public preloadCoreSounds() {
    const coreList = [
      'sys_select1.wav',
      'test_swing1.wav',
      'test_swing2.wav',
      'test_swing3.wav',
      'test_swing4.wav',
      'battle_1.wav',
      'battle_2.wav',
      'battle_4.wav',
      'btl_blow1.wav',
      'btl_blow2.wav',
      'dmg_hundred_1.wav',
      'effect_fire01.wav',
      'effect_ice.wav',
      'effect_elwind.wav',
      'effect_thunder01.wav',
      'effect_light01.wav',
      'effect_cure_fld.wav',
      'effect_anticounter.wav',
      'effect_shield01.wav',
      'sys_warning.wav',
      'summon_star03.wav',
      'summon_star04.wav',
      'summon_star05.wav',
    ];
    coreList.forEach(name => this.loadSample(name));
  }

  // Load and cache a studio sample (prefers fast lightweight MP3 with fallback to WAV)
  public async loadSample(filename: string): Promise<AudioBuffer | null> {
    const resolvedName = filename.endsWith('.wav') ? filename.replace(/\.wav$/i, '.mp3') : filename;
    if (this.bufferCache.has(filename)) {
      return this.bufferCache.get(filename)!;
    }
    if (this.bufferCache.has(resolvedName)) {
      return this.bufferCache.get(resolvedName)!;
    }
    if (this.pendingFetches.has(filename)) {
      return this.pendingFetches.get(filename)!;
    }
    if (this.pendingFetches.has(resolvedName)) {
      return this.pendingFetches.get(resolvedName)!;
    }

    this.initContext();
    if (!this.ctx) return null;

    const promise = (async () => {
      try {
        let response = await fetch(`/sounds/feh/${resolvedName}`);
        if (!response.ok && resolvedName !== filename) {
          response = await fetch(`/sounds/feh/${filename}`);
        }
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
        this.bufferCache.set(filename, audioBuffer);
        this.bufferCache.set(resolvedName, audioBuffer);
        return audioBuffer;
      } catch (err) {
        return null;
      } finally {
        this.pendingFetches.delete(filename);
        this.pendingFetches.delete(resolvedName);
      }
    })();

    this.pendingFetches.set(resolvedName, promise);
    this.pendingFetches.set(filename, promise);
    return promise;
  }

  // Play an authentic studio sample with polyphony, volume scaling, and subtle pitch jitter
  public async playSample(
    filename: string,
    options: {
      volume?: number;
      pitchJitter?: number;
      playbackRate?: number;
      delayMs?: number;
      fallback?: () => void;
    } = {}
  ): Promise<void> {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) {
      options.fallback?.();
      return;
    }

    if (options.delayMs && options.delayMs > 0) {
      setTimeout(() => this.playSample(filename, { ...options, delayMs: 0 }), options.delayMs);
      return;
    }

    try {
      let buffer = this.bufferCache.get(filename);
      if (!buffer) {
        buffer = (await this.loadSample(filename)) || undefined;
      }

      if (!buffer) {
        options.fallback?.();
        return;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const baseRate = options.playbackRate ?? 1.0;
      const jitter = options.pitchJitter ? (Math.random() - 0.5) * options.pitchJitter : 0;
      source.playbackRate.setValueAtTime(Math.max(0.1, baseRate + jitter), this.ctx.currentTime);

      const gain = this.ctx.createGain();
      const vol = options.volume ?? 0.35;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);

      source.connect(gain);
      gain.connect(this.ctx.destination);

      source.start();
    } catch {
      options.fallback?.();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('tessera_muted', String(this.isMuted));
    if (this.isMuted && this.isBgmPlaying) {
      this.stopBgm();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public startBgm() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;
    this.isBgmPlaying = true;

    // Gentle ambient chiptune chord progression: C - Am - F - G
    const chords = [
      [261.63, 329.63, 392.00], // C
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66], // G
    ];
    let step = 0;

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.isBgmPlaying) return;
      const chord = chords[step % chords.length];
      chord.forEach(f => {
        this.playTone(f, 'sine', 1.8, 0.04);
      });
      step++;
    }, 2000);
  }

  // =========================================================
  // SYNTHESIS FALLBACK UTILITIES
  // =========================================================
  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    vol: number = 0.2,
    pitchSlideTo?: number,
    applyJitter: boolean = true
  ) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const jitterFactor = applyJitter ? 1 + (Math.random() - 0.5) * 0.07 : 1.0;
      const effectiveFreq = Math.max(20, freq * jitterFactor);

      osc.type = type;
      osc.frequency.setValueAtTime(effectiveFreq, now);

      if (pitchSlideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, pitchSlideTo), now + duration);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  private playNoise(duration: number, vol: number = 0.2, filterFreq: number = 1000) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {}
  }

  public playCritPulse() {
    this.playSample('dmg_hundred_1.wav', {
      volume: 0.5,
      pitchJitter: 0.04,
      fallback: () => {
        this.playNoise(0.2, 0.55, 3000);
        this.playTone(120, 'square', 0.25, 0.45, 30);
      }
    });
  }

  // =========================================================
  // ELEMENTAL SPELL ATTACK SOUNDS (FEH STUDIO AUDIO)
  // =========================================================

  // 1. FIRE SPELL ATTACK
  public playFireSpell(isCrit: boolean = false, isUlt: boolean = false, isSkill: boolean = false) {
    if (this.isMuted) return;
    const vol = isUlt ? 0.6 : isSkill ? 0.5 : 0.42;
    const sample = isUlt ? 'effect_volganon.wav' : isCrit ? 'effect_blueflame.wav' : 'effect_fire01.wav';

    this.playSample(sample, {
      volume: vol,
      pitchJitter: 0.06,
      fallback: () => {
        this.playNoise(0.3, 0.4, 2200);
        this.playTone(180, 'sawtooth', 0.3, 0.35, 45);
      }
    });

    if (isCrit) {
      this.playCritPulse();
    }
  }

  // 2. WATER / ICE SPELL ATTACK
  public playWaterSpell(isCrit: boolean = false, isUlt: boolean = false, isSkill: boolean = false) {
    if (this.isMuted) return;
    const vol = isUlt ? 0.6 : isSkill ? 0.5 : 0.42;
    const sample = isUlt ? 'effect_blizzard01.wav' : isCrit ? 'effect_icewall_break01.wav' : 'effect_ice.wav';

    this.playSample(sample, {
      volume: vol,
      pitchJitter: 0.05,
      fallback: () => {
        this.playTone(1320, 'triangle', 0.25, 0.35, 440);
        this.playNoise(0.2, 0.25, 3500);
      }
    });

    if (isCrit) {
      this.playCritPulse();
    }
  }

  // 3. WIND SPELL ATTACK
  public playWindSpell(isCrit: boolean = false, isUlt: boolean = false, isSkill: boolean = false) {
    if (this.isMuted) return;
    const vol = isUlt ? 0.6 : isSkill ? 0.5 : 0.42;
    const sample = isUlt ? 'effect_excalibur.wav' : isCrit ? 'effect_elwind.wav' : 'effect_wind.wav';

    this.playSample(sample, {
      volume: vol,
      pitchJitter: 0.06,
      fallback: () => {
        this.playNoise(0.22, 0.35, 4200);
        this.playTone(880, 'triangle', 0.2, 0.3, 1760);
      }
    });

    if (isCrit) {
      this.playCritPulse();
    }
  }

  // 4. LIGHT / HOLY SPELL ATTACK
  public playLightSpell(isCrit: boolean = false, isUlt: boolean = false, isSkill: boolean = false) {
    if (this.isMuted) return;
    const vol = isUlt ? 0.6 : isSkill ? 0.5 : 0.42;
    const sample = isUlt ? 'effect_saints.wav' : isCrit ? 'effect_aura.wav' : 'effect_light01.wav';

    this.playSample(sample, {
      volume: vol,
      pitchJitter: 0.04,
      fallback: () => {
        this.playTone(987.77, 'sine', 0.35, 0.35, 1568);
        this.playTone(1318.5, 'triangle', 0.25, 0.25);
      }
    });

    if (isCrit) {
      this.playCritPulse();
    }
  }

  // 5. DARK / SHADOW SPELL ATTACK
  public playDarkSpell(isCrit: boolean = false, isUlt: boolean = false, isSkill: boolean = false) {
    if (this.isMuted) return;
    const vol = isUlt ? 0.6 : isSkill ? 0.5 : 0.42;
    const sample = isUlt ? 'effect_hell.wav' : isCrit ? 'effect_ruin.wav' : 'effect_darkbreath.wav';

    this.playSample(sample, {
      volume: vol,
      pitchJitter: 0.05,
      fallback: () => {
        this.playTone(95, 'sawtooth', 0.4, 0.4, 45);
        this.playNoise(0.3, 0.35, 800);
      }
    });

    if (isCrit) {
      this.playCritPulse();
    }
  }

  // 6. PHYSICAL SPELL ATTACK
  public playPhysicalSpell(isCrit: boolean = false, isUlt: boolean = false, isSkill: boolean = false) {
    if (this.isMuted) return;
    const vol = isUlt ? 0.65 : isSkill ? 0.52 : 0.42;
    const swingSample = isUlt ? 'battle_6.wav' : isSkill ? 'battle_4.wav' : 'battle_1.wav';

    this.playSample(swingSample, {
      volume: vol,
      pitchJitter: 0.05,
      fallback: () => {
        this.playNoise(0.15, 0.45, 4500);
        this.playTone(180, 'sine', 0.2, 0.4, 45);
      }
    });

    if (isCrit) {
      this.playCritPulse();
    }
  }

  // Central Router for Elemental Spell Attacks
  public playElementalSpellAttack(
    element: ElementType | string = 'PHYSICAL',
    isCrit: boolean = false,
    isUlt: boolean = false,
    isSkill: boolean = false
  ) {
    if (this.isMuted) return;
    const elem = String(element).toUpperCase();
    switch (elem) {
      case 'FIRE':
        this.playFireSpell(isCrit, isUlt, isSkill);
        break;
      case 'WATER':
        this.playWaterSpell(isCrit, isUlt, isSkill);
        break;
      case 'WIND':
        this.playWindSpell(isCrit, isUlt, isSkill);
        break;
      case 'LIGHT':
        this.playLightSpell(isCrit, isUlt, isSkill);
        break;
      case 'DARK':
        this.playDarkSpell(isCrit, isUlt, isSkill);
        break;
      case 'THUNDER':
        this.playSample(isUlt ? 'effect_thoron.wav' : 'effect_thunder01.wav', {
          volume: isUlt ? 0.6 : 0.45,
          pitchJitter: 0.05,
          fallback: () => this.playFireSpell(isCrit, isUlt, isSkill)
        });
        if (isCrit) this.playCritPulse();
        break;
      default:
        this.playPhysicalSpell(isCrit, isUlt, isSkill);
    }
  }

  // Elemental Spell Invocation / Cast Start SFX (Triggered on hotbar card tap)
  public playElementalSpellCast(element: ElementType | string = 'FIRE') {
    if (this.isMuted) return;
    const elem = String(element).toUpperCase();
    switch (elem) {
      case 'FIRE':
        this.playSample('effect_fire_start_fld.wav', { volume: 0.4, fallback: () => this.playNoise(0.2, 0.35, 1800) });
        break;
      case 'WATER':
        this.playSample('effect_blessing_water.wav', { volume: 0.4, fallback: () => this.playTone(1318.5, 'triangle', 0.28, 0.25, 1760) });
        break;
      case 'WIND':
        this.playSample('effect_wind_start_fld.wav', { volume: 0.4, fallback: () => this.playNoise(0.15, 0.3, 3500) });
        break;
      case 'LIGHT':
        this.playSample('effect_light_start_fld.wav', { volume: 0.4, fallback: () => this.playTone(987.77, 'sine', 0.3, 0.22, 1318.5) });
        break;
      case 'DARK':
        this.playSample('effect_lopu.wav', { volume: 0.4, fallback: () => this.playTone(110, 'sawtooth', 0.35, 0.3, 55) });
        break;
      case 'THUNDER':
        this.playSample('effect_thunder_start_fld.wav', { volume: 0.4, fallback: () => this.playTone(880, 'square', 0.2, 0.25) });
        break;
      default:
        this.playSample('test_swing1.wav', { volume: 0.35, fallback: () => this.playTone(440, 'triangle', 0.2, 0.2, 880) });
    }
  }

  // =========================================================
  // TACTILE WEB HAPTICS ENGINE
  // =========================================================
  public triggerHaptic(pattern: number | number[] = 15) {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Graceful fallback for platforms/browsers with vibration permissions blocked
    }
  }

  // =========================================================
  // COMBAT ACTIONS & HIT RESPONSES
  // =========================================================

  // 1. Weapon Slash / Attack SFX
  public playSlash(element: string = 'PHYSICAL') {
    if (this.isMuted) return;
    const swings = ['test_swing1.wav', 'test_swing2.wav', 'test_swing3.wav', 'test_swing4.wav', 'battle_swing_l_1.wav'];
    const chosenSwing = swings[Math.floor(Math.random() * swings.length)];

    this.playSample(chosenSwing, {
      volume: 0.38,
      pitchJitter: 0.08,
      fallback: () => this.playNoise(0.12, 0.35, 3800)
    });

    const elem = String(element).toUpperCase();
    if (elem !== 'PHYSICAL' && elem !== 'NONE') {
      setTimeout(() => this.playElementalSpellAttack(elem, false, false, false), 40);
    }
  }

  // 2. Heavy Strike / Boss Impact
  public playHeavyBlow(element: string = 'PHYSICAL') {
    if (this.isMuted) return;
    const heavySamples = ['battle_4.wav', 'battle_5.wav', 'battle_7.wav', 'btl_blow1.wav', 'btl_blow2.wav'];
    const chosen = heavySamples[Math.floor(Math.random() * heavySamples.length)];

    this.playSample(chosen, {
      volume: 0.48,
      pitchJitter: 0.06,
      fallback: () => {
        this.playNoise(0.2, 0.45, 1200);
        this.playTone(110, 'sine', 0.25, 0.4, 45);
      }
    });

    const elem = String(element).toUpperCase();
    if (elem !== 'PHYSICAL' && elem !== 'NONE') {
      this.playElementalSpellAttack(elem, true, false, false);
    }
  }

  // 3. Projectile Arrow Volley
  public playArrowVolley() {
    if (this.isMuted) return;
    this.playSample('battle_bow_shot1.wav', {
      volume: 0.45,
      pitchJitter: 0.06,
      fallback: () => {
        this.playTone(950, 'triangle', 0.12, 0.25, 2600);
      }
    });
  }

  // 4. Elemental Weakness Shatter (Glass/barrier shatter)
  public playWeaknessHit() {
    if (this.isMuted) return;
    this.playSample('effect_icewall_break01.wav', {
      volume: 0.48,
      pitchJitter: 0.04,
      fallback: () => {
        this.playTone(1760, 'triangle', 0.18, 0.25, 3520);
        this.playNoise(0.08, 0.2, 4500);
      }
    });
  }

  // 5. Boss Enrage / Roar
  public playBossRoar() {
    this.triggerHaptic([30, 40, 30]);
    if (this.isMuted) return;
    this.playSample('effect_dragon_change.wav', {
      volume: 0.55,
      fallback: () => {
        this.playSample('effect_roar_fld.wav', {
          volume: 0.5,
          fallback: () => this.playTone(75, 'sawtooth', 0.8, 0.45, 45)
        });
      }
    });
  }

  // 6. Boss Stance Break / Collapse
  public playBossBreak() {
    this.triggerHaptic([45, 55, 65]);
    if (this.isMuted) return;
    this.playSample('effect_wall_break01.wav', {
      volume: 0.52,
      pitchJitter: 0.04,
      fallback: () => {
        this.playNoise(0.35, 0.45, 800);
        this.playTone(180, 'sawtooth', 0.4, 0.4, 30);
      }
    });
    this.playSample('btl_dmf2.wav', { volume: 0.45, delayMs: 120 });
  }

  // 7. Dynamic Combo Counter Progression
  public playComboTick(comboCount: number = 1) {
    if (this.isMuted) return;
    const rate = Math.min(1.4, 1.0 + (comboCount * 0.015));
    const sample = comboCount % 2 === 0 ? 'common_4.wav' : 'common_5.wav';
    this.playSample(sample, {
      volume: 0.32,
      playbackRate: rate,
      fallback: () => this.playTone(660 + Math.min(comboCount * 25, 600), 'triangle', 0.06, 0.15)
    });
  }

  // 8. Debuff Infliction
  public playDebuff() {
    if (this.isMuted) return;
    this.playSample('effect_orb_debuff.wav', {
      volume: 0.4,
      fallback: () => this.playTone(320, 'sawtooth', 0.25, 0.2, 120)
    });
  }

  // 9. Critical Hit
  public playCrit() {
    this.triggerHaptic(18);
    if (this.isMuted) return;
    const critSample = Math.random() < 0.5 ? 'dmg_hundred_1.wav' : 'dmg_hundred_2.wav';
    this.playSample(critSample, {
      volume: 0.52,
      pitchJitter: 0.05,
      fallback: () => {
        this.playNoise(0.18, 0.5, 3000);
        this.playTone(140, 'square', 0.22, 0.4, 40);
      }
    });
  }

  // 10. Perfect Guard / Parry
  public playParry() {
    this.triggerHaptic([25, 35, 25]);
    if (this.isMuted) return;
    this.playSample('effect_anticounter.wav', {
      volume: 0.55,
      pitchJitter: 0.04,
      fallback: () => {
        this.playTone(1760, 'triangle', 0.15, 0.35, 2400);
        this.playTone(880, 'sine', 0.25, 0.3);
      }
    });
    this.playSample('effect_shield01.wav', { volume: 0.38, delayMs: 60 });
  }

  // 11. Healing Spell
  public playHeal() {
    if (this.isMuted) return;
    this.playSample('effect_cure_fld.wav', {
      volume: 0.48,
      fallback: () => {
        this.playTone(523.25, 'sine', 0.2, 0.25);
        setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.25), 80);
      }
    });
    this.playSample('btl_cure1.wav', { volume: 0.4, delayMs: 140 });
  }

  // 12. Protective Shield Buff
  public playShield() {
    if (this.isMuted) return;
    this.playSample('effect_shield01.wav', {
      volume: 0.48,
      fallback: () => this.playTone(220, 'triangle', 0.3, 0.3, 880)
    });
    this.playSample('sys_powerup1.wav', { volume: 0.35, delayMs: 100 });
  }

  // 13. Weapon Ultimate Skill Cast
  public playUltimate(element?: ElementType | string) {
    if (this.isMuted) return;
    this.playSample('summon_impact.wav', {
      volume: 0.58,
      fallback: () => this.playTone(95, 'sawtooth', 0.4, 0.28, 700)
    });

    setTimeout(() => {
      if (element) {
        this.playElementalSpellAttack(element, true, true, false);
      } else {
        this.playSample('battle_7.wav', { volume: 0.5 });
      }
    }, 280);
  }

  // 14. Boss Telegraph Warning
  public playTelegraphWarning() {
    if (this.isMuted) return;
    this.playSample('sys_warning.wav', {
      volume: 0.45,
      fallback: () => {
        [0, 140, 280].forEach(delay => {
          setTimeout(() => this.playTone(660, 'square', 0.08, 0.2), delay);
        });
      }
    });
  }

  // 15. Victory Fanfare (Celebratory FEH Stage Clear Fanfare!)
  public playVictory() {
    this.triggerHaptic([30, 30, 60]);
    if (this.isMuted) return;
    this.playSample('sys_stageclear1.wav', {
      volume: 0.55,
      fallback: () => {
        const notes = [
          { f: 523.25, d: 0.12 },
          { f: 523.25, d: 0.12 },
          { f: 659.25, d: 0.25 },
          { f: 783.99, d: 0.2 },
          { f: 1046.50, d: 0.5 },
        ];
        let time = 0;
        notes.forEach(n => {
          setTimeout(() => this.playTone(n.f, 'triangle', n.d, 0.25), time);
          time += n.d * 1000 + 30;
        });
      }
    });
  }

  // 16. Defeat Sound
  public playDefeat() {
    if (this.isMuted) return;
    this.playSample('btl_dead1.wav', {
      volume: 0.45,
      fallback: () => {
        [440, 415.3, 392, 349.23].forEach((f, i) => {
          setTimeout(() => this.playTone(f, 'sawtooth', 0.35, 0.2, f * 0.85), i * 160);
        });
      }
    });
    this.playSample('sys_powerdown1.wav', { volume: 0.35, delayMs: 350 });
  }

  // 17. Mid-Battle Drop-In / Ally Join
  public playDropIn() {
    if (this.isMuted) return;
    this.playSample('sys_phase_player1.wav', {
      volume: 0.45,
      fallback: () => {
        this.playTone(440, 'triangle', 0.15, 0.2);
        setTimeout(() => this.playTone(554.37, 'triangle', 0.15, 0.22), 120);
        setTimeout(() => this.playTone(659.25, 'triangle', 0.3, 0.25), 240);
      }
    });
  }

  // =========================================================
  // GACHA & SUMMONING RITUAL (FEH CELESTIAL AUDIO)
  // =========================================================

  // 18. Astral Gacha Summon Spin
  public playGachaSpin() {
    if (this.isMuted) return;
    this.playSample('summon_herodic_ring.wav', {
      volume: 0.5,
      fallback: () => {
        for (let i = 0; i < 8; i++) {
          setTimeout(() => this.playTone(350 + i * 90, 'sine', 0.1, 0.15), i * 90);
        }
      }
    });
    this.playSample('summon_orb01.wav', { volume: 0.45, delayMs: 250 });
  }

  // 19. Rarity-Specific Pull Reveal Jingle
  public playGachaRarity(rarity: 3 | 4 | 5 = 3) {
    if (this.isMuted) return;
    if (rarity === 5) {
      this.playGachaLegendary();
    } else if (rarity === 4) {
      this.playSample('summon_star04.wav', {
        volume: 0.5,
        fallback: () => this.playLevelUp()
      });
    } else {
      this.playSample('summon_star03.wav', {
        volume: 0.45,
        fallback: () => this.playClick()
      });
    }
  }

  // 20. 5-Star Legendary Gacha Reveal Fanfare
  public playGachaLegendary() {
    this.triggerHaptic([50, 60, 100]);
    if (this.isMuted) return;
    this.playSample('summon_impact.wav', { volume: 0.55 });
    this.playSample('summon_star05.wav', {
      volume: 0.6,
      delayMs: 200,
      fallback: () => {
        this.playNoise(0.3, 0.3, 2000);
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          setTimeout(() => this.playTone(f, 'square', 0.25, 0.2), i * 140);
        });
      }
    });
  }

  // 21. UI Navigation Click
  public playClick() {
    if (this.isMuted) return;
    this.playSample('sys_select1.wav', {
      volume: 0.45,
      pitchJitter: 0.05,
      fallback: () => this.playTone(800, 'triangle', 0.04, 0.1, 400)
    });
  }

  // 22. Level Up Jingle (FEH Glorious Harp & Trumpet Fanfare)
  public playLevelUp() {
    if (this.isMuted) return;
    this.playSample('jingle_lvup.wav', {
      volume: 0.55,
      fallback: () => {
        this.playSample('sys_levelup1.wav', {
          volume: 0.5,
          fallback: () => {
            [440, 554.37, 659.25, 880].forEach((f, i) => {
              setTimeout(() => this.playTone(f, 'sine', 0.22, 0.25), i * 80);
            });
          }
        });
      }
    });
  }

  // 23. Overworld Footsteps (Muffled flat terrain)
  public playFootstep() {
    if (this.isMuted) return;
    const steps = ['fs_normal_flat_1.wav', 'fs_normal_flat_2.wav', 'fs_normal_flat_3.wav'];
    const chosen = steps[Math.floor(Math.random() * steps.length)];
    this.playSample(chosen, {
      volume: 0.18,
      pitchJitter: 0.1,
    });
  }

  // 23b. Overworld Water Footsteps (Wading in river/pond)
  public playWaterFootstep() {
    if (this.isMuted) return;
    const steps = ['fs_normal_water_1.wav', 'fs_normal_water_2.wav', 'fs_normal_water_3.wav'];
    const chosen = steps[Math.floor(Math.random() * steps.length)];
    this.playSample(chosen, {
      volume: 0.28,
      pitchJitter: 0.12,
    });
  }

  // 24. Shards / Feathers / Gold Loot Gain
  public playLootGain() {
    if (this.isMuted) return;
    this.playSample('sys_wing_get.wav', {
      volume: 0.42,
      fallback: () => this.playTone(1100, 'sine', 0.12, 0.2, 1600)
    });
  }

  // 25. Quest / Mission Modal Open
  public playQuestOpen() {
    if (this.isMuted) return;
    this.playSample('sys_home_mission.wav', {
      volume: 0.45,
      fallback: () => this.playClick()
    });
  }
}

export const soundManager = new SoundManager();
