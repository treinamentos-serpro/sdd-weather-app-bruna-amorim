# Contexto

A empresa solicitou uma aplicação web de previsão do tempo para permitir que usuários consultem condições climáticas de cidades e planejem atividades diárias com base em informações confiáveis e atualizadas.

O principal objetivo do produto é entregar uma experiência simples, rápida e acessível em dispositivos móveis, permitindo que o usuário:

- pesquise cidades;
- visualize o clima atual;
- veja a previsão para os próximos 5 dias;
- alterne entre Celsius e Fahrenheit;
- use o app em smartphones com boa legibilidade e navegação.

O produto deve ser de fácil uso e não depender de login, autenticação ou chave de API para funcionar.

---

# Requisitos Funcionais

1. Busca de cidades
   - O usuário deve ser capaz de inserir o nome de uma cidade.
   - O sistema deve localizar cidades relevantes com base na consulta do usuário.
   - Quando houver múltiplas opções, a interface deve permitir a seleção da cidade correta.

2. Visualização do clima atual
   - Após selecionar uma cidade, o sistema deve exibir os dados climáticos atuais.
   - A tela deve apresentar temperatura, condição climática e informações complementares relevantes, como umidade, vento e pressão, quando disponíveis.

3. Previsão de 5 dias
   - O sistema deve exibir uma previsão para os próximos 5 dias.
   - Cada dia deve mostrar, no mínimo, a temperatura mínima e máxima e a condição do clima.

4. Alternância entre Celsius e Fahrenheit
   - O usuário deve poder alternar a unidade de temperatura entre Celsius e Fahrenheit.
   - A troca deve refletir instantaneamente nos valores exibidos na interface.

5. Estados de interface
   - O sistema deve comunicar claramente estados de carregamento.
   - Quando não houver resultados, a interface deve exibir uma mensagem informativa.
   - Quando houver erro de busca ou falha de rede, o usuário deve receber feedback claro.

---

# Requisitos Não-Funcionais

1. Usabilidade
   - A interface deve ser simples, intuitiva e de fácil entendimento para usuários sem treinamento.

2. Responsividade
   - A aplicação deve ser adequada para mobile-first, sem perder funcionalidade em telas menores.
   - Deve manter boa experiência em desktop também.
   - A interface deve manter legibilidade, navegação e interação sem quebra de layout em dispositivos móveis.

3. Performance
   - As consultas e renderizações devem ocorrer em tempo percebido como rápido pelo usuário.
   - A troca de unidade entre Celsius e Fahrenheit deve ocorrer sem recarregar a página ou exigir nova busca.

4. Acessibilidade
   - A interface deve ser navegável com teclado e ter contraste e foco visíveis.
   - Elementos interativos devem ter labels e significado claro para usuários assistivos.

5. Confiabilidade
   - O app deve tratar falhas de rede e erros da API com mensagens claras, sem travar a experiência.

6. Disponibilidade
   - A aplicação deve manter funcionalidade aceitável mesmo quando a API demorar ou falhar temporariamente.
   - O sistema deve fornecer mensagens de erro claras e permitir recuperação sem bloquear o usuário.

7. Manutenibilidade
   - O código deve ser organizado e fácil de evoluir, com separação clara entre interface, regras de negócio e acesso a dados.

8. Compatibilidade
   - Deve funcionar em navegadores modernos e ambientes web atuais.

---

# Riscos

1. Falha de integração com a API de clima
   - Probabilidade: média
   - Impacto: alto
   - Mitigação: tratar erros de rede e exibir mensagens amigáveis ao usuário; implementar fallback de UI e retry quando possível.

2. Cidades com nomes repetidos ou ambíguos
   - Probabilidade: média
   - Impacto: médio
   - Mitigação: retornar resultados com país/estado ou outras informações de contextualização para diferenciar cidades.

3. Inconsistência de unidades de temperatura
   - Probabilidade: média
   - Impacto: alto
   - Mitigação: centralizar a conversão em funções puras e cobrir com testes automatizados.

4. Experiência ruim em dispositivos móveis
   - Probabilidade: média
   - Impacto: alto
   - Mitigação: priorizar mobile-first, testar em diferentes larguras de tela e manter componentes compactos.

5. Latência ou baixa performance
   - Probabilidade: média
   - Impacto: médio
   - Mitigação: reduzir chamadas desnecessárias, otimizar renderização e evitar requisições redundantes.

---

# Perguntas em Aberto (Open Questions)

1. A aplicação deve aceitar busca por código postal ou apenas por nome da cidade?
   - Impacto: define a qualidade da experiência de busca e a lógica de geocodificação.

2. A previsão de 5 dias inclui o dia atual ou começa no próximo dia?
   - Impacto: muda a interpretação do requisito e a quantidade de elementos exibidos.

3. A unidade padrão deve ser Celsius ou Fahrenheit para os usuários?
   - Impacto: influencia a experiência inicial e a lógica visual da interface.

4. O produto deve oferecer geolocalização automática com base na localização do usuário?
   - Impacto: altera a complexidade de implementação e a facilidade de uso.

5. A aplicação deve armazenar histórico de buscas ou favoritos?
   - Impacto: expande o escopo de funcionalidade e persistência de dados.

6. Quais dados climáticos mínimos são obrigatórios para a tela inicial?
   - Impacto: define o nível de detalhamento da UI e a estrutura da API consumida.

7. A aplicação precisa funcionar offline ou apenas online?
   - Impacto: define se haverá cache, estado persistente e estratégia de fallback.

8. Qual é a política de suporte para cidades não encontradas ou consultas vazias?
   - Impacto: afeta o tratamento de erro e o feedback exibido ao usuário.

---

# O que ainda precisa ser fechado antes da especificação

1. **Contrato mínimo da API de clima**
   - Precisamos definir quais campos são obrigatórios para a tela principal: temperatura, condição do clima, umidade, vento, pressão, previsão de 5 dias e comportamento quando algum valor vier ausente.
   - Impacto: sem esse contrato, o front-end pode implementar a UI com base em suposições diferentes das fornecidas pela API.

2. **Regra de busca de cidade**
   - Precisamos decidir se a busca aceita apenas nome da cidade, ou também estado, país, código postal ou coordenadas.
   - Impacto: isso influencia a qualidade da experiência e a lógica de geocodificação.

3. **Critérios de UX para erro e vazio**
   - A app precisa ter comportamento claro para cidades não encontradas, consultas vazias, falha de rede e API indisponível.
   - Impacto: sem isso, a interface pode parecer quebrada mesmo quando o problema é operacional.

4. **Objetivos de qualidade mensuráveis**
   - Devemos definir metas como tempo de carregamento, suporte mínimo a navegadores e acessibilidade mínima.
   - Impacto: sem critérios objetivos, a revisão de qualidade fica subjetiva e inconsistente.

5. **Escopo do produto para v1**
   - Precisamos definir explicitamente o que entra e o que fica fora: geolocalização, cache, favoritos, histórico e autenticação.
   - Impacto: sem isso, o produto cresce sem controle e aumenta o risco de retrabalho.

6. **Perfis de usuário e cenários de uso**
   - Ainda falta formalizar quem usa o app e em qual situação: viajante, pessoa com rotina diária, planejador de atividades etc.
   - Impacto: sem esse contexto, a UX pode não refletir o comportamento real dos usuários.

---

# Suposições (Assumptions)

1. A aplicação será entregue como uma Single Page Application (SPA) web.
2. O projeto usará uma API pública de clima sem necessidade de chave de acesso.
3. O foco principal é a visão de produto em navegadores modernos e dispositivos móveis.
4. A autenticação do usuário não é necessária para a versão inicial.
5. Usuários comuns esperam uma interface simples, visualmente limpa e de navegação direta.
6. A previsão de 5 dias será tratada como uma visão resumida, não como dados meteorológicos em tempo real por hora.
7. A conversão de temperatura será uma regra de interface e não exigirá nova chamada à API.
8. A experiência deve priorizar rapidez e clareza em vez de excesso de configurações.

---

# Decisões

1. **Fonte de dados: Open-Meteo (sem API key)**
   - Justificativa: a Open-Meteo oferece acesso gratuito e simples a dados geográficos e climáticos sem exigir autenticação.
   - Resolve: elimina a incerteza sobre a origem dos dados e reduz a dependência de infraestrutura de backend.

2. **"5 dias" = hoje + 4 dias seguintes**
   - Justificativa: esta definição é clara para o usuário e facilita a interpretação da interface e do contrato com a API.
   - Resolve: responde diretamente a dúvida sobre a inclusão do dia atual na previsão.

3. **Unidade padrão: Celsius**
   - Justificativa: Celsius é a unidade mais comum em contextos internacionais e na experiência de usuários brasileiros, além de manter a interface inicial mais intuitiva.
   - Resolve: define a unidade padrão da experiência, sem exigir que o usuário adivinhe a convenção da app.

4. **Sem autenticação e sem persistência de servidor**
   - Justificativa: a aplicação é focada em consulta pública e instantânea de clima, sem necessidade de contas, histórico centralizado ou armazenamento de dados do usuário.
   - Resolve: evita ambiguidade sobre login, dados persistidos e necessidade de backend de persistência.

5. **Idioma da UI: pt-BR**
   - Justificativa: o produto é projetado para um público de uso brasileiro e a interface deve refletir a linguagem e a experiência local.
   - Resolve: define a linguagem principal da app e facilita legibilidade, usabilidade e compreensão local.

---
