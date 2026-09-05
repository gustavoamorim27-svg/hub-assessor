# Migração V2

## Isolamento

Apenas a branch `codex/hub-v2` recebe estes arquivos. Não fazer merge em `main`, trocar GitHub Pages ou adicionar deploy sem aprovação. O HTML de backup redundante foi retirado somente da V2; continua recuperável no histórico Git e em `main`.

Dados usam o prefixo `hub:v2:`. Nenhum cliente Firebase é inicializado; alterações de ativos não afetam a biblioteca compartilhada original. Nenhum dado pessoal do PDF de referência ou de clientes foi incluído. O SVG Rico vem do vetor da aplicação original.

## Arquitetura

O HTML monolítico foi substituído por um shell pequeno. Views e scripts são carregados sob demanda. A home não carrega Chart.js, jsPDF, html2canvas ou SheetJS. O CSS legado fica numa cascade layer inferior; o tema é centralizado. A animação usa transforms, pausa quando a aba fica oculta, oferece pausa manual e respeita movimento reduzido.

## Dívida remanescente

Os mecanismos financeiros antigos permanecem como scripts clássicos em uma fronteira de compatibilidade. Ainda existem variáveis globais, `innerHTML`, handlers inline e regras acopladas à apresentação. Próximos passos: revisão de segurança dos templates e importadores, atualização de bibliotecas, revisão de cotações remotas e testes de regressão com arquivos reais. Nesta versão experimental, usar somente planilhas de origem confiável.

Os PNGs/PDFs anteriores foram preservados em código, não todos redesenhados ou homologados visualmente. A apresentação permanece herdada. O novo exportador LCA/CDB usa Canvas nativo, tipografia Sora/Manrope e valores calculados, sem IA generativa.

## Premissas do comparativo

Pessoa física, CDI constante, capitalização diária proporcional ao percentual do CDI e dias úteis estimados por `252 × dias corridos / 365`, sem calendário real de feriados. IR do CDB somente no ganho, limites de 180/360/720 dias; LCA isenta. Interface com prazos a partir de um ano, sem IOF. Não considera custos, saques, inadimplência ou CDI variável. Avaliar também liquidez, carência, emissor e condições de garantia.

Referências consultadas em 04/09/2026:

- [B3 — tabela de tributação](https://borainvestir.b3.com.br/noticias/imposto-de-renda/quais-investimentos-sao-isentos-de-ir-confira-a-tabela-atualizada-de-tributacao/).
- [B3 — isenção para pessoa física em 2026](https://www.b3.com.br/pt_br/noticias/isento-no-ir-mas-obrigatorio-na-declaracao-o-erro-que-pode-levar-investidores-a-malha-fina.htm).
- [Receita Federal — pagamento do imposto de renda variável](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/pagamento/renda-variavel/bolsa-de-valores-1/calculo-e-pagamento-do-imposto).

Corrigido um deslocamento de mês no helper de DARF: competência dezembro passa a apontar janeiro. Data estimada exclui fins de semana, não feriados; confirmar no Sicalc/ReVar. Isso não é auditoria da apuração fiscal herdada.

## Validação

Testes de sintaxe/imports, faixas de IR, capitalização, tributação do ganho, dados isolados, backup, busca, URLs e entrada direta/reativação das dez ferramentas. Integração de DOM usa pintura de gráficos simulada: não substitui homologação visual, de PNG/PDF, nem de importações reais. Build estático e resposta HTTP também verificados.

WebMCP é opcional, protegido por feature detection. Não houve contexto nativo compatível para homologação ponta a ponta; não é uma dependência do aplicativo.

`scripts/extract-tools.mjs` documenta a extração inicial. Não rodar sobre arquivos já modificados: sobrescreve ferramentas. Builds normais não o executam. `docs/migration-source.json` registra a origem dos blocos.
