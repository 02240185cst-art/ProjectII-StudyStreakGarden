// "Session complete" chime. Wrapped so a missing audio module can never crash a session.
export function playChime() {
  try {
    const { createAudioPlayer } = require('expo-audio');
    const player = createAudioPlayer(require('../../assets/chime.wav'));
    player.play();
    setTimeout(() => { try { player.remove(); } catch (e) {} }, 3000);
  } catch (e) {
    /* ignore */
  }
}
