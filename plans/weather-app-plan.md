# Weather App Plan

## Architecture

A aplicação será uma SPA em React com arquitetura em camadas simples e direta:

- Camada de apresentação: componentes React para busca, seleção de cidade, clima atual, previsão e alternância de unidade.
- Camada de serviços: funções dedicadas para consultar o geocoding e o forecast da Open-Meteo, com validação e normalização de respostas.
- Camada de domínio: tipos e utilitários para interpretar `weather_code`, localizar dados incompletos e converter temperaturas.
- Estado da UI: controle local do componente principal e/ou hook reutilizável, sem biblioteca global de estado.

A estrutura atende à especificação: a busca de cidade é separada do carregamento meteorológico, o carregamento tem estados explícitos e a troca de unidade acontece no cliente, sem nova chamada à API.

### Componentes principais

- `AppShell` / `WeatherApp`: orquestra UI, estado e integração com serviços.
- `CitySearchForm`: campo de texto, validação local, botão de busca e feedback de loading/erro.
- `CityResultsList`: exibe até 10 opções do geocoding e permite seleção.
- `CurrentWeatherCard`: mostra cidade, país, temperatura, condição e dados opcionais.
- `ForecastList`: exibe cinco dias em ordem local da cidade.
- `TemperatureUnitToggle`: alterna Celsius/Fahrenheit de forma acessível.
- `RetryAction`: dispara reprocessamento sem exigir nova busca textual.

## Tech Stack

- React 19 + TypeScript: base da interface e tipagem do estado e contratos de API.
- Vite: ferramenta de build e dev server rápida.
- Tailwind CSS: visual dark glassmorphism e estilos responsivos mobile-first.
- Biome: lint/format da base do projeto.
- Vitest + Testing Library: testes unitários e de integração focados em comportamento.
- Playwright: teste E2E de fluxo principal em navegador real.
- Open-Meteo: fonte pública de geocoding e previsão sem chave de API.

### Justificativa

A stack foi escolhida para manter simplicidade, aderência à spec e baixo custo de manutenção. Não há necessidade de estado global, roteamento ou backend próprio, porque a aplicação é cliente-only e opera em uma única tela com dados vindos da API pública.

## Project Structure

A estrutura proposta segue a convenção do projeto e separa responsabilidades por pasta e arquivo:

```text
src/
  components/
    CitySearchForm.tsx
    CityResultsList.tsx
    CurrentWeatherCard.tsx
    ForecastList.tsx
    TemperatureToggle.tsx
    EmptyState.tsx
    LoadingState.tsx
    ErrorState.tsx
  hooks/
    useWeatherApp.ts
    useCitySearch.ts
  services/
    geocoding.ts
    forecast.ts
  lib/
    normalizeQuery.ts
    temperature.ts
    weatherCode.ts
    date.ts
    validateWeatherPayload.ts
  types/
    city.ts
    weather.ts
    api.ts
  App.tsx
  main.tsx
  index.css

tests/
  unit/
  integration/
  e2e/
```

### Responsabilidades

- `components/`: renderização e interação.
- `hooks/`: estado e orquestração do fluxo principal sem lógica de apresentação no serviço.
- `services/`: fetch, timeout, validação, transformação e mapeamento de respostas da Open-Meteo.
- `lib/`: funções puras para normalização, conversão, validação de payloads e derivação de condicionais climáticas.
- `types/`: contratos TypeScript para dados internos e estado da UI.

## Data Model

Os contratos abaixo representam o modelo mínimo necessário para a aplicação, sem depender de implementação específica.

```ts
export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface City {
  id?: string; // identificador local opcional, útil para keys e seleção
  name: string; // nome da cidade retornado pela API
  country?: string; // país, quando disponível na resposta
  admin1?: string; // região administrativa, quando disponível
  latitude: number; // latitude da cidade selecionada
  longitude: number; // longitude da cidade selecionada
  timezone: string; // fuso horário da cidade, ex.: America/Sao_Paulo
}

export interface CurrentWeather {
  time: string; // marca temporal da leitura atual da API
  temperatureC: number; // temperatura atual em Celsius
  humidity?: number; // umidade relativa em %, opcional
  windSpeed?: number; // velocidade do vento em km/h, opcional
  pressure?: number; // pressão atmosférica em hPa, opcional
  weatherCode: number; // código WMO da condição atual
}

export interface ForecastDay {
  date: string; // data local da cidade no formato ISO local
  temperatureMinC: number; // mínima do dia em Celsius
  temperatureMaxC: number; // máxima do dia em Celsius
  weatherCode: number; // código WMO do dia
}

export interface WeatherData {
  city: City; // cidade selecionada
  current: CurrentWeather; // clima atual
  forecast: ForecastDay[]; // exatamente 5 dias, em ordem cronológica
  unit: TemperatureUnit; // unidade ativa da interface
}
```

### Regras de contrato

- `City` é inválido se faltar `name`, `latitude` ou `longitude`.
- `CurrentWeather` exige `temperatureC` e `weatherCode` como campos essenciais.
- `ForecastDay[]` deve ter exatamente 5 posições e cada item deve conter `date`, `temperatureMinC`, `temperatureMaxC` e `weatherCode`.
- Campos opcionais (`humidity`, `windSpeed`, `pressure`, `country`, `admin1`) devem ser exibidos como `—` quando ausentes.
- Rótulos e ícones de clima são derivados de `weatherCode` na renderização, e não devem ser armazenados como fonte de verdade em `WeatherData`.

## Data Flow

O fluxo de dados deve seguir esta ordem:

1. Usuário digita nome da cidade e submete a busca.
2. O input é normalizado: trim, validação de comprimento e de vazio.
3. A busca chama o serviço de geocoding com timeout de 10 segundos e `AbortController`.
4. Se houver múltiplos resultados, a UI exibe até 10 opções com cidade, região e país.
5. Ao selecionar uma cidade, o app guarda `name`, `latitude`, `longitude` e `timezone`.
6. O serviço de forecast é chamado usando latitude/longitude, nunca texto da cidade.
7. A resposta é validada; faltas de dados essenciais geram estado `incomplete`.
8. A UI renderiza clima atual e cinco dias, com conversão de unidade no cliente.
9. O usuário pode alternar entre Celsius e Fahrenheit sem nova requisição.
10. Em caso de erro, a interface mostra mensagem padrão e botão de tentar novamente.

### Regras de concorrência

- Qualquer nova busca cancela a anterior ou descarta sua resposta.
- A resposta mais recente é a única que pode atualizar a tela.
- A seleção de cidade permanece vinculada ao último resultado válido processado.

## External APIs

### Geocoding

Endpoint:

`https://geocoding-api.open-meteo.com/v1/search`

Parâmetros principais:

- `name`: texto digitado pelo usuário
- `count=10`
- `language=pt`
- `format=json`
- `timezone=auto` opcional, se necessário para contexto de resposta

Campos essenciais:

- `name`
- `latitude`
- `longitude`
- `country`
- `admin1`/região administrativa
- `timezone`

Se a resposta vier vazia, a aplicação deve renderizar `Nenhuma cidade encontrada.` e manter o campo editável.

### Forecast

Endpoint:

`https://api.open-meteo.com/v1/forecast`

Parâmetros principais:

- `latitude`
- `longitude`
- `current=temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,weather_code`
- `daily=weather_code,temperature_2m_max,temperature_2m_min`
- `forecast_days=5`
- `timezone=auto`
- unidade padrão: Celsius

Campos essenciais:

- temperatura atual
- `weather_code` atual
- 5 dias com `date`, `temperature_2m_min`, `temperature_2m_max` e `weather_code`

### Tratamento de respostas inválidas

A aplicação deve considerar inválida qualquer resposta que omita campo essencial. Isso inclui:

- geocoding sem `name`, `latitude` ou `longitude`
- forecast sem temperatura atual/condição
- previsão com menos de 5 dias ou campos essenciais ausentes

A política é falhar de forma explícita em vez de inventar dados.

## State Management

A solução será baseada em estado local React, com um hook orquestrador, sem contexto global, store externo ou biblioteca de gerenciamento.

### Estado principal

O estado deve ser centralizado em um único hook, por exemplo `useWeatherApp`, com as seguintes categorias:

- `query` e `results` para a busca de cidade
- `selectedCity` para a cidade escolhida
- `weather` e `forecast` para o payload meteorológico
- `unit` para Celsius/Fahrenheit
- `status` para distinguir `idle`, `loading`, `ready`, `error`, `incomplete`
- `errorMessage` para mensagem de feedback visual e acessível

### Vantagens

- baixa complexidade para uma aplicação de uma tela
- menos código e menor chance de regressão
- simplicidade de diagnóstico e teste
- alinhamento com a especificação de não over-engineering

### Limites esperados

- sem persistência entre sessões
- sem sincronização entre múltiplas telas
- o estado fica acoplado ao componente raiz da aplicação, o que é aceitável para v1

## Error Handling

A estratégia de erro deve ser explícita e consistente em todos os estados da app.

### Estados de carregamento

- `loading-city`: busca de cidade em andamento
- `loading-weather`: carregamento do clima da cidade selecionada
- `idle`: estado inicial, sem dados meteorológicos

### Mensagens e comportamentos

- input vazio ou somente espaços: exibir `Digite o nome de uma cidade.` e não chamar a API
- zero resultados: exibir `Nenhuma cidade encontrada.`
- erro de rede/HTTP/JSON/timeout: exibir `Não foi possível carregar os dados. Tente novamente.`
- dados incompletos: exibir `Dados meteorológicos incompletos.` com botão `Tentar novamente`
- campos opcionais ausentes: mostrar `—` sem quebrar a tela

### Timeouts e recuperação

- cada requisição tem timeout de 10 segundos
- `AbortController` encerra requisições antigas
- o botão `Tentar novamente` reutiliza a cidade escolhida e não exige nova busca textual
- a interface não bloqueia enquanto o erro é tratado

### Acessibilidade no erro

- mensagens ficam associadas ao campo ou operação relevante
- `aria-live` anuncia loading, erro e resultados
- estado não depende só da cor para comunicar falha

## Testing Strategy

A estratégia seguirá as camadas previstas pela spec, com foco em comportamento e regressão.

### Testes unitários

Cobrir funções puras e transformações críticas:

- normalização de consulta (`trim`, espaços e acentos)
- conversão `C` ⇄ `F` com arredondamento
- mapeamento de `weather_code` para descrição/ícone
- cálculo de datas no timezone da cidade
- validação de respostas incompletas
- escolha de rótulo `Hoje` para o primeiro dia

### Testes de integração

Verificar combinações de serviços e UI com dados simulados:

- sucesso de busca e seleção
- zero resultados
- input vazio
- timeout
- erro HTTP
- JSON inválido
- resposta parcial/incompleta
- concorrência de buscas e descarte de resposta antiga

### Testes E2E

Um fluxo principal deve cobrir a jornada:

1. procurar por cidade
2. selecionar o resultado
3. visualizar clima atual e cinco dias
4. alternar entre Celsius e Fahrenheit
5. validar que a tela atualiza sem nova rede

### Observação de qualidade

Os testes devem validar resultado visível e comportamento real da UI, e não mockar apenas elementos sem sentido. O objetivo é proteger requisitos de negócio e garantir que a app continue compatível com a especificação.

## Risks & Trade-offs

### Principais riscos

- Dependência da API pública: variação de dados, indisponibilidade, latência e estrutura de resposta podem mudar.
- Timezone e data local: a conversão correta de datas depende do `timezone` retornado pela API; isso precisa ser validado em testes.
- Respostas parciais: a app deve ser rígida e rejeitar dados essenciais ausentes, sem inventar informações.
- Concorrência de busca: casos de respostas fora de ordem exigem controle rigoroso para evitar inconsistência visual.

### Trade-offs da v1

- Estado local em vez de store global: mais simples e suficiente para a escala do produto.
- Sem cache persistente: reduz complexidade e elimina risco de estado stale;
  compensado pela simplicidade operacional da aplicação.
- Sem geolocalização automática: reduz requisitos de permissões e inconsistência de localização do usuário.
- Sem automação de retry: mantém UX previsível e explicitamente controlada pelo botão `Tentar novamente`.

### Decisão final

A arquitetura prioriza uma implementação simples, testável e fácil de evoluir, com a preocupação principal em obedecer aos requisitos de qualidade, acessibilidade e confiabilidade definidos na spec. A app deve ser capaz de cumprir a jornada principal com bem poucos componentes e uma camada de serviços mínima, mas robusta o suficiente para lidar com falhas reais de rede e respostas incompletas.
