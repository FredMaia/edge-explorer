# Graph Algorithm Visualization App

Este projeto é um aplicativo para visualização de algoritmos em grafos. O frontend é desenvolvido em React Native e o backend é desenvolvido em Flask. O objetivo é fornecer uma interface interativa para visualizar e experimentar diferentes algoritmos de grafos, como o BFS, DFS, Kruskal, Prim, Bellman-Ford, Dijkstra, fluxo máximo, identificador de pontes, trilhas eulerianas, vértices de articulação, dentre outros. 

# Índice

- [Introdução](#introdução)
- [Interface](#interface)
  - [Instalação](#instalação)
  - [Uso](#uso)
- [Servidor](#servidor)
  - [Instalação](#instalação)
  - [Uso](#uso)
- [Desenvolvimento](#desenvolvimento)
  - [Frontend](#desenvolvimento-frontend)
  - [Backend](#desenvolvimento-backend)

# Introdução

Este projeto consiste em duas partes:

- **Frontend**: Aplicativo móvel desenvolvido em React Native, que permite a visualização e interação com grafos e algoritmos.
- **Backend**: API desenvolvida em Flask, que fornece os dados e processa as solicitações relacionadas aos algoritmos de grafos.

# Interface

#### Instalação

1. **Pré-requisitos**: Certifique-se de ter o Node.js e o Expo instalados em seu sistema.

2. **Instalar dependências e rodar**:

```
npm install
npx expo start
```

#### Uso

### imagens

- **Visualizar Grafos**: Toque na tela para adicionar vértices e criar conexões entre eles. Você pode clicar em um vértice para aumentá-lo e tocar em dois vértices para conectar uma aresta entre eles.
- **Executar Algoritmos**: Selecione um algoritmo do menu e visualize como ele opera no grafo.
- **Resetar o Grafo**: Use o botão de reset para remover todas as arestas e reiniciar o grafo.

# Servidor

#### Instalação

1. **Pré-requisitos**: Certifique-se de ter o Python e o pip instalados em seu sistema.
2. **Criar um ambiente virtual e instalar dependências**:
```
python -m venv venv
source venv/bin/activate  # No Windows, use `venv\Scripts\activate`
pip install -r requirements.txt
```

3. **Iniciar o servidor Flask:**
```
python main.py
```

#### Uso

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

tobedones
-aresta de um vertice para ele mesmo
-verificar se a aresta ja existe ao adiciona-la
-bottom tab com opções
-zoom in e zoom out
-ao adicionar um vertice, ele nao é adicionado nos edges