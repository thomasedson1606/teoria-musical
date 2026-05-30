# Requisitos Visuais e Funcionais - Análise do PDF

## Observações do Usuário

1. **Clave de Sol**: Desenho atual não está claro/identificável. Precisa de um desenho mais profissional e reconhecível da Clave de Sol.

2. **Posicionamento de Notas**: As notas não estão bem posicionadas no pentagrama. Necessário corrigir as coordenadas Y das notas.

3. **Total de Atividades**: Aumentar de 10 para 20 atividades aleatórias.

## Análise do PDF

### Página 1 - Exemplo Negativo
- Mostra um pentagrama com uma nota posicionada incorretamente
- Texto em vermelho: "Assim não esta bonito, não da pra saber onde esta a nota."
- Clave de Sol visível (referência para o desenho correto)

### Páginas 2-4 - Exemplos de Atividades
- **Atividade 1 (Página 2)**: "Que nota é esta?"
  - Pentagrama com Clave de Sol
  - Uma nota (bolinha) posicionada em uma linha/espaço
  - 7 botões com nomes de notas: Dó, Ré, Mi, Fá, Sol, Lá, Si
  - Aluno clica no botão correspondente à nota

- **Atividade 2 (Página 3)**: Similar à Atividade 1
  - Mesma estrutura: pentagrama, nota, botões

- **Atividade 3 (Página 4)**: Atividade Inversa
  - Pentagrama com Clave de Sol
  - Nome da nota exibido (ex: "Dó")
  - Uma bolinha/nota posicionada abaixo do pentagrama
  - Aluno arrasta a nota até a posição correta no pentagrama

## Requisitos de Implementação

1. **Desenho da Clave de Sol**: Melhorar o SVG da clave para ser mais claro e profissional
2. **Posicionamento Preciso**: Corrigir as posições Y das notas no pentagrama
3. **20 Atividades**: Total de 20 questões ao invés de 10
4. **Tipo 1 - Identificação**: Nota visível, aluno clica no botão correto (Páginas 2-3)
5. **Tipo 2 - Posicionamento**: Nome da nota dado, aluno arrasta até a posição correta (Página 4)
6. **Botões Interativos**: 7 botões com nomes de notas para clicar (mais intuitivo que dropdown)

## Notas Musicais (Clave de Sol)

Ordem do pentagrama (de cima para baixo):
- Linha 5: Fá
- Espaço 4: Mi
- Linha 4: Ré
- Espaço 3: Dó
- Linha 3: Si
- Espaço 2: Lá
- Linha 2: Sol
- Espaço 1: Fá (nota mais baixa)

Total de 8 posições possíveis no pentagrama básico.
