# Tarefas do Weather App

Backlog derivado de `plans/weather-app-plan.md`. As tarefas estão ordenadas por
dependência e agrupadas na sequência: tipos → funções puras → services → hooks
→ componentes → integração → testes → hardening. Cada tarefa cobre uma unidade
pequena, testável e pertencente a uma única camada.

## Matriz de rastreabilidade funcional

| Requisito da spec | Tarefas que implementam ou verificam | Cobertura |
| --- | --- | --- |
| **RF1 — Busca de cidade** | T-02, T-05, T-09, T-11, T-13, T-16, T-17, T-23, T-30, T-33 | Completa: contrato, normalização, geocoding, concorrência, UI, integração e E2E. |
| **RF2 — Clima atual** | T-03, T-07, T-10, T-12, T-14, T-18, T-23, T-29, T-31, T-33 | Completa: contrato, códigos, validação, forecast, estado, UI, testes e E2E. |
| **RF3 — Previsão de cinco dias** | T-03, T-07, T-08, T-10, T-12, T-14, T-19, T-23, T-29, T-31, T-33 | Completa: contrato, timezone, validação, forecast, UI, testes e E2E. |
| **RF4 — Unidade de temperatura** | T-04, T-06, T-15, T-18, T-21, T-25, T-31, T-33 | Completa: tipos, conversão, estado, controle, integração, teste unitário e E2E. |
| **RF5 — Estados e recuperação** | T-04, T-11, T-12, T-13, T-14, T-15, T-20, T-23, T-28, T-29, T-31, T-32, T-33, T-34 | Completa: estados, timeout, erros, retry, componentes, serviços, integração, E2E e hardening. |

**Requisitos funcionais sem tarefa correspondente:** nenhum. Todos os requisitos
`RF1` a `RF5` possuem implementação e verificação associadas.

## Priorização e tamanho

`P0` representa o caminho mínimo para a jornada principal funcionar; `P1`
representa qualidade, cobertura e requisitos importantes após o fluxo principal;
`P2` representa hardening final que pode ser entregue depois sem bloquear a
primeira versão utilizável. Tamanho: `P` pequeno, `M` médio e `G` grande.

| Tarefa | Prioridade | Tamanho | Motivo resumido |
| --- | --- | --- | --- |
| T-01 | P0 | M | Fundação executável do projeto. |
| T-02 | P0 | P | Contrato da cidade. |
| T-03 | P0 | P | Contratos meteorológicos. |
| T-04 | P0 | P | Unidade e estados necessários ao fluxo. |
| T-05 | P0 | P | Validação imediata da busca. |
| T-06 | P0 | P | Conversão usada pela unidade. |
| T-07 | P0 | P | Condição meteorológica exibida na UI. |
| T-08 | P0 | M | Datas e timezone da previsão. |
| T-09 | P0 | M | Integridade dos resultados de geocoding. |
| T-10 | P0 | M | Integridade do forecast. |
| T-11 | P0 | M | Acesso às cidades. |
| T-12 | P0 | M | Acesso ao clima e previsão. |
| T-13 | P0 | M | Estado e concorrência da busca. |
| T-14 | P0 | M | Seleção e carregamento do clima. |
| T-15 | P0 | M | Retry e unidade sem nova rede. |
| T-16 | P0 | M | Formulário visível e acessível. |
| T-17 | P0 | M | Resultados selecionáveis. |
| T-18 | P0 | M | Clima atual visível. |
| T-19 | P0 | M | Previsão visível. |
| T-20 | P0 | M | Estados de loading, erro e vazio. |
| T-21 | P0 | P | Controle de unidade. |
| T-22 | P0 | M | Responsividade necessária para a primeira tela utilizável. |
| T-23 | P0 | M | Composição funcional da tela. |
| T-24 | P1 | P | Teste unitário da busca. |
| T-25 | P1 | P | Teste unitário dedicado de conversão. |
| T-26 | P1 | P | Testes de códigos e datas. |
| T-27 | P1 | P | Testes de validação de payload. |
| T-28 | P1 | M | Testes do service de geocoding com fetch mockado. |
| T-29 | P1 | M | Testes do service de forecast com fetch mockado. |
| T-30 | P1 | M | Integração da busca e concorrência. |
| T-31 | P1 | M | Integração do clima e unidade. |
| T-32 | P1 | M | Estados visuais dos componentes. |
| T-33 | P1 | G | E2E completo em desktop e mobile. |
| T-34 | P2 | M | Validação final e hardening. |

## Sequência de entrega em fatias verticais

As fatias abaixo atravessam as camadas necessárias para produzir comportamento
visível. Dentro de cada fatia, tarefas independentes podem ser implementadas em
paralelo, mas a entrega da fatia respeita as dependências listadas.

| Fatia | Objetivo visível | Tarefas | Resultado entregue |
| --- | --- | --- | --- |
| **Fatia 1 — Busca vertical** | Preparar a busca de cidade de ponta a ponta. | T-01, T-02, T-05, T-09, T-11, T-13, T-16, T-17 | Contratos, service, hook e componentes de busca prontos para a primeira integração. |
| **Fatia 2 — Primeira tela utilizável** | Exibir clima atual assim que a busca puder ser integrada. | T-03, T-04, T-06, T-07, T-08, T-10, T-12, T-14, T-15, T-18, T-19, T-20, T-21, T-22, T-23 | Tela funcional com busca, clima atual, estados, previsão, unidade e layout responsivo. |
| **Fatia 3 — Confiança da jornada** | Proteger o fluxo contra regressões. | T-24, T-25, T-26, T-27, T-28, T-29, T-30, T-31, T-32 | Testes unitários, services mockados, integração e estados visuais cobertos. |
| **Fatia 4 — Navegador e hardening** | Validar uso real em desktop e mobile. | T-33, T-34 | E2E com viewport de 320 px, lint, build, testes e verificação responsiva. |

Para obter algo visível rapidamente, implemente a Fatia 1 em paralelo com T-03,
T-04, T-06, T-07, T-08, T-10 e T-12. Assim, T-14 a T-23 podem ser concluídas
logo depois, produzindo a primeira tela utilizável sem esperar a bateria de
testes. As Fatias 3 e 4 entram em seguida para reduzir regressões e validar os
viewports suportados.

## Entrega 1 — Fundação e contratos

### T-01 — Preparar a estrutura técnica da aplicação

- **Tipo:** Infra
- **Descrição:** Garantir os entrypoints e diretórios mínimos do projeto React/Vite.
- **Critérios de aceite:** `src/main.tsx`, `src/App.tsx`, `src/index.css` e as
  pastas de código e testes existem; a aplicação inicia e compila em TypeScript strict.
- **Rastreabilidade:** NFR3 (camada de dados separada e testável).
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`, `src/index.css`, `tests/`.

### T-02 — Definir o contrato de cidade

- **Tipo:** Data
- **Descrição:** Criar o tipo interno para resultados de geocoding e cidade selecionada.
- **Critérios de aceite:** `City` contém nome, coordenadas e timezone; país e
  região são opcionais; o contrato não aceita cidade sem nome, latitude ou longitude.
- **Rastreabilidade:** RF1 (seleção guarda nome, coordenadas e timezone); contrato de dados.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/city.ts`.

### T-03 — Definir os contratos meteorológicos

- **Tipo:** Data
- **Descrição:** Criar os tipos de clima atual, dia de previsão e payload meteorológico.
- **Critérios de aceite:** `CurrentWeather`, `ForecastDay` e `WeatherData` distinguem
  campos essenciais e opcionais; previsão representa exatamente cinco dias válidos.
- **Rastreabilidade:** RF2, RF3 e AC2 (clima atual e cinco dias com campos essenciais).
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.

### T-04 — Definir unidade e estados da interface

- **Tipo:** Data
- **Descrição:** Criar os tipos de unidade de temperatura e estados do fluxo principal.
- **Critérios de aceite:** `TemperatureUnit` aceita Celsius/Fahrenheit; o estado
  distingue idle, loading de cidade, loading de clima, ready, error e incomplete.
- **Rastreabilidade:** RF4 e RF5 (unidade e estados de recuperação).
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `src/types/api.ts`, `src/types/weather.ts`.

## Entrega 2 — Domínio e contratos externos

### T-05 — Normalizar e validar consultas

- **Tipo:** Data
- **Descrição:** Implementar a normalização e as regras locais do texto de busca.
- **Critérios de aceite:** trim é aplicado; acentos, hífens, apóstrofos e espaços
  internos são aceitos; vazio e mais de 100 caracteres retornam erro explícito.
- **Rastreabilidade:** RF1; AC1 (trim, input inválido e limite local).
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/normalizeQuery.ts`.

### T-06 — Implementar conversão de temperatura

- **Tipo:** Data
- **Descrição:** Criar funções puras de conversão e arredondamento Celsius/Fahrenheit.
- **Critérios de aceite:** As duas fórmulas da spec são usadas; resultados são
  arredondados ao inteiro mais próximo; conversões não mutam o payload original.
- **Rastreabilidade:** RF4; AC3 (conversão no cliente e arredondamento).
- **Dependências:** T-03, T-04.
- **Arquivos prováveis:** `src/lib/temperature.ts`.

### T-07 — Mapear códigos meteorológicos

- **Tipo:** Data
- **Descrição:** Mapear códigos WMO para descrição e ícone de apresentação.
- **Critérios de aceite:** Códigos suportados têm resultado determinístico e código
  desconhecido usa fallback explícito sem lançar erro.
- **Rastreabilidade:** RF2 e RF3 (condição derivada de `weather_code`).
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/weatherCode.ts`.

### T-08 — Derivar datas no timezone da cidade

- **Tipo:** Data
- **Descrição:** Criar funções para formatar datas locais e identificar o primeiro dia.
- **Critérios de aceite:** Datas usam o timezone retornado pela API; o primeiro dia
  pode ser rotulado `Hoje`; datas permanecem em ordem cronológica.
- **Rastreabilidade:** RF3; AC2 (data local e primeiro dia no timezone da cidade).
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `src/lib/date.ts`.

### T-09 — Validar payload de geocoding

- **Tipo:** Data
- **Descrição:** Validar e normalizar somente a resposta de cidades da Open-Meteo.
- **Critérios de aceite:** Nome, latitude e longitude ausentes invalidam o item;
  resultados válidos viram `City`; país, região e timezone opcionais são preservados.
- **Rastreabilidade:** RF1 e contrato de dados (campos essenciais do geocoding).
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/validateWeatherPayload.ts`, `src/types/api.ts`.

### T-10 — Validar payload de forecast

- **Tipo:** Data
- **Descrição:** Validar e normalizar somente a resposta meteorológica da Open-Meteo.
- **Critérios de aceite:** Temperatura e código atuais são obrigatórios; cada dia
  precisa de data, mínima, máxima e código; menos de cinco dias gera incomplete.
- **Rastreabilidade:** RF2, RF3 e AC2 (resposta parcial vira dados incompletos).
- **Dependências:** T-03, T-04.
- **Arquivos prováveis:** `src/lib/validateWeatherPayload.ts`, `src/types/api.ts`.

## Entrega 3 — Acesso a dados e estado

### T-11 — Implementar serviço de geocoding

- **Tipo:** Data
- **Descrição:** Consultar a API de geocoding com os parâmetros do contrato.
- **Critérios de aceite:** Usa `count=10`, `language=pt` e `format=json`; retorna
  no máximo dez cidades normalizadas; erros HTTP, JSON e timeout são tratáveis.
- **Rastreabilidade:** RF1, RF5 e NFR3 (parâmetros, limite de resultados e timeout de 10 s).
- **Dependências:** T-05, T-09.
- **Arquivos prováveis:** `src/services/geocoding.ts`.

### T-12 — Implementar serviço de forecast

- **Tipo:** Data
- **Descrição:** Consultar o forecast por latitude/longitude e normalizar o resultado.
- **Critérios de aceite:** Usa coordenadas, Celsius, `timezone=auto`, `forecast_days=5`
  e os campos current/daily definidos; timeout de 10 segundos e erros são tratáveis.
- **Rastreabilidade:** RF2, RF3, RF5 e NFR3 (coordenadas, cinco dias e timeout de 10 s).
- **Dependências:** T-08, T-10.
- **Arquivos prováveis:** `src/services/forecast.ts`.

### T-13 — Criar hook de busca de cidades

- **Tipo:** Data
- **Descrição:** Encapsular query, resultados, validação, loading e concorrência da busca.
- **Critérios de aceite:** Input inválido não chama a API; loading impede duplicação;
  nova busca invalida a anterior; zero resultados mantém o campo editável.
- **Rastreabilidade:** RF1, RF5, NFR3 e AC1 (validação, loading, zero resultados e concorrência).
- **Dependências:** T-05, T-11.
- **Arquivos prováveis:** `src/hooks/useCitySearch.ts`.

### T-14 — Criar fluxo de seleção e carregamento meteorológico

- **Tipo:** Data
- **Descrição:** Orquestrar cidade selecionada, chamada de forecast e estados de carga.
- **Critérios de aceite:** Seleção envia latitude e longitude; estados idle/loading/ready
  e incomplete são distinguíveis; dados válidos ficam disponíveis para a UI.
- **Rastreabilidade:** RF2, RF3 e RF5; AC2 (seleção e estados do carregamento meteorológico).
- **Dependências:** T-04, T-12, T-13.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.

### T-15 — Adicionar retry e alternância de unidade ao estado

- **Tipo:** Data
- **Descrição:** Completar o hook com retry da cidade selecionada e conversão local.
- **Critérios de aceite:** Retry não exige nova busca textual; unidade inicia em Celsius;
  alternância não chama a API, não mostra loading e atualiza todos os valores.
- **Rastreabilidade:** RF4, RF5, NFR3 e AC3/AC4 (retry e troca local sem rede).
- **Dependências:** T-06, T-14.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.

## Entrega 4 — Componentes da jornada principal

### T-16 — Construir formulário de busca

- **Tipo:** UI
- **Descrição:** Renderizar input, submissão, validação e feedback da busca.
- **Critérios de aceite:** Campo e botão têm nomes acessíveis; erro de input vazio
  fica associado à operação; loading e mensagens usam `aria-live` apropriado.
- **Rastreabilidade:** RF1, NFR1 e AC1 (busca, erro associado e anúncios acessíveis).
- **Dependências:** T-05, T-13.
- **Arquivos prováveis:** `src/components/CitySearchForm.tsx`.

### T-17 — Construir lista de resultados

- **Tipo:** UI
- **Descrição:** Renderizar e permitir selecionar até dez cidades encontradas.
- **Critérios de aceite:** Cada opção exibe cidade, região e país quando disponíveis;
  seleção funciona por teclado e mouse; foco permanece visível.
- **Rastreabilidade:** RF1, NFR1 e AC1 (até dez resultados, seleção e teclado).
- **Dependências:** T-02, T-13.
- **Arquivos prováveis:** `src/components/CityResultsList.tsx`.

### T-18 — Construir cartão de clima atual

- **Tipo:** UI
- **Descrição:** Exibir cidade, temperatura, condição e métricas atuais.
- **Critérios de aceite:** Condição vem do `weather_code`; unidade usa `°C`/`°F`;
  umidade, vento e pressão ausentes exibem `—`; componente não chama API.
- **Rastreabilidade:** RF2, RF4, NFR3 e AC2/AC3 (dados atuais, opcionais e unidade).
- **Dependências:** T-06, T-07, T-14.
- **Arquivos prováveis:** `src/components/CurrentWeatherCard.tsx`.

### T-19 — Construir lista de previsão

- **Tipo:** UI
- **Descrição:** Renderizar os cinco dias de previsão em ordem local.
- **Critérios de aceite:** Exatamente cinco itens exibem data, mínima, máxima e condição;
  primeiro dia mostra `Hoje`; dados não são inventados.
- **Rastreabilidade:** RF3 e AC2 (cinco posições, timezone e resposta incompleta).
- **Dependências:** T-07, T-08, T-14.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.

### T-20 — Criar componentes de estado e recuperação

- **Tipo:** UI
- **Descrição:** Criar componentes isolados para loading, vazio, erro, incomplete e retry.
- **Critérios de aceite:** Cada componente tem mensagem acessível; erro usa a mensagem
  padrão; incomplete e erro oferecem ação `Tentar novamente` quando aplicável.
- **Rastreabilidade:** RF5, NFR1 e AC4 (erro recuperável, mensagem padrão e anúncio).
- **Dependências:** T-04, T-15.
- **Arquivos prováveis:** `src/components/LoadingState.tsx`,
  `src/components/EmptyState.tsx`, `src/components/ErrorState.tsx`,
  `src/components/RetryAction.tsx`.

### T-21 — Criar controle de unidade

- **Tipo:** UI
- **Descrição:** Renderizar o controle acessível para alternar Celsius e Fahrenheit.
- **Critérios de aceite:** Controle é nomeado, operável por teclado, inicia em Celsius
  e comunica a unidade selecionada sem depender somente de cor.
- **Rastreabilidade:** RF4, NFR1 e AC3 (alternância acessível sem nova requisição).
- **Dependências:** T-04, T-15.
- **Arquivos prováveis:** `src/components/TemperatureToggle.tsx`.

### T-22 — Aplicar layout responsivo e acessível

- **Tipo:** UI
- **Descrição:** Estilizar os componentes mobile-first com o tema do projeto e foco visível.
- **Critérios de aceite:** Não há overflow horizontal de 320 px a 1920 px; controles
  têm área mínima de 44 por 44 px; contraste e ordem visual são adequados.
- **Rastreabilidade:** NFR1 e NFR2 (foco, área mínima, contraste e responsividade).
- **Dependências:** T-16, T-17, T-18, T-19, T-20, T-21.
- **Arquivos prováveis:** `src/index.css`, `src/components/*.tsx`.

## Entrega 5 — Integração da aplicação

### T-23 — Integrar a tela principal

- **Tipo:** UI
- **Descrição:** Compor formulário, resultados, estados, cartão, previsão e toggle no App.
- **Critérios de aceite:** Estado inicial mostra busca e instrução; selecionar cidade
  exibe clima; loading, erro, incomplete e retry aparecem no lugar correto.
- **Rastreabilidade:** RF1, RF2, RF3, RF5 e AC1/AC2/AC4 (jornada principal completa).
- **Dependências:** T-16, T-17, T-18, T-19, T-20, T-21, T-22.
- **Arquivos prováveis:** `src/App.tsx`.

## Entrega 6 — Testes automatizados

### T-24 — Testar normalização da consulta

- **Tipo:** Test
- **Descrição:** Cobrir as regras puras de normalização e validação do nome da cidade.
- **Critérios de aceite:** Testes cobrem trim, vazio, limite de 100 caracteres, acentos,
  hífens, apóstrofos e espaços internos; nenhum teste chama a rede.
- **Rastreabilidade:** RF1 e AC1; matriz mínima de testes unitários.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/normalizeQuery.test.ts`.

### T-25 — Testar conversão de unidade

- **Tipo:** Test
- **Descrição:** Cobrir isoladamente as funções de conversão Celsius/Fahrenheit.
- **Critérios de aceite:** Testes verificam `20 °C = 68 °F`, as fórmulas inversas,
  arredondamento ao inteiro mais próximo e alternância repetida sem chamada de rede.
- **Rastreabilidade:** RF4 e AC3; matriz mínima de testes unitários.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.

### T-26 — Testar códigos e datas

- **Tipo:** Test
- **Descrição:** Cobrir mapeamento WMO e datas no timezone da cidade.
- **Critérios de aceite:** Códigos conhecidos e desconhecidos, ordem cronológica e rótulo
  `Hoje` são verificados sem depender do relógio local do executor.
- **Rastreabilidade:** RF2, RF3, AC2 e matriz mínima de testes unitários.
- **Dependências:** T-07, T-08.
- **Arquivos prováveis:** `tests/unit/weatherCode.test.ts`, `tests/unit/date.test.ts`.

### T-27 — Testar validação de payloads

- **Tipo:** Test
- **Descrição:** Cobrir contratos válidos, campos ausentes e previsão incompleta.
- **Critérios de aceite:** Geocoding inválido, forecast sem campos essenciais e menos de
  cinco dias são rejeitados; opcionais ausentes não eliminam os demais dados.
- **Rastreabilidade:** RF2, RF3, AC2 e matriz mínima de testes unitários.
- **Dependências:** T-09, T-10.
- **Arquivos prováveis:** `tests/unit/validateWeatherPayload.test.ts`.

### T-28 — Testar service de geocoding com fetch mockado

- **Tipo:** Test
- **Descrição:** Verificar exclusivamente o service de cidades usando mock de `fetch`.
- **Critérios de aceite:** O mock confirma `count=10`, `language=pt` e `format=json`;
  sucesso, zero resultados, HTTP, JSON inválido, timeout e abortamento são cobertos.
- **Rastreabilidade:** RF1, RF5, AC1/AC4 e matriz de testes de integração.
- **Dependências:** T-11.
- **Arquivos prováveis:** `tests/unit/geocoding.test.ts`.

### T-29 — Testar service de forecast com fetch mockado

- **Tipo:** Test
- **Descrição:** Verificar exclusivamente o service meteorológico usando mock de `fetch`.
- **Critérios de aceite:** O mock confirma latitude, longitude, `forecast_days=5`,
  `timezone=auto` e campos current/daily; sucesso, parcial, HTTP, JSON inválido,
  timeout e abortamento são cobertos; texto da cidade não aparece na URL.
- **Rastreabilidade:** RF2, RF3, RF5, AC2/AC4 e matriz de testes de integração.
- **Dependências:** T-12.
- **Arquivos prováveis:** `tests/unit/forecast.test.ts`.

### T-30 — Testar integração da busca

- **Tipo:** Test
- **Descrição:** Testar formulário, hook e resultados no fluxo de geocoding.
- **Critérios de aceite:** Input vazio, sucesso, zero resultados, loading, erro e
  concorrência confirmam que resposta antiga não sobrescreve a mais recente.
- **Rastreabilidade:** RF1, NFR3, AC1 e matriz de testes de integração.
- **Dependências:** T-16, T-17.
- **Arquivos prováveis:** `tests/integration/city-search.test.tsx`.

### T-31 — Testar integração do clima e unidade

- **Tipo:** Test
- **Descrição:** Testar seleção, forecast, estados, retry e alternância de unidade.
- **Critérios de aceite:** Seleção carrega clima e cinco dias; incomplete e retry são
  visíveis; alternar unidade não dispara nova requisição.
- **Rastreabilidade:** RF2, RF3, RF4, RF5, AC2/AC3/AC4 e matriz de testes de integração.
- **Dependências:** T-18, T-19, T-20, T-21, T-23.
- **Arquivos prováveis:** `tests/integration/weather-app.test.tsx`.

### T-32 — Testar componentes nos estados de interface

- **Tipo:** Test
- **Descrição:** Testar isoladamente os componentes de loading, erro, vazio e retry.
- **Critérios de aceite:** Loading de cidade e clima, `Nenhuma cidade encontrada.`,
  erro padrão e `Dados meteorológicos incompletos.` são renderizados; mensagens têm
  `aria-live`/nome acessível e o botão `Tentar novamente` dispara o callback.
- **Rastreabilidade:** RF1, RF5, NFR1, AC1, AC2 e AC4.
- **Dependências:** T-20.
- **Arquivos prováveis:** `tests/integration/state-components.test.tsx`.

### T-33 — Criar teste E2E do fluxo principal em desktop e mobile

- **Tipo:** Test
- **Descrição:** Validar no navegador o fluxo principal em viewport desktop e mobile.
- **Critérios de aceite:** Com APIs mockadas, o teste pesquisa e seleciona uma cidade,
  vê clima atual e cinco dias, alterna para Fahrenheit sem nova rede e repete a jornada
  com viewport de 320 px sem rolagem horizontal.
- **Rastreabilidade:** RF1, RF2, RF3, RF4, AC1/AC2/AC3 e matriz mínima de testes E2E.
- **Dependências:** T-22, T-23, T-30, T-31, T-32.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`.

## Entrega 7 — Hardening e qualidade final

### T-34 — Executar validação final do projeto

- **Tipo:** Infra
- **Descrição:** Rodar lint, build, testes e verificações responsivas da entrega completa.
- **Critérios de aceite:** `pnpm lint`, `pnpm build` e `pnpm test` passam; E2E passa com
  APIs mockadas; estados inicial, loading, erro e pronto não têm overflow horizontal.
- **Rastreabilidade:** NFR1, NFR2, NFR3 e checklist de qualidade da spec.
- **Dependências:** T-24, T-25, T-26, T-27, T-28, T-29, T-30, T-31, T-32, T-33.
- **Arquivos prováveis:** `biome.json`, `playwright.config.ts`, `README.md`.