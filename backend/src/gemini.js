import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gpt-4.1-mini';

const staticTopicQuestions = {
  9: [
    'O que é entrada de dados em programação?',
    'O que é saída de dados?',
    'Qual a diferença entre entrada e saída de dados?',
    'Como exibir uma mensagem no console?',
    'Para que serve o console.log()?',
    'Qual a diferença entre console.log(), console.warn() e console.error()?',
    'Como receber dados do usuário utilizando prompt()?','Como exibir uma mensagem utilizando alert()?','O que é interpolação de strings?','Como utilizar template literals para exibir informações?','Como converter uma entrada de texto para número?','Qual a diferença entre Number(), parseInt() e parseFloat()?','O que acontece quando o usuário digita um valor inválido?','Como validar uma entrada do usuário?','Como impedir que o usuário envie um campo vazio?','Como ler valores digitados em um formulário HTML?','Como acessar o valor de um <input>?','O que é o atributo value?','Como limpar um campo após o envio?','Como exibir resultados na página utilizando JavaScript?','Qual a diferença entre innerHTML e textContent?','Como capturar dados de vários campos de um formulário?','Desenvolva um programa que leia o nome do usuário e exiba uma saudação.','Crie um programa que leia dois números e mostre sua soma.','Faça um programa que leia idade e informe se a pessoa é maior de idade.','Desenvolva um programa que calcule o IMC utilizando dados digitados.','Crie um programa que converta reais para dólares.','Como validar um e-mail informado pelo usuário?','Cite aplicações reais que utilizam entrada e saída de dados.','Explique a importância da validação das entradas do usuário.'
  ],
  10: [
    'O que é um erro em programação?',
    'Quais são os principais tipos de erros?',
    'O que é erro de sintaxe?',
    'O que é erro lógico?',
    'O que é erro de execução?',
    'O que é uma exceção (Exception)?',
    'Para que serve o bloco try?',
    'Para que serve o bloco catch?',
    'Qual a função do bloco finally?',
    'Como lançar um erro utilizando throw?',
    'Quando utilizar throw?',
    'Como tratar um erro sem interromper o programa?',
    'O que é depuração (debug)?',
    'Como utilizar o console do navegador para identificar erros?',
    'O que significa uma Stack Trace?',
    'Como interpretar uma mensagem de erro?',
    'Qual a diferença entre prevenir e tratar erros?',
    'Como validar dados antes de processá-los?',
    'Como evitar divisão por zero?',
    'Como tratar erros em funções?',
    'Como tratar erros em chamadas assíncronas?',
    'Desenvolva um programa utilizando try...catch.',
    'Faça um programa que valide a idade digitada pelo usuário.',
    'Desenvolva um programa que trate erro de conversão de número.',
    'Crie uma função que lance um erro caso um parâmetro seja inválido.',
    'Como registrar erros para facilitar a manutenção?',
    'Quais são as vantagens do tratamento de erros?',
    'Quais problemas podem ocorrer se um sistema não tratar erros?',
    'Cite boas práticas no tratamento de exceções.',
    'Explique a importância do tratamento de erros em sistemas web.'
  ],
  11: [
    'O que é programação assíncrona?',
    'Qual a diferença entre programação síncrona e assíncrona?',
    'O que é uma operação bloqueante?',
    'O que é uma operação não bloqueante?',
    'O que é o Event Loop?',
    'O que é uma Callback?',
    'Quais são as desvantagens das Callbacks?',
    'O que é Callback Hell?',
    'O que é uma Promise?',
    'Quais são os estados de uma Promise?',
    'O que significa uma Promise ser pending?',
    'O que significa uma Promise ser fulfilled?',
    'O que significa uma Promise ser rejected?',
    'Como criar uma Promise?',
    'Para que serve o método .then()?',
    'Para que serve o método .catch()?',
    'Para que serve o método .finally()?',
    'O que é async?',
    'O que é await?',
    'Como utilizar async/await?',
    'Quais são as vantagens de async/await em relação às Promises?',
    'Como tratar erros utilizando try...catch com async/await?',
    'O que é uma requisição HTTP assíncrona?',
    'Como funciona o método fetch()?',
    'O que significa aguardar a resposta de uma API?',
    'Desenvolva uma função utilizando async e await.',
    'Crie uma Promise que retorna uma mensagem após alguns segundos.',
    'Faça um exemplo utilizando setTimeout().',
    'Cite aplicações reais da programação assíncrona.',
    'Explique por que aplicações modernas utilizam programação assíncrona.'
  ],
  12: [
    'O que é o DOM?',
    'O que significa Document Object Model?',
    'Qual a relação entre HTML e DOM?',
    'Como o navegador cria o DOM?',
    'O que é um nó (node) no DOM?',
    'O que é um elemento HTML no DOM?',
    'Como acessar um elemento pelo ID?',
    'Como funciona o método getElementById()?',
    'Como selecionar elementos pela classe?',
    'Como funciona o método getElementsByClassName()?',
    'Como selecionar elementos pela tag?',
    'Como funciona o método getElementsByTagName()?',
    'O que faz o método querySelector()?',
    'O que faz o método querySelectorAll()?',
    'Qual a diferença entre querySelector() e querySelectorAll()?','Como alterar o conteúdo de um elemento?','Qual a diferença entre innerHTML e textContent?','Como alterar o estilo de um elemento pelo JavaScript?','Como adicionar uma classe CSS a um elemento?','Como remover uma classe CSS?','O que faz o classList.add()?','O que faz o classList.remove()?','O que faz o classList.toggle()?','Como criar um elemento dinamicamente?','Como adicionar um elemento à página?','Como remover um elemento do DOM?','Desenvolva um programa que altere o texto de um título.','Crie um botão que altere a cor de um parágrafo.','Desenvolva uma lista dinâmica utilizando DOM.','Explique a importância do DOM em aplicações web.'
  ],
  13: [
    'O que é um evento em programação web?',
    'O que é um Event Listener?',
    'Como adicionar um evento de clique?',
    'O que faz o método addEventListener()?','Qual a diferença entre onclick e addEventListener()?','O que é o evento click?','O que é o evento dblclick?','O que é o evento mouseover?','O que é o evento mouseout?','O que é o evento keydown?','O que é o evento keyup?','O que é o evento submit?','Como impedir o comportamento padrão de um formulário?','O que faz o método preventDefault()?','O que é propagação de eventos?','O que é Event Bubbling?','O que é Event Capturing?','Como acessar informações do evento?','O que representa o objeto event?','Como identificar o elemento que disparou um evento?','Como detectar mudanças em um campo de formulário?','O que é o evento change?','O que é o evento input?','Desenvolva um contador utilizando eventos.','Crie um botão que aumente um valor na tela.','Desenvolva um formulário que valide os dados antes do envio.','Faça um programa que exiba as teclas pressionadas.','Crie um sistema de tema claro/escuro usando eventos.','Cite aplicações reais de eventos em sistemas web.','Explique a importância dos eventos na interação do usuário.'
  ],
  14: [
    'O que é React?','O que é um componente?','Quais são as vantagens dos componentes?','O que é JSX?','Por que o React utiliza JSX?','Qual a diferença entre HTML e JSX?','Como criar um componente funcional?','O que um componente React deve retornar?','O que é o método render?','O que é uma árvore de componentes?','Como importar um componente?','Como exportar um componente?','O que é reutilização de componentes?','Como utilizar expressões JavaScript dentro do JSX?','Como renderizar variáveis no JSX?','Como renderizar listas no React?','O que é a propriedade key?','Por que a key é importante?','Como aplicar classes CSS em JSX?','Qual a diferença entre class e className?','Como adicionar estilos inline?','Como renderizar conteúdo condicional?','Como criar componentes reutilizáveis?','Desenvolva um componente de saudação.','Crie um componente de cartão de usuário.','Desenvolva um componente que exiba uma lista de produtos.','Faça um componente de cabeçalho para um site.','Desenvolva um componente de rodapé.','Cite boas práticas na criação de componentes.','Explique como componentes facilitam a manutenção de projetos.'
  ],
  15: [
    'O que são props no React?','Qual a finalidade das props?','Como passar props para um componente?','Como acessar props em um componente funcional?','Qual a diferença entre props e state?','O que são props somente leitura?','O que é desestruturação de props?','Como definir valores padrão para props?','O que é children no React?','Como utilizar children?','Como passar funções como props?','Como passar objetos como props?','Como passar arrays como props?','Como passar componentes como props?','Como reutilizar componentes utilizando props?','O que é composição de componentes?','Como organizar componentes em pastas?','Qual a importância da separação de responsabilidades?','Como criar componentes reutilizáveis?','Como evitar duplicação de código utilizando componentes?','Desenvolva um componente Card reutilizável.','Crie um componente Button personalizado.','Desenvolva um componente UserCard.','Faça um componente que receba uma lista de produtos.','Desenvolva um componente que exiba informações de um aluno.','Como validar props utilizando PropTypes?','O que é prop drilling?','Como reduzir o excesso de passagem de props?','Cite boas práticas no uso de props.','Explique a importância das props na arquitetura React.'
  ],
  16: [
    'O que é estado (State)?','Qual a diferença entre State e Props?','Para que serve o Hook useState?','Como declarar um estado?','Como atualizar um estado?','Por que o estado não deve ser alterado diretamente?','Como funciona a renderização após uma mudança de estado?','O que acontece quando um estado é atualizado?','O que é um estado inicial?','Como armazenar números no estado?','Como armazenar objetos no estado?','Como armazenar arrays no estado?','Como atualizar objetos no estado?','Como atualizar arrays no estado?','O que é imutabilidade?','Por que a imutabilidade é importante?','O que faz o operador Spread (...)?','O que é o Hook useEffect?','Quando utilizar useEffect?','Como executar um efeito apenas uma vez?','Como executar um efeito quando um estado muda?','O que é Context API?','Quando utilizar Context API?','O que é gerenciamento global de estado?','O que é Redux?','Quando utilizar Redux?','Desenvolva um contador utilizando useState.','Desenvolva um sistema de tema claro e escuro utilizando estado.','Crie um carrinho de compras utilizando estado.','Cite boas práticas para gerenciamento de estado.'
  ],
  17: [
    'O que é um formulário controlado?','Qual a diferença entre formulário controlado e não controlado?','Como controlar um input utilizando useState?','O que é o atributo value?','O que faz o evento onChange?','Como capturar dados de um formulário?','Como controlar um campo de texto?','Como controlar um campo numérico?','Como controlar um checkbox?','Como controlar um radio button?','Como controlar um select?','Como validar um formulário?','Como impedir envio de formulário vazio?','O que faz event.preventDefault()?','Como limpar um formulário após o envio?','Como validar e-mail?','Como validar senha?','Como exibir mensagens de erro?','Como desabilitar um botão até o formulário estar válido?','Como trabalhar com vários inputs?','Desenvolva um formulário de login.','Desenvolva um formulário de cadastro.','Faça um formulário para cálculo de IMC.','Desenvolva um formulário de contato.','Crie um formulário para cadastro de alunos.','Como reutilizar componentes de formulário?','O que são bibliotecas como React Hook Form?','Quando utilizar validação com Yup?','Cite boas práticas em formulários React.','Explique a importância dos formulários controlados.'
  ],
  18: [
    'O que é uma API?','O que significa REST?','O que é Axios?','Qual a vantagem do Axios em relação ao Fetch?','Como instalar o Axios?','Como importar o Axios?','Como realizar uma requisição GET?','Como realizar uma requisição POST?','Como realizar uma requisição PUT?','Como realizar uma requisição PATCH?','Como realizar uma requisição DELETE?','Como enviar dados para uma API?','Como receber dados de uma API?','Como tratar erros com Axios?','Como utilizar async/await com Axios?','Como utilizar .then() com Axios?','Como configurar headers?','O que é um token JWT?','Como enviar um token na requisição?','O que é autenticação?','O que é autorização?','Como utilizar interceptors?','Como cancelar uma requisição?','Como consumir uma API pública?','Desenvolva uma aplicação que liste usuários.','Faça um cadastro utilizando Axios.','Desenvolva uma busca por produtos utilizando API.','Como exibir um loading durante uma requisição?','Cite boas práticas no consumo de APIs.','Explique a importância do tratamento de erros em requisições HTTP.'
  ],
  19: [
    'O que é React Router?','Qual a finalidade do React Router?','Como instalar React Router?','O que é BrowserRouter?','O que é Routes?','O que é Route?','Como criar uma rota?','Como criar uma rota dinâmica?','O que são parâmetros de rota?','Como utilizar useParams()?','O que faz useNavigate()?','Como navegar programaticamente?','O que é o componente Link?','Qual a diferença entre Link e <a>?','Como criar uma página inicial?','Como criar uma página 404?','O que é roteamento aninhado?','Como proteger uma rota?','O que é uma rota privada?','Como redirecionar usuários não autenticados?','Desenvolva uma aplicação com três páginas.','Faça um menu utilizando React Router.','Desenvolva uma rota para detalhes de um produto.','Crie uma navegação entre páginas.','Desenvolva um sistema de login com rota protegida.','Como organizar as rotas em projetos grandes?','O que é Lazy Loading?','Como utilizar React.lazy()?','Cite boas práticas na organização das rotas.','Explique a importância do roteamento em aplicações SPA.'
  ],
  20: [
    'O que são boas práticas de programação?','Por que escrever código limpo?','O que é Clean Code?','O que significa legibilidade de código?','Como nomear variáveis corretamente?','Como nomear funções corretamente?','O que é reutilização de código?','O que é modularização?','O que é DRY?','O que é KISS?','O que é SOLID?','O que é responsabilidade única?','Como organizar pastas em um projeto React?','Como documentar um projeto?','Qual a importância do README?','O que é Git?','O que é GitHub?','Qual a diferença entre Git e GitHub?','O que é um commit?','Como escrever boas mensagens de commit?','O que é uma branch?','Como funciona um Pull Request?','O que é revisão de código?','O que são testes automatizados?','O que é responsividade?','O que é acessibilidade?','Como melhorar o desempenho de uma aplicação React?','Quais práticas aumentam a segurança de aplicações web?','Cite cinco boas práticas utilizadas em projetos profissionais.','Explique como boas práticas facilitam a manutenção e evolução de um sistema.'
  ]
};

function buildStaticQuestions(orderIndex) {
  const questions = staticTopicQuestions[orderIndex];
  if (!questions) return null;
  return questions.map((question, index) => ({
    id: index + 1,
    question,
    answer_key: `Resposta esperada para a pergunta ${index + 1}.`,
    feedback: `Feedback para a pergunta ${index + 1}: revise os pontos principais do tópico e aplique o conceito corretamente.`
  }));
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    return simulateGemini(prompt);
  }

  const body = {
    model: GEMINI_MODEL,
    messages: [
      { role: 'system', content: 'Você é um assistente pedagógico adaptativo.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 700
  };

  const response = await axios.post(GEMINI_API_URL, body, {
    headers: {
      Authorization: `Bearer ${GEMINI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.data?.choices?.[0]?.message?.content || '';
}

function simulateGemini(prompt) {
  if (prompt.includes('diagnóstico inicial')) {
    return `1. Identificar conceitos básicos de programação em JavaScript\n2. Entender lógica condicional e estruturas de repetição\n3. Aplicar funções e manipulação de arrays\n4. Introdução ao React e componentes\n5. Prática de construção de formulários e estado.`;
  }

  if (prompt.includes('trilha de estudo')) {
    const trilhas = Array.from({ length: 20 }, (_, index) => ({
      title: `Tópico ${index + 1}: Conceito Essencial ${index + 1}`,
      description: `Descrição do tópico ${index + 1} para reforçar conhecimentos em desenvolvimento de sistemas adaptativos.`,
      content: `Conteúdo do tópico ${index + 1}: exemplos práticos, explicações claras e exercícios para aprofundar a aprendizagem.`
    }));
    return JSON.stringify(trilhas);
  }

  if (prompt.includes('questionário de verificação')) {
    const questions = Array.from({ length: 30 }, (_, index) => ({
      id: index + 1,
      question: `Pergunta ${index + 1}: Explique o conceito principal de ${prompt.includes('tópico') ? prompt.split('tópico: ')[1]?.split('.')[0] : 'este tópico'} e sua aplicação prática.`,
      answer_key: `Resposta esperada para a pergunta ${index + 1}.`, 
      feedback: `Feedback para a pergunta ${index + 1}: revise os pontos principais do tópico e aplique o conceito corretamente.`
    }));
    return JSON.stringify(questions);
  }

  if (prompt.includes('feedback')) {
    return `Você respondeu ${prompt.includes('14') ? 'corretamente' : 'incorreto'}. ${prompt.includes('14') ? 'Ótimo trabalho mantendo a precedência de operadores.' : 'Reveja a ordem de operações e a precedência entre multiplicação e adição.'}`;
  }

  return 'Desculpe, não consegui gerar o conteúdo pedido. Tente novamente.';
}

const fallbackTopics = [
  'Lógica de programação e estruturas básicas',
  'Variáveis, tipos e operadores',
  'Controle de fluxo e decisões',
  'Estruturas de repetição',
  'Funções e modularização',
  'Trabalhando com arrays',
  'Objetos e manipulação de dados',
  'Manipulação de strings',
  'Entrada e saída de dados',
  'Tratamento de erros',
  'Conceitos de programação assíncrona',
  'Introdução ao DOM',
  'Eventos em aplicações web',
  'Componentes React e JSX',
  'Props e estrutura de componentes',
  'Gerenciamento de estado',
  'Formulários controlados em React',
  'Consumo de APIs com Axios',
  'Roteamento com React Router',
  'Boa prática de desenvolvimento web'
];

function parseStudyPathResult(result) {
  try {
    const data = JSON.parse(result);
    if (Array.isArray(data) && data.length >= 20) return data.slice(0, 20);
    if (Array.isArray(data) && data.length > 0) {
      return data
        .slice(0, 20)
        .concat(
          Array.from({ length: 20 - data.length }, (_, index) => ({
            title: fallbackTopics[data.length + index] || `Tópico ${data.length + index + 1}`,
            description: `Tópico adicional gerado para completar a trilha adaptativa.`,
            content: `Conteúdo adicional para ${fallbackTopics[data.length + index] || `Tópico ${data.length + index + 1}`}.`
          }))
        );
    }
  } catch (error) {
    // não faz nada
  }

  const lines = result.split(/\r?\n/).filter(Boolean);
  const topics = lines.slice(0, 20).map((line, index) => {
    const title = line.replace(/^\d+\.\s*/, '').trim();
    return {
      title: title || fallbackTopics[index] || `Tópico ${index + 1}`,
      description: `Tópico ${index + 1} gerado a partir do diagnóstico para reforçar a aprendizagem de desenvolvimento de sistemas adaptativos.`,
      content: `Conteúdo estimado para ${title || fallbackTopics[index] || `Tópico ${index + 1}`} baseado no diagnóstico.`
    };
  });

  if (topics.length === 20) return topics;

  return fallbackTopics.map((topicTitle, index) => ({
    title: `Tópico ${index + 1}: ${topicTitle}`,
    description: `Descrição do tópico ${index + 1} para reforçar conhecimentos em desenvolvimento de sistemas adaptativos.`,
    content: `Conteúdo do tópico ${index + 1}: exemplos práticos, explicações claras e exercícios para aprofundar a aprendizagem.`
  }));
}

function fillQuestions(questions, topic) {
  const base = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    question: `Pergunta ${index + 1}: Explique o conceito principal de ${topic.title} e sua aplicação prática.`,
    answer_key: `Resposta esperada para a pergunta ${index + 1}.`, 
    feedback: `Feedback para a pergunta ${index + 1}: revise os pontos principais do tópico e aplique o conceito corretamente.`
  }));
  return questions.concat(base).slice(0, 30).map((item, index) => ({
    ...item,
    id: item.id ?? index + 1
  }));
}

function parseAssessmentResult(result, topic) {
  try {
    const data = JSON.parse(result);
    if (Array.isArray(data)) return fillQuestions(data, topic);
    if (data.question && data.answer_key) return fillQuestions([data], topic);
  } catch (error) {
    // fallback para texto simples
  }

  const lines = result.split(/\r?\n/).filter(Boolean);
  const questions = lines.slice(0, 30).map((line, index) => ({
    question: line.replace(/^\d+\.\s*/, '').trim() || `Pergunta ${index + 1}: Explique ${topic.title}.`, 
    answer_key: `Resposta esperada para a pergunta ${index + 1}.`, 
    feedback: `Feedback para a pergunta ${index + 1}: reforçar os principais pontos sobre ${topic.title}.`
  }));

  return fillQuestions(questions, topic);
}

export async function generateDiagnosis(answers) {
  const prompt = `Use as respostas do diagnóstico inicial para identificar lacunas de conhecimento. Respostas: ${JSON.stringify(answers)}.`;
  return callGemini(prompt);
}

export async function generateStudyPath(diagnosisText) {
  const prompt = `A partir do diagnóstico inicial, gere uma trilha de estudo com 20 tópicos: título, descrição e conteúdo. Diagnóstico: ${diagnosisText}`;
  const result = await callGemini(prompt);
  return parseStudyPathResult(result);
}

export async function generateAssessment(topic) {
  const staticQuestions = buildStaticQuestions(topic.order_index);
  if (staticQuestions) {
    return staticQuestions;
  }

  const prompt = `Gere um questionário de verificação com 30 perguntas, cada uma com answer_key e feedback, para o tópico: ${topic.title}. Conteúdo: ${topic.content}`;
  const result = await callGemini(prompt);
  const parsed = parseAssessmentResult(result, topic);
  return parsed.length ? parsed : Array.from({ length: 30 }, (_, index) => ({
    question: `Pergunta ${index + 1}: Explique o conceito principal de ${topic.title} e sua aplicação prática.`,
    answer_key: `Resposta esperada para a pergunta ${index + 1}.`, 
    feedback: `Feedback para a pergunta ${index + 1}: revise os pontos principais do tópico e aplique o conceito corretamente.`
  }));
}

export async function generateFeedback(studentAnswer, answerKey) {
  const prompt = `Avalie a resposta do estudante e gere um feedback. Resposta: ${studentAnswer}. Gabarito: ${answerKey}`;
  return callGemini(prompt);
}
