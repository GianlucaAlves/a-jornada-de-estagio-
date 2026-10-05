/**
 * Sprite animado por TIRA DE QUADROS.
 *
 * O objetivo declarado pelo dono do projeto é que a cena não pareça "um pedaço
 * de papel se arrastando pelo cenário". O `jogo-bob` antigo — o sprite inteiro
 * balançando com rotação — era literalmente isso: nada dentro da figura mexe,
 * então o olho lê um decalque sendo empurrado.
 *
 * A entrega é a da bíblia §6.3: a arte vem num PNG com os quadros lado a lado e
 * o CSS anda o `background-position` com `steps(n)`. Zero timer em JS, zero
 * re-render de React por quadro — o que importa numa apresentação ao vivo, em
 * que um engasgo de animação é visível para a plateia inteira.
 *
 * Duas coisas que este componente resolve e que não são óbvias:
 *
 * 1. A TIRA PODE NÃO EXISTIR. `background-image` que aponta para 404 não cai
 *    em fallback: o elemento simplesmente fica vazio, e o sprite DESAPARECE da
 *    cena. Por isso a tira é sondada com `Image()` antes de ser usada, uma vez
 *    por caminho e por sessão, e só então o componente troca de modo.
 * 2. SEM TIRA, AINDA ASSIM RESPIRA. Enquanto a arte não chega, a figura recebe
 *    uma respiração aproximada por CSS: o sprite inteiro sobe 1 px de arte em
 *    dois passos duros. Não é o ombro subindo (isso só a tira dá), mas já tira
 *    a cara de adesivo — e é o que a apresentação mostra até a arte existir.
 */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { caminhoDaTira } from '../assets/manifest';
import { quadro } from '../styles/tokens';
import { Imagem } from './Imagem';

/**
 * 'parado' e 'andando' são figuras (Ana, NPCs) e animam de um jeito ou de
 * outro sempre. 'estatico' é objeto de cenário: só se move se a arte trouxer
 * uma tira de ambiente (cursor piscando, vapor da caneca) — monitor que
 * respira lê como erro, não como vida.
 */
export type EstadoDeSprite = 'parado' | 'andando' | 'estatico';

/** Caminhos de tira já sondados nesta sessão. */
const sondados = new Map<string, boolean>();
/** Sondagens em curso, para que dez NPCs não disparem dez requisições iguais. */
const emCurso = new Map<string, Promise<boolean>>();

function sondarTira(caminho: string): Promise<boolean> {
  const conhecido = sondados.get(caminho);
  if (conhecido !== undefined) return Promise.resolve(conhecido);
  const pendente = emCurso.get(caminho);
  if (pendente !== undefined) return pendente;

  const sondagem = new Promise<boolean>((resolver) => {
    // Em teste (ambiente node) não há Image: a resposta honesta é "não tem".
    if (typeof window === 'undefined' || typeof window.Image === 'undefined') {
      resolver(false);
      return;
    }
    const img = new window.Image();
    img.onload = () => resolver(img.naturalWidth > 0);
    img.onerror = () => resolver(false);
    img.src = caminho;
  }).then((existe) => {
    sondados.set(caminho, existe);
    emCurso.delete(caminho);
    return existe;
  });

  emCurso.set(caminho, sondagem);
  return sondagem;
}

/** Quantos quadros cada tira tem, conforme a bíblia §6.2. */
const QUADROS_DA_TIRA: Record<EstadoDeSprite, number> = {
  parado: 2,
  andando: 4,
  estatico: 2,
};

const CLASSE_DA_TIRA: Record<EstadoDeSprite, string> = {
  parado: 'jogo-tira-2',
  andando: 'jogo-tira-4',
  estatico: 'jogo-tira-2',
};

/** Animação de emergência, usada só enquanto a tira do estado não existe. */
const CLASSE_SEM_TIRA: Record<EstadoDeSprite, string | null> = {
  parado: 'jogo-respira',
  andando: 'jogo-anda',
  estatico: null,
};

export interface PropsSpriteAnimado {
  /** Id de asset do manifest (o quadro parado). A tira é derivada dele. */
  id: string;
  rotulo: string;
  largura: number;
  altura: number;
  estado: EstadoDeSprite;
  /**
   * Atraso do ciclo, em ms. Figuras respirando no mesmo compasso parecem uma
   * engrenagem; o atraso é o que as torna pessoas paradas (bíblia §6.2).
   */
  atrasoMs?: number;
  decorativo?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Estilo inline da tira de quadros.
 *
 * Função pura e exportada para poder ser TESTADA. O bug que motivou isto era
 * invisível em teste de render: a sondagem da tira devolve `false` fora do
 * navegador, então o componente sempre cai no ramo sem tira e o estilo da tira
 * nunca aparecia no markup. O defeito (deslocamento em porcentagem negativa,
 * que jogava o sprite fora do elemento e fazia os NPCs piscarem) viveu
 * exatamente nesse ponto cego.
 */
export function estiloDaTira(
  caminho: string,
  quadros: number,
  largura: number,
  altura: number,
): CSSProperties {
  return {
    width: largura,
    height: altura,
    backgroundImage: `url('${caminho}')`,
    // A tira tem n quadros da largura do sprite: esticar em n x 100% deixa
    // cada quadro do tamanho exato da caixa, e o keyframe só anda.
    backgroundSize: `${quadros * 100}% 100%`,
    // Deslocamento em PIXEL, lido pelo keyframe `jogo-quadros`. Ver o
    // comentário em global.css: porcentagem em `background-position` resolve
    // contra (caixa - imagem), que é negativo quando a imagem é maior, então
    // `-200%` empurrava o sprite para FORA do elemento.
    ['--tira-fim' as string]: `${-quadros * largura}px`,
  };
}

export function SpriteAnimado({
  id,
  rotulo,
  largura,
  altura,
  estado,
  atrasoMs = 0,
  decorativo = false,
  className,
  style,
}: PropsSpriteAnimado): JSX.Element {
  const caminho = caminhoDaTira(id, estado === 'andando' ? 'andando' : 'idle');
  const [sondagemAtual, setSondagemAtual] = useState<{ caminho: string | null; existe: boolean }>(
    () => ({ caminho, existe: caminho !== null && sondados.get(caminho) === true }),
  );
  // O resultado pertence ao caminho sondado. Reaproveitar o booleano do
  // sprite anterior fazia a nova pose desaparecer durante a primeira carga.
  const temTira = caminho !== null && (sondados.get(caminho) === true || (sondagemAtual.caminho === caminho && sondagemAtual.existe));

  useEffect(() => {
    if (caminho === null) {
      setSondagemAtual({ caminho, existe: false });
      return;
    }
    let vivo = true;
    void sondarTira(caminho).then((existe) => {
      if (vivo) setSondagemAtual({ caminho, existe });
    });
    return () => {
      vivo = false;
    };
  }, [caminho]);

  const duracaoMs = estado === 'andando' ? quadro.andandoMs : quadro.idleMs;

  if (temTira && caminho !== null) {
    const n = QUADROS_DA_TIRA[estado];
    return (
      <div
        className={[className, 'jogo-sprite', CLASSE_DA_TIRA[estado]].filter(Boolean).join(' ')}
        role={decorativo ? undefined : 'img'}
        aria-label={decorativo ? undefined : rotulo}
        aria-hidden={decorativo ? true : undefined}
        style={{
          ...estiloDaTira(caminho, n, largura, altura),
          animationDuration: `${duracaoMs}ms`,
          animationDelay: `${atrasoMs}ms`,
          ...style,
        }}
      />
    );
  }

  const classeDeEmergencia = CLASSE_SEM_TIRA[estado];
  return (
    <Imagem
      id={id}
      rotulo={rotulo}
      largura={largura}
      altura={altura}
      mostrarRotulo={false}
      decorativo={decorativo}
      className={[className, classeDeEmergencia].filter(Boolean).join(' ')}
      style={{
        width: largura,
        height: altura,
        animationDuration: `${duracaoMs}ms`,
        animationDelay: `${atrasoMs}ms`,
        ...style,
      }}
    />
  );
}

/**
 * Atraso estável derivado de um id.
 *
 * Determinístico de propósito: aleatório por render faria o NPC "pular" de
 * fase a cada re-render do React, e um salto de fase é mais visível que a
 * sincronia que ele tenta evitar.
 */
export function atrasoDoId(id: string): number {
  let acumulado = 0;
  for (let i = 0; i < id.length; i += 1) {
    acumulado = (acumulado * 31 + id.charCodeAt(i)) % 997;
  }
  return Math.round((acumulado / 997) * quadro.atrasoMaximoMs);
}

export default SpriteAnimado;
