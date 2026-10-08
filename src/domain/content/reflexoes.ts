/** Monólogos autorizados na especificação; não antecipam recompensas ou escolhas. */
import type { BlocoId, LugarId } from '../types';
export interface ReflexaoDeBloco {
  lugarId: LugarId;
  tempo: string;
  falas: readonly string[];
  gancho: string;
}
export const REFLEXOES: Record<BlocoId, ReflexaoDeBloco> = {
  1: { lugarId: 'escritorio', tempo: 'O primeiro dia', falas: [
    'Primeiro dia. Meu coração tá batendo tão rápido que parece que todo mundo consegue ouvir.',
    'Eu preciso parecer que sei o que estou fazendo. Se alguém perceber que eu não sei nada, vai achar que eu não deveria estar aqui.',
    'Talvez eu consiga resolver tudo sozinha... é só prestar atenção e não incomodar ninguém.',
  ], gancho: 'Quando você chegou em algum lugar novo, o que fez para não parecer despreparado(a)?' },
  2: { lugarId: 'cafezinho', tempo: '1 mês depois', falas: [
    'Um mês. Já sei onde fica o café e como entrar no sistema. Mas ainda tem muita coisa que a faculdade não falou.',
    'Agora todo mundo me pede alguma coisa. Uma planilha, uma ata, um status pra ontem. E eu digo sim pra tudo e guardo tudo de cabeça.',
    'Esta semana escapou um prazo. Não foi falta de vontade, foi falta de um jeito de me organizar.',
    'E tem coisa que me pedem e eu ainda não sei fazer. Quando tudo chega junto, eu travo e tento fazer tudo ao mesmo tempo.',
  ], gancho: 'Quando muita coisa chega ao mesmo tempo, qual é a sua reação? E o que já te cobram que você ainda não sabe fazer?' },
  3: { lugarId: 'linha-producao', tempo: '6 meses depois', falas: [
    'Seis meses. Eu já não me perco tanto, e quando não entendo alguma coisa, sei como perguntar.',
    'Tem algo estranho nesses números. Ninguém me pediu pra olhar, e talvez nem seja problema meu.',
    'Mas eu não consigo deixar passar. Eu gosto de descobrir onde a informação trava.',
  ], gancho: 'Quando percebe um problema que ninguém pediu para resolver, o que você sente? E o que faz?' },
  4: { lugarId: 'sala-reunioes', tempo: '1 ano depois', falas: [
    'Um ano. Eu fiz coisas. Mas quem sabe disso além de mim?',
    'Só de pensar em ficar na frente de todo mundo, minhas mãos gelam.',
    'Acho que posso gostar de organizar tudo isso e ainda assim não gostar de ser o centro das atenções. Uma coisa não precisa vir com a outra.',
  ], gancho: 'O que você já fez que merece ser conhecido? O que te impede de contar?' },
  5: { lugarId: 'outra-area', tempo: 'Fim do contrato', falas: [
    'Meu contrato está acabando. Eu quero ficar, isso eu sei.',
    'Mas, se me efetivarem, eu quero continuar nessa área? E se não, pra onde eu vou?',
    'Eu fiz a minha parte: aprendi, entreguei e tomei iniciativa. Se não houver vaga, isso não apaga meu trabalho. O conhecimento e a experiência seguem comigo.',
    'Quero explorar desenvolvimento de software. A vaga e a escolha da minha carreira são coisas diferentes.',
  ], gancho: 'Que tipo de problema você gosta de resolver, independentemente do cargo?' },
  6: { lugarId: 'cafezinho', tempo: 'Festa da efetivação', falas: [
    'Hoje assinaram minha efetivação no time de desenvolvimento de software. Eu tô feliz demais — ainda estou tentando acreditar.',
    'Escolhi desenvolvimento porque gosto de entender como a informação chega a quem precisa e como os sistemas conectam as equipes.',
    'Agora vou estudar como os serviços do time se conectam e começar com projetos pequenos, aprendendo com quem já trabalha na área.',
  ], gancho: 'Que trabalho seu outras pessoas poderiam conhecer melhor depois de você contar o que fez?' },
};
