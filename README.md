# Testes de API com cypress para cadastro e consulta de usuarios e filmes

Este projeto contém testes automatizados de API para as funcionalidades de cadastro e consulta de usuarios e filmes em uma aplicação.

## Pré-requisitos

- Node.js instalado

## Configuração do Projeto

1. Clone o repositório para sua máquina local:

   ```bash
   git clone git@github.com:andremarquezz/testes-apicypress-andreMarquez.git
   ```

2. Instale as dependências do projeto:

   ```bash
   npm install
   ```

## Executando os Testes

Para executar os testes, execute o seguinte comando na raiz do projeto:

```bash
npm test
```

Isso iniciará a execução dos testes usando o Cypress.

## Estrutura dos Testes

- O diretório `cypress/e2e` contém os arquivos de teste organizados por funcionalidade.
- Os arquivos de teste seguem uma estrutura de describe/it para descrever o comportamento esperado em diferentes cenários.
- Os testes fazem uso de comandos personalizados e fixtures para facilitar a escrita e a manutenção dos testes.
