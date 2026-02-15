export class SoundManager {
    private static ctx: AudioContext | null = null;

    private static getContext(): AudioContext {
        if (!this.ctx) {
            // AudioContext must be resumed after user interaction
            // We'll lazy load it
            const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
            this.ctx = new Ctx();
        }
        return this.ctx!;
    }

    private static isSoundEnabled(): boolean {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('gofit_sound') === 'true';
    }

    private static playTone(freq: number, type: OscillatorType, duration: number, gainVal: number = 0.1) {
        if (!this.isSoundEnabled()) return;

        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(gainVal, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error("Audio Playback Error", e);
        }
    }

    static playClick() {
        // High-tech blip - softer volume
        this.playTone(800, 'sine', 0.05, 0.03);
    }

    static playHover() {
        // Subtle tick
        this.playTone(400, 'triangle', 0.05, 0.05);
    }

    static playToggle() {
        // Mechanical switch sound (two distinct tones)
        if (!this.isSoundEnabled()) return;
        try {
            const ctx = this.getContext();
            const t = ctx.currentTime;

            // Tone 1
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.frequency.setValueAtTime(600, t);
            osc1.type = 'square';
            gain1.gain.setValueAtTime(0.05, t);
            gain1.gain.linearRampToValueAtTime(0, t + 0.1);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(t);
            osc1.stop(t + 0.1);

            // Tone 2
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.frequency.setValueAtTime(1200, t + 0.05);
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.05, t + 0.05);
            gain2.gain.linearRampToValueAtTime(0, t + 0.15);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(t + 0.05);
            osc2.stop(t + 0.15);

        } catch (e) { }
    }

    static playSuccess() {
        // Level up / Achievement sound
        if (!this.isSoundEnabled()) return;
        try {
            const ctx = this.getContext();
            const t = ctx.currentTime;

            // Arpeggio
            [440, 554, 659, 880].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const startTime = t + i * 0.1;

                osc.frequency.setValueAtTime(freq, startTime);
                osc.type = 'triangle';

                gain.gain.setValueAtTime(0.1, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.5);
            });
        } catch (e) { }
    }

    static playStart() {
        // Power up sound
        if (!this.isSoundEnabled()) return;
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
            osc.type = 'sawtooth';

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) { }
    }
}
