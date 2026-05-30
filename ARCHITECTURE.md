# Arquitetura - Aplicação de Exercícios de Teoria Musical

## Visão Geral

Aplicação web para exercícios de leitura de notas musicais no pentagrama (Clave de Sol, notas naturais). Alunos respondem exercícios e professores acompanham o desempenho via painel de ranking.

## Schema do Banco de Dados

### Tabela: `sessions`
Armazena cada sessão de exercício de um aluno.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT PK | ID único da sessão |
| studentName | VARCHAR(255) | Nome do aluno (não precisa estar autenticado) |
| totalQuestions | INT | Número total de questões na sessão |
| correctAnswers | INT | Número de respostas corretas |
| createdAt | TIMESTAMP | Data/hora de criação |
| updatedAt | TIMESTAMP | Data/hora de atualização |

### Tabela: `answers`
Armazena cada resposta individual dentro de uma sessão.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT PK | ID único da resposta |
| sessionId | INT FK | Referência à sessão |
| questionNumber | INT | Número da pergunta (1-10) |
| correctNote | VARCHAR(10) | Nota correta (Dó, Ré, Mi, Fá, Sol, Lá, Si) |
| studentAnswer | VARCHAR(10) | Resposta do aluno |
| isCorrect | BOOLEAN | Se a resposta foi correta |
| createdAt | TIMESTAMP | Data/hora da resposta |

## Fluxo de Dados

### Fluxo do Aluno
1. Aluno acessa a aplicação
2. Digita seu nome na tela inicial
3. Inicia o exercício (10 questões)
4. Para cada questão:
   - Sistema exibe pentagrama com nota aleatória
   - Aluno seleciona/digita a resposta
   - Sistema valida e exibe feedback imediato
   - Resposta é armazenada no banco
5. Após 10 questões, exibe resultado final
6. Aluno pode reiniciar ou sair

### Fluxo do Professor
1. Professor acessa o painel de ranking
2. Visualiza lista de todas as sessões
3. Para cada sessão: nome, acertos, erros, percentual
4. Pode filtrar/ordenar por aluno ou data

## Componentes Frontend

- **Home.tsx**: Tela inicial com input de nome
- **ExerciseScreen.tsx**: Tela principal do exercício
- **StaffDisplay.tsx**: Renderização do pentagrama com nota
- **AnswerInput.tsx**: Campo de resposta
- **FeedbackDisplay.tsx**: Feedback de acerto/erro
- **ResultsScreen.tsx**: Tela de resultados finais
- **RankingPanel.tsx**: Painel de ranking (professor)

## Procedures tRPC

### Públicas
- `exercise.startSession(studentName, totalQuestions)` → sessionId
- `exercise.submitAnswer(sessionId, questionNumber, studentAnswer)` → { isCorrect, correctNote }
- `exercise.getSessionResults(sessionId)` → { results, stats }

### Protegidas (Professor)
- `ranking.getAllSessions()` → [sessions]
- `ranking.getSessionDetails(sessionId)` → { session, answers }

## Notas Musicais (Clave de Sol, Naturais)

Notas do pentagrama em ordem ascendente:
- Espaços: Fá, Lá, Dó, Mi
- Linhas: Mi, Sol, Si, Ré, Fá

Ordem completa (de baixo para cima): Mi, Fá, Sol, Lá, Si, Dó, Ré, Mi, Fá

## Design Visual

- **Paleta de cores**: Elegante, sofisticada (azul profundo, branco, acentos em ouro/dourado)
- **Tipografia**: Fontes modernas e refinadas
- **Espaçamento**: Generoso, com respiração visual
- **Animações**: Suaves e profissionais
- **Pentagrama**: Renderizado com SVG para precisão
