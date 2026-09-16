# Especificação do Weather App

## 1. Escopo

Aplicação web responsiva para pesquisar uma cidade e consultar o clima atual e
a previsão dos próximos cinco dias. A interface será em português do Brasil,
mobile-first e sem autenticação.

O usuário poderá pesquisar uma cidade, selecionar uma opção homônima, consultar
o clima e alternar entre Celsius e Fahrenheit sem nova requisição.

Ficam fora da versão 1: favoritos, histórico persistente, geolocalização
automática, notificações, contas de usuário e modo offline avançado.

## Histórias de usuário

- Como usuário, quero pesquisar uma cidade e selecionar o local correto para consultar seu clima.
- Como usuário, quero visualizar o clima atual e a previsão dos próximos cinco dias.
- Como usuário, quero alternar entre Celsius e Fahrenheit sem repetir a busca.
- Como usuário, quero receber mensagens claras quando a busca ou os dados meteorológicos falharem.

## 2. Fonte de dados e contrato

A aplicação usará a API pública Open-Meteo, sem API key:

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`;
- Forecast: `https://api.open-meteo.com/v1/forecast`.

O geocoding deve solicitar `name`, `latitude`, `longitude`, país, região
administrativa e fuso horário, usando `count=10`, `language=pt` e `format=json`.
O forecast deve solicitar `current=temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,weather_code`,
`daily=weather_code,temperature_2m_max,temperature_2m_min`, `forecast_days=5`,
`timezone=auto` e a unidade padrão Celsius.

Campos essenciais: `name`, `latitude` e `longitude` no geocoding; temperatura e
`weather_code` no clima atual; data, mínima, máxima e `weather_code` em cada
dia. Umidade, vento e pressão são opcionais. Resposta sem campo essencial é
inválida, não uma resposta parcial normal.

## 3. Requisitos funcionais

### RF1 — Busca de cidade

- Aceitar acentos, hífens, apóstrofos e espaços no nome da cidade.
- Remover espaços nas extremidades ao submeter a consulta.
- Não chamar a API para consulta vazia ou composta somente por espaços.
- Rejeitar localmente consultas com mais de 100 caracteres.
- Exibir loading durante a busca e impedir submissões duplicadas.
- Exibir no máximo 10 resultados com cidade, região e país.
- Exibir `Nenhuma cidade encontrada.` para zero resultados e manter o campo editável.
- Guardar nome, latitude, longitude e timezone da opção selecionada.
- Cancelar a busca anterior ou ignorar sua resposta quando uma nova busca for iniciada.

### RF2 — Clima atual

- Carregar os dados usando latitude e longitude selecionadas, nunca apenas o texto.
- Exibir cidade, país, temperatura atual, unidade e condição derivada do `weather_code`.
- Exibir umidade, vento e pressão quando disponíveis.
- Usar `—` para campos opcionais ausentes.
- Exibir `Dados meteorológicos incompletos.` e uma nova tentativa se faltar temperatura ou condição.

### RF3 — Previsão de cinco dias

- Exibir exatamente cinco posições: a data local da cidade e os quatro dias seguintes.
- Mostrar dia/data, mínima, máxima e condição em cada posição.
- Marcar o primeiro dia como `Hoje`, usando o timezone retornado pela API.
- Se faltarem dias ou campos essenciais, informar dados incompletos, não inventar valores e oferecer nova tentativa.
- Usar `—` para campos opcionais ausentes.

### RF4 — Unidade de temperatura

- Iniciar em Celsius.
- Permitir alternância acessível entre Celsius e Fahrenheit.
- Converter no cliente, sem nova chamada à API.
- Usar a mesma unidade em todos os valores e arredondar para o inteiro mais próximo.
- Usar `F = C * 9 / 5 + 32` e `C = (F - 32) * 5 / 9`.
- Exibir os símbolos `°C` e `°F`.

### RF5 — Estados e recuperação

- Estado inicial: exibir busca e instrução, sem dados meteorológicos.
- Indicar se o loading é da busca de cidade ou do carregamento meteorológico.
- Para erro de rede, HTTP, JSON inválido ou API indisponível, exibir `Não foi possível carregar os dados. Tente novamente.` e o botão `Tentar novamente`.
- Tratar timeout de 10 segundos como erro recuperável, sem bloquear a interface.
- Repetir a operação com a cidade selecionada, sem exigir nova busca de texto.

## 4. Requisitos não funcionais

### NFR1 — Acessibilidade

- Todos os campos e controles devem ter nome acessível e funcionar por teclado.
- O foco deve permanecer visível e seguir ordem lógica.
- Loading, erro, estado vazio e resultados devem ser anunciados por `aria-live` apropriado.
- Mensagens de erro devem estar associadas ao campo ou à operação correspondente.
- Estado não pode ser comunicado somente por cor.

### NFR2 — Responsividade e compatibilidade

- Não deve haver rolagem horizontal entre 320 px e 1920 px.
- Deve funcionar em orientação retrato e paisagem.
- Campos e botões devem ter área de interação mínima de 44 por 44 px.
- Validar Chrome, Firefox, Safari e Edge nas duas versões estáveis mais recentes.

### NFR3 — Performance e confiabilidade

- O loading deve aparecer no mesmo ciclo da submissão.
- A troca de unidade deve atualizar sem loading e sem rede.
- Cada requisição deve ter timeout de 10 segundos.
- A camada de dados deve ser separada da apresentação e testável sem chamadas reais à API.

## 5. Critérios de aceite

### AC1 — Busca

**Dado** que o usuário informa `São Paulo` e submete a busca, **quando** a API
retorna resultados, **então** a aplicação exibe no máximo 10 opções com cidade,
região e país, permitindo selecionar uma delas.

**Dado** que o campo está vazio ou contém somente espaços, **quando** o usuário
submete, **então** nenhuma requisição é feita e `Digite o nome de uma cidade.`
é exibida.

**Dado** que o geocoding retorna zero resultados, **quando** o processamento
termina, **então** `Nenhuma cidade encontrada.` é exibida e o campo permanece editável.

**Dado** que uma nova busca é submetida antes da anterior terminar, **quando**
as respostas chegam em qualquer ordem, **então** somente a busca mais recente
pode atualizar a tela.

### AC2 — Clima e previsão

**Dado** que uma cidade válida foi selecionada e a resposta contém os campos
essenciais, **quando** o carregamento termina, **então** a tela exibe o clima
atual e exatamente cinco dias no timezone da cidade.

**Dado** que um campo opcional está ausente, **quando** a tela é renderizada,
**então** o campo correspondente exibe `—` e os demais dados permanecem visíveis.

**Dado** que falta um campo essencial ou um dos cinco dias, **quando** a resposta
é processada, **então** a aplicação exibe estado de dados incompletos, não
inventa valores e oferece nova tentativa.

### AC3 — Unidade

**Dado** que a tela exibe `20 °C`, **quando** o usuário seleciona Fahrenheit,
**então** todos os valores são atualizados para `68 °F` sem nova requisição.

**Dado** que o usuário alterna repetidamente entre as unidades, **quando** a
operação termina, **então** os valores permanecem equivalentes considerando o
arredondamento definido em RF4.

### AC4 — Falhas

**Dado** que uma requisição falha, retorna JSON inválido ou excede 10 segundos,
**quando** o erro é detectado, **então** a mensagem de erro e o botão `Tentar
novamente` são exibidos sem travar os controles.

## 6. Matriz mínima de testes

Devem existir testes unitários para normalização de consulta, conversão de
temperatura, mapeamento de `weather_code`, datas no timezone da cidade e
classificação de respostas incompletas.

Devem existir testes de integração para sucesso, zero resultados, input vazio,
timeout, erro HTTP, JSON inválido, resposta parcial e concorrência de buscas.

Deve existir teste E2E para pesquisar cidade, selecionar resultado, visualizar
cinco dias e alternar a unidade.

## 7. Decisões da versão 1

- Unidade padrão: Celsius.
- Idioma: português do Brasil.
- Previsão: data local da cidade selecionada mais quatro dias.
- Resultados de geocoding: no máximo 10.
- Timeout: 10 segundos por requisição.
- Tentativas automáticas: nenhuma; recuperação pelo botão de nova tentativa.
- Persistência: nenhuma entre sessões.

## Casos extremos

- A consulta pode conter acentos, hífens, apóstrofos, espaços nas extremidades ou somente espaços.
- O geocoding pode retornar zero resultados, resultados incompletos ou respostas fora de ordem.
- O forecast pode falhar, exceder o timeout, retornar JSON inválido ou omitir campos essenciais.
- Campos opcionais ausentes devem permanecer visíveis como `—`, sem invalidar os demais dados.

## Premissas

- A API Open-Meteo permanece disponível sem autenticação e mantém os contratos usados pela aplicação.
- O navegador oferece suporte a Fetch, AbortController, Intl.DateTimeFormat e aos recursos de acessibilidade utilizados.
- A aplicação não precisa persistir dados entre sessões nem funcionar offline na versão 1.

## Riscos

- Indisponibilidade ou alteração do contrato da Open-Meteo pode impedir buscas e previsões.
- Diferenças de suporte entre navegadores podem afetar datas, timezones ou recursos de acessibilidade.
- Respostas lentas ou incompletas podem degradar a experiência, mitigadas por timeout, validação e retry.