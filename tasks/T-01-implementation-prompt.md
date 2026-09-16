# Prompt de implementação — T-01

Você é o Coding Agent do Weather App. Implemente somente a tarefa **T-01 — Preparar a estrutura técnica da aplicação**.

## Contexto

Este repositório segue o fluxo Spec-Driven Development:

`Spec → Plan → Tasks → Code → Test`

A aplicação será uma SPA em React 19 + TypeScript strict + Vite, com Tailwind CSS, Vitest/Testing Library, Playwright, Biome e pnpm. A arquitetura separa:

- `src/components/`: apresentação;
- `src/hooks/`: orquestração de estado;
- `src/services/`: acesso às APIs;
- `src/lib/`: funções puras;
- `src/types/`: contratos compartilhados;
- `tests/`: testes unitários, de integração e E2E.

A tarefa é a primeira do backlog e não deve implementar contratos de domínio, funções de negócio, chamadas de API ou componentes da aplicação. Essas responsabilidades pertencem às tarefas posteriores.

## Objetivo

Deixar a base do projeto pronta para receber as próximas tarefas, preservando o setup existente e sem introduzir funcionalidades fora do escopo.

## Critérios de aceite

1. Existem os entrypoints `src/main.tsx`, `src/App.tsx` e `src/index.css`.
2. Existem os diretórios `src/components/`, `src/hooks/`, `src/services/`, `src/lib/`, `src/types/` e `tests/`.
3. A aplicação inicia pelo entrypoint configurado pelo Vite e renderiza uma tela inicial mínima, sem integração com API.
4. O TypeScript compila em modo strict com `pnpm build`.
5. Os scripts `pnpm lint`, `pnpm build` e `pnpm test` estão disponíveis no `package.json` e executam sem erro de configuração.
6. A estrutura não contém chamadas reais à Open-Meteo, estado meteorológico ou regras de negócio antecipadas.
7. As alterações permanecem compatíveis com React, Vite, Tailwind, Biome, Vitest e pnpm já configurados no repositório.

## Arquivos permitidos ou prováveis

Pode criar ou editar apenas o necessário nestes caminhos:

- `src/main.tsx`
- `src/App.tsx`
- `src/index.css`
- `src/components/`
- `src/hooks/`
- `src/services/`
- `src/lib/`
- `src/types/`
- `tests/`
- `package.json`, somente se for necessário completar scripts existentes
- arquivos de configuração do Vite/Tailwind/Vitest/Biome, somente se a execução exigir ajuste de configuração

Não edite `specs/`, `plans/` ou `tasks/` para resolver a implementação.

## Regras de implementação

- Leia primeiro as instruções aplicáveis em `.github/instructions/`.
- Preserve configurações e alterações existentes que não sejam necessárias para T-01.
- Use TypeScript strict e não use `any`.
- Mantenha a tela mínima acessível: a raiz deve ter estrutura semântica básica e texto compreensível.
- Não adicione dependências sem necessidade.
- Não implemente busca, clima, previsão, conversão de unidade, retry ou integração de API.
- Não crie testes de comportamento meteorológico; apenas garanta que a suíte vazia ou existente continue executável.

## Validação obrigatória

Execute, nesta ordem:

```bash
pnpm lint
pnpm build
pnpm test
```

Se algum comando falhar, corrija somente problemas causados ou revelados pela implementação de T-01 e execute novamente o comando afetado. Ao finalizar, informe:

- arquivos alterados;
- resultado de cada comando;
- qualquer limitação ou problema preexistente identificado.

## Resultado esperado

Entregar uma fundação React/Vite compilável, lintável e testável, com os diretórios da arquitetura preparados e uma tela inicial mínima, sem antecipar o trabalho das tarefas T-02 em diante.
