# Aplicativo de visualização de algoritmos em grafos

Este projeto é um aplicativo para visualização de grafos para a matéria de "Algoritmos em Grafos". A interface é desenvolvida em React Native e os algortimos são executados em um servidor em Flask. O objetivo é fornecer uma interface interativa para visualizar e experimentar diferentes algoritmos de grafos, como o BFS, DFS, Kruskal, Prim, Dijkstra, fluxo máximo, identificador de pontes, vértices de articulação, dentre outros. Os grafos podem ser gerados tanto interativamente quanto por leitura de arquivo. A leitura do arquivo deve estar na forma descrita [aqui](#arquivo-de-entrada)

# Índice


- [Interface](#interface)
  - [Instalação](#instalação)
  - [Uso](#uso)
  - [Arquivo de entrada](#arquivo-de-entrada)
- [Servidor](#servidor)
  - [Rode o servidor](#rode-o-servidor)
  - [Uso](#uso)
  - [Endpoints e Algoritmos](#endpoints-e-algoritmos)

# Interface

#### Instalação

1. **Pré-requisitos**: Certifique-se de ter o Node.js instalados em seu sistema.

2. **Instale as dependências e rode**:

```
npm install
npx expo start
```

#### Uso

| Interação                                                                                     | Executar Algoritmos                                                                      | Leitura por Arquivo                                                                         |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ![Interação](https://github.com/user-attachments/assets/fba80817-efb5-45e7-99bc-7d23c46298fb) | ![gif2](https://github.com/user-attachments/assets/159b6c6c-ece2-4386-a552-4986b4128251) | ![gif3](https://github.com/user-attachments/assets/0a46cbe1-4e3a-4c3b-9e9d-e0861c9e7f0d)    |

#### Arquivo de entrada

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

Existem alguns grafos de testes na pasta `server/tests`.

- **Visualizar Grafos**: Toque na tela para adicionar vértices e criar conexões entre eles. Você pode clicar em um vértice para aumentá-lo e tocar em dois vértices para conectar uma aresta entre eles.
- **Executar Algoritmos**: Selecione um algoritmo do menu e visualize como ele opera no grafo.
- **Resetar o Grafo**: Use o botão de reset para remover todas as arestas e reiniciar o grafo, como também pode excluir vértices/arestas específicas ou alterar o peso.

# Servidor

#### Rode o servidor

1. **Pré-requisitos**: Certifique-se de ter o Python e o pip instalados em seu sistema.
2. **Crie um ambiente virtual e instale dependências**:

```
python -m venv venv
source venv/bin/activate  # No Windows, use `venv\Scripts\activate`
pip install -r requirements.txt
```

3. **Iniciar o servidor Flask:**

```
python main.py
```

### Endpoints e Algoritmos

- **POST `/bfs`**: Imprime a árvore de largura (priorizando a ordem lexicográfica dos vértices; 0 é a origem). Você deve imprimir o identificador das arestas. Caso o grafo seja desconexo, considere apenas a árvore com a raiz 0.

- **POST `/dfs`**: Imprime a árvore em profundidade (priorizando a ordem lexicográfica dos vértices; 0 é a origem). Você deve imprimir o identificador das arestas. Caso o grafo seja desconexo, considere apenas a árvore com a raiz 0.

- **POST `/conexo`**: Verifica se um grafo é conexo. Para o caso de grafos orientados, verifica conectividade fraca.

- **POST `/euleriano`**: Verifica se um grafo é Euleriano.

- **POST `/bipartido`**: Verifica se um grafo não-orientado é bipartido.

- **POST `/ciclo`**: Verifica se um grafo possui ciclo.

- **POST `/componentes-conexos`**: Calcula a quantidade de componentes conexas em um grafo não-orientado.

- **POST `/componentes-fortes`**: Calcula a quantidade de componentes fortemente conexas em um grafo orientado.

- **POST `/pontos_articulacao`**: Imprime os vértices de articulação de um grafo não-orientado (priorizar a ordem lexicográfica dos vértices).

- **POST `/arestas_ponte`**: Calcula quantas arestas ponte possui um grafo não-orientado.

- **POST `/arvore_geradora_minima`**: Calcula o valor final de uma árvore geradora mínima (para grafos não-orientados).

- **POST `/ordenacao_topologica`**: Imprime a ordem dos vértices em uma ordenação topológica. Esta função não fica disponível em grafos não-direcionados. Deve-se priorizar a ordem lexicográfica dos vértices para a escolha de quais explorar.

- **POST `/caminho_minimo`**: Calcula o valor do caminho mínimo entre dois vértices (para grafos não-orientados com pelo menos um peso diferente nas arestas). O vértice 0 é a origem; n-1 é o destino.

- **POST `/fluxo_maximo`**: Calcula o valor do fluxo máximo para grafos direcionados. O vértice 0 é a origem; n-1 é o destino.

- **POST `/fecho_transitivo`**: Calcula o fecho transitivo para grafos direcionados. Deve-se priorizar a ordem lexicográfica dos vértices; o vértice 0 é o escolhido.

- **POST `/upload`**: Endpoint genérico para upload.


#### Contribuidores

[Mateus Milani](http://github.com/milanimateus) <br>
[Mateus Mendes](http://github.com/mateusMendes0/)