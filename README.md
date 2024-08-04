# Graph Algorithm Visualization App

Este projeto é um aplicativo para visualização de algoritmos em grafos. O frontend é desenvolvido em React Native e o backend é desenvolvido em Flask. O objetivo é fornecer uma interface interativa para visualizar e experimentar diferentes algoritmos de grafos, como busca em profundidade (DFS), busca em largura (BFS), e outros algoritmos comuns.

## Índice

- [Introdução](#introdução)
- [Instalação](#instalação)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Uso](#uso)
  - [Frontend](#frontend-1)
  - [Backend](#backend-1)
- [Desenvolvimento](#desenvolvimento)
  - [Frontend](#desenvolvimento-frontend)
  - [Backend](#desenvolvimento-backend)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Introdução

Este projeto consiste em duas partes:

- **Frontend**: Aplicativo móvel desenvolvido em React Native, que permite a visualização e interação com grafos e algoritmos.
- **Backend**: API desenvolvida em Flask, que fornece os dados e processa as solicitações relacionadas aos algoritmos de grafos.

## Instalação

### Frontend

1. **Pré-requisitos**: Certifique-se de ter o Node.js e o Expo CLI instalados em seu sistema.

2. **Clonar o repositório**:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd frontend

   ```

3. **Instalar dependências**:

```
npm install
npm start
expo start
```

### Backend

1. **Pré-requisitos**: Certifique-se de ter o Python e o pip instalados em seu sistema.

2. **Clonar o repositório**:

   ```
   git clone <URL_DO_REPOSITORIO>
   cd backend
   ```

3. **Criar um ambiente virtual e instalar dependências**:

```
python -m venv venv
source venv/bin/activate  # No Windows, use `venv\Scripts\activate`
pip install -r requirements.txt
```

4. **Iniciar o servidor Flask:**
```
python app.py
```

## Uso

### Frontend

- **Visualizar Grafos**: Toque na tela para adicionar vértices e criar conexões entre eles. Você pode clicar em um vértice para aumentá-lo e tocar em dois vértices para conectar uma aresta entre eles.
- **Executar Algoritmos**: Selecione um algoritmo do menu e visualize como ele opera no grafo.
- **Resetar o Grafo**: Use o botão de reset para remover todas as arestas e reiniciar o grafo.

### Backend

- **Endpoints**:
  - **POST `/bfs`**: Realiza a busca em largura (BFS) no grafo fornecido.
    - **Request Body**:
      ```json
      {
        "graph": {
          "A": ["B", "C"],
          "B": ["A", "D", "E"],
          "C": ["A", "F"],
          "D": ["B"],
          "E": ["B", "F"],
          "F": ["C", "E"]
        },
        "start": "A"
      }
      ```
    - **Response**:
      ```json
      ["A", "B", "C", "D", "E", "F"]
      ```
  - **POST `/dfs`**: Realiza a busca em profundidade (DFS) no grafo fornecido.
    - **Request Body**:
      ```json
      {
        "graph": {
          "A": ["B", "C"],
          "B": ["A", "D", "E"],
          "C": ["A", "F"],
          "D": ["B"],
          "E": ["B", "F"],
          "F": ["C", "E"]
        },
        "start": "A"
      }
      ```
    - **Response**:
      ```json
      ["A", "B", "D", "E", "F", "C"]
      ```

## Desenvolvimento

### Frontend

- **Instalação**:
  - Instale o Node.js e o Expo CLI.
  - Instale as dependências do projeto usando `npm install`.

- **Desenvolvimento**:
  - Use `npm start` ou `expo start` para iniciar o servidor de desenvolvimento.
  - O código-fonte está localizado na pasta `frontend`.

### Backend

- **Instalação**:
  - Instale o Python e `pip`.
  - Crie um ambiente virtual e instale as dependências com `pip install -r requirements.txt`.

- **Desenvolvimento**:
  - Inicie o servidor Flask com `python app.py`.
  - O código-fonte está localizado na pasta `backend`.

## Contribuição

Se você deseja contribuir para este projeto, por favor siga estes passos:

1. Faça um fork do repositório.
2. Crie uma nova branch para suas alterações (`git checkout -b minha-nova-feature`).
3. Faça commit das suas alterações (`git commit -am 'Adiciona nova feature'`).
4. Faça push para a branch (`git push origin minha-nova-feature`).
5. Abra um Pull Request.
