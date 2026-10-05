import { progressao } from '../styles/tokens';

/** Traço quadrado compartilhado: os sinais pertencem ao mesmo mundo dos sprites. */
export function IconeJornada({ tipo }: { tipo: 'pensamento' | 'conversa' | 'minigame' }): JSX.Element {
  const desenhos = {
    pensamento: 'M4 20V6H22V18H12L8 22H4 M10 10H16V14H10Z M2 26H6 M24 4H28V8',
    conversa: 'M3 4H23V17H11L7 21V17H3Z M13 21H22L26 25V21H29V10H26 M7 9H19 M7 13H15',
    minigame: 'M7 7H25V25H7Z M12 12H20V20H12Z M11 2V7 M21 2V7 M11 25V30 M21 25V30 M2 11H7 M2 21H7 M25 11H30 M25 21H30',
  };
  return <svg aria-hidden="true" width={progressao.icone} height={progressao.icone} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" style={{ flexShrink: 0, verticalAlign: 'middle' }}><path d={desenhos[tipo]} /></svg>;
}
