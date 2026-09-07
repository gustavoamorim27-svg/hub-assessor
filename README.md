# Hub do Assessor · V2

Versão experimental reconstruída a partir de `main` (`deadcb436293883ffa0f5324ca33d5b88d4ec927`).

**A branch `codex/hub-v2` não publica nem substitui o site original.** Não há workflow de deploy nesta versão. O endereço https://gustavoamorim27-svg.github.io/hub-assessor/ permanece na configuração original de GitHub Pages.

## Novidades

- Navegação lateral, busca, atalhos recentes e layout responsivo.
- Vetor Rico original, fundo lava lamp, painéis de vidro e pausa da animação.
- Comparativo LCA/CDB editável com exportação PNG própria.
- Ferramentas separadas em arquivos, carregadas sob demanda.
- Dados isolados por `hub:v2:`, backup/importação e Firebase original desativado.
- Dependências de execução locais, com versões fixas.
- Testes unitários e integração de inicialização das dez ferramentas.

## Rodar e verificar

Node.js 22+ e pnpm:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm check
pnpm build
```

Prévia: http://127.0.0.1:4173/. `dist/` contém o pacote estático. Assets relativos e rotas por hash permitem servir sob um subdiretório. Não abrir por `file://`: módulos exigem HTTP.

## Preservação da versão publicada

O repositório `hub-gustavo-amorim` é a referência oficial para publicação. Antes de qualquer novo ajuste, sincronize esse repositório e execute `pnpm sync:published`. As personalizações feitas diretamente na página publicada ficam registradas em `src/published-overrides.html` e são reinseridas por `pnpm standalone`.

Nunca substitua `hub-gustavo-amorim/index.html` por uma geração baseada em uma cópia antiga. A publicação deve começar com `git pull --ff-only`, conferir que não há mudanças remotas pendentes e preservar a camada de personalizações.

## Organização

`src/core`: cálculos, catálogo e dados. `src/ui` e `src/styles`: apresentação e identidade. `src/services`: carregamento e exportação. `src/features`: ferramentas migradas. `src/compat`: limite de compatibilidade. `tests`: verificação automatizada.

Esta é uma refatoração progressiva, não uma reescrita integral nem uma certificação dos modelos financeiros. Construtores, importações e geradores anteriores foram preservados em código. Há handlers inline, estado global e regras herdadas a migrar. Consulte [escopo e limitações](docs/MIGRATION.md).

O catálogo herdado contém exemplos de produtos e taxas da versão de origem, não ofertas atuais. Confirme condições, disponibilidade, tributação e adequação ao cliente. Notícias são um snapshot datado, não um feed em tempo real.
