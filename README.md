# Graph Algorithm Visualization App

Este projeto é um aplicativo para visualização de algoritmos em grafos. O frontend é desenvolvido em React Native e o backend é desenvolvido em Flask. O objetivo é fornecer uma interface interativa para visualizar e experimentar diferentes algoritmos de grafos, como o BFS, DFS, Kruskal, Prim, Bellman-Ford, Dijkstra, fluxo máximo, identificador de pontes, vértices de articulação, dentre outros. Os grafos podem ser gerados tanto interativamente como por leitura de arquivo. A leitura do arquivo deve estar na forma descrita [aqui](#arquivo)

# Índice

- [Interface](#interface)

| Interação                                         | Executar Algoritmos                                      | Leitura por Arquivo                                      |
| ------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| ![Interação](https://github.com/user-attachments/assets/6db51410-8c33-4546-9a6e-1a85e34ffc34) | ![Executar](https://github.com/user-attachments/assets/6db51410-8c33-4546-9a6e-1a85e34ffc34) | ![Leitura](https://github.com/user-attachments/assets/6db51410-8c33-4546-9a6e-1a85e34ffc34) |

  - [Instalação](#instalação)
  - [Uso](#uso)
  - [Arquivo](#arquivo)
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

#### Arquivo

O arquivo txt de entrada deve estar estruturado da seguinte maneira:

```
// quantidade de vértices e arestas
5 7

// ou então "nao_direcionado"
direcionado

// idAresta, verticeOrigem, verticeDestino, pesoAresta
0 0 1 2
1 0 2 4
2 1 2 5
3 1 4 3
4 2 3 8
5 3 1 2
6 3 4 4
```

### imagens

| Interação | Executar algoritmos | Leitura de por arquivo |
| --------- | ------------------- | ---------------------- |

| <video width="320" height="240" controls> <source src="./assets/interface.mp4" type="video/mp4">
Your browser does not support the video tag. </video> | <img src="./readmeImages/data.jpg" alt="info image" width="100%"/> | <img src="./readmeImages/info1.jpg" alt="feed image" width="100%"/> |

<video> <source src="https://github.com/user-attachments/assets/98e13f0b-518a-4ccb-93d8-2445041b039c" type="video/mp4">
Your browser does not support the video tag.
</source>
</video>

![test](https://github.com/user-attachments/assets/98e13f0b-518a-4ccb-93d8-2445041b039c)

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
-ver preview do arquivo selecionado

-estruturar pastas do server: main.py que chama cada função da rota na sua respectiva pasta (listar, gerar, verificar)
