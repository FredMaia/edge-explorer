from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import deque, defaultdict
import heapq
import os
import random
import json

from read import ler_grafo

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads/'

def convert_graph(data):
    try:
        graph = data['Grafo']
        converted_graph = {int(key): [(int(edge[0]), int(edge[1]), float(edge[2])) for edge in edges] for key, edges in graph.items()}
        return converted_graph, None
    except Exception as e:
        return None, 'Invalid input'

def gerar_vertices(v: int, width: int, height: int) -> list:
    vertices = []
    for i in range(v):
        x = random.randint(50, width - 50)
        y = random.randint(50, height - 50)
        vertices.append({
            'id': i,
            'x': x,
            'y': y
        })
    return vertices

def gerar_arestas(arestas: dict, vertices: list, is_directed: bool) -> list:
    edges = []
    for origem, arestas_lista in arestas.items():
        for id, destino, peso in arestas_lista:
            x1 = next(vertex['x'] for vertex in vertices if vertex['id'] == origem)
            y1 = next(vertex['y'] for vertex in vertices if vertex['id'] == origem)
            x2 = next(vertex['x'] for vertex in vertices if vertex['id'] == destino)
            y2 = next(vertex['y'] for vertex in vertices if vertex['id'] == destino)
            
            edges.append({
                'idAresta': id,
                'x1': x1,
                'y1': y1,
                'x2': x2,
                'y2': y2,
                'destino': destino,
                'origem': origem,
                'pesoAresta': peso,
                'directed': not is_directed
            })
    return edges

def preparar_dados_para_frontend(v: int, arestas: dict, is_directed: bool, width: int, height: int) -> str:
    vertices = gerar_vertices(v, width, height)
    edges = gerar_arestas(arestas, vertices, is_directed)
    
    dados = {
        'vertices': vertices,
        'edges': edges
    }
    
    return json.dumps(dados)

def arvore_largura(arestas: dict, vertice_inicial: int) -> int:
    visitados = set()
    fila = deque([vertice_inicial])
    
    arvore = []
    sequencia_vertices = []

    while fila:
        vertice_atual = fila.popleft()
        visitados.add(vertice_atual)
        sequencia_vertices.append(vertice_atual)

        for id_aresta, destino, peso in sorted(arestas.get(vertice_atual, []), key=lambda x: x[1]):
            if destino not in visitados:
                fila.append(destino)
                visitados.add(destino)
                arvore.append(id_aresta)  

    return sequencia_vertices

def arvore_profundidade(grafo: dict, v: int) -> list:
    arvore_dfs = []  
    sequencia_vertices = [] 
    pilha = [(grafo[v][0][0], v)]  
    visitado = set()

    while pilha:
        vertice = pilha.pop()

        
        if vertice[1] not in visitado:
            visitado.add(vertice[1])
            sequencia_vertices.append(vertice[1])  
            arvore_dfs.append(vertice[0]) 

      
            for (id_aresta, vizinho, peso) in sorted(grafo[vertice[1]], key=lambda x: x[1], reverse=True):
                if vizinho not in visitado:
                    pilha.append((id_aresta, vizinho))

    
    if 0 in arvore_dfs:
        arvore_dfs.remove(0)

    return sequencia_vertices  # Retorna a sequência de vértices visitados

def conexo(v: int, grafo: dict, nao_direcionado: bool):
    print("asdassaddssd")
    print(grafo)
    grafo_temp = {k: v[:] for k, v in grafo.items()}  # copiar grafo

    visitado = {k: False for k in grafo_temp.keys()}  # usar dicionário para visitação

    pilha = [v]

    while pilha:
        vertice = pilha.pop()

        # Se o vértice ainda não foi visitado
        if not visitado[vertice]:
            visitado[vertice] = True

            # Adicionar vizinhos não visitados à pilha
            for vizinho in grafo_temp[vertice]:
                if not visitado[vizinho[1]]:
                    pilha.append(vizinho[1])

    # Verifica se todos os vértices foram visitados
    if all(visitado.values()):
        return 1
    return 0

def euleriano(arestas: dict) -> int:
    # Para ver se é euleriano basta verificar se todos os vértices possuem grau par. Se sim, é euleriano (o grafo precisa ser conexo)
    ############# CHAMAR FUNÇÃO DE VER SE É CONEXO (se for conexo, continuar na função, se não for, retornar 0)
    for vertice in arestas: 
        # Para cada vértice, ver quantas arestas ele possui. 
        # Ex.: 1: [(0, 0, 1), (1, 2, 1), (2, 3, 1)]. Nesse caso o vértice 1 tem grau 3 e consequentemente resto 1
        if (len(arestas[vertice]) % 2 == 1):
            return 0
    return 1

def possui_ciclo(vertices, arestas, nao_direcionado):
    visitado = set()
    pai = {}

    def busca_profundidade(atual, anterior):
        visitado.add(atual)
        for id_aresta, vizinho, peso in arestas[atual]:
            if vizinho not in visitado:
                pai[vizinho] = atual
                if busca_profundidade(vizinho, atual):
                    return 1
            elif vizinho != anterior:
                # Encontrou um ciclo
                return 1
        return 0

    # Verificar todos os componentes do grafo
    for vertice in vertices:
        if vertice not in visitado:
            if busca_profundidade(vertice, -1):
                return 1
    return 0

def bipartido(grafo, nao_direcionado):
    if not nao_direcionado:
        return 0
    
    def bfs_bipartido(grafo, origem, cor):
        fila = deque([origem])
        cor[origem] = 0

        while fila:
            no_atual = fila.popleft()
            cor_atual = cor[no_atual]

            for id, vizinho, peso in grafo.get(no_atual, []):
                if vizinho not in cor:  # Se o vizinho ainda não foi colorido

                    # Atribui a cor oposta ao vizinho
                    cor[vizinho] = 1 - cor_atual
                    fila.append(vizinho)
                elif cor[vizinho] == cor_atual:  # Se o vizinho tem a mesma cor, o grafo não é bipartido
                    return False
        return True

    cor = {}  # Dicionário para armazenar as cores dos vértices

    # Verificar se cada componente do grafo é bipartida
    for origem in grafo:
        if origem not in cor:  # Se o vértice ainda não foi visitado
            if not bfs_bipartido(grafo, origem, cor):
                return 0

    return 1

def encontrarPontes(grafo, nao_direcionado):
    if not nao_direcionado:
        return -1

    n = len(grafo) + 1  # Ajuste para considerar que as chaves começam em 1
    descoberta = [-1] * n
    menorTempo = [-1] * n
    pai = [-1] * n
    pontes = []

    def dfs(u, tempo):
        descoberta[u] = menorTempo[u] = tempo
        tempo += 1

        for (idAresta, v, peso) in grafo[u]:
            if descoberta[v] == -1:  # Se v não foi visitado
                pai[v] = u
                tempo = dfs(v, tempo)

                menorTempo[u] = min(menorTempo[u], menorTempo[v])

                # Se a menor altura alcançável de v é maior que descoberta de u, (u, v) é uma ponte
                if menorTempo[v] > descoberta[u]:
                    pontes.append(idAresta)

            elif v != pai[u]:  # Atualiza menorTempo[u] para back edge
                menorTempo[u] = min(menorTempo[u], descoberta[v])

        return tempo

    # Chama DFS para cada vértice não visitado
    for i in range(1, n):  # Ajuste para iteração de 1 até n-1
        if descoberta[i] == -1:
            dfs(i, 0)

    return sorted(pontes)

def componentes_conexas(grafo: dict, nao_orientado) -> list:
    if not nao_orientado:
        return -1

    contador = 0
    visitado = [False] * (len(grafo) + 1)  # Ajuste para que a lista acomode índices começando em 1

    pilha = []
    comp_conexos = []
    for i in range(1, len(visitado)):  # Começa em 1, não em 0
        if not visitado[i]:  # Se o vértice ainda não foi visitado
            comp_conexos1 = []
            contador += 1
            pilha.append(i)
            while pilha:
                vertice = pilha.pop()
                if not visitado[vertice]:
                    comp_conexos1.append(vertice)
                    visitado[vertice] = True

                    # Adicionar vizinhos não visitados à pilha
                    for vizinho in grafo[vertice]:
                        if not visitado[vizinho[1]]:
                            pilha.append(vizinho[1])

            # Adicionar o componente conexo encontrado à lista principal
            comp_conexos.append(sorted(comp_conexos1))

    return len(comp_conexos)

def componentes_fortemente_conexos(v, grafo, nao_direcionado):
    if nao_direcionado:
        return -1

    def dfs(v, visitado, pilha):
        visitado.add(v)  # Marca o vértice como visitado
        for _, vizinho, _ in grafo.get(v, []):  # Explora todos os vizinhos do vértice atual
            if vizinho not in visitado:
                dfs(vizinho, visitado, pilha)
        pilha.append(v)  # Adiciona o vértice na pilha após explorar todos os vizinhos

    def transpor_grafo(grafo):
        transposto = {}
        for origem in grafo:
            for id_aresta, destino, peso in grafo[origem]:
                if destino not in transposto:
                    transposto[destino] = []
                transposto[destino].append((id_aresta, origem, peso))
        return transposto

    def dfs_transposto(v, visitado, componente, grafo_transposto):
        visitado.add(v)  # Marca o vértice como visitado
        componente.append(v)
        for _, vizinho, _ in grafo_transposto.get(v, []):  # Explora todos os vizinhos no grafo transposto
            if vizinho not in visitado:
                dfs_transposto(vizinho, visitado, componente, grafo_transposto)

    pilha = []
    visitado = set()

    # Passo 1: Preenchendo a pilha com a ordem de finalização dos vértices
    for vertice in grafo:
        if vertice not in visitado:
            dfs(vertice, visitado, pilha)

    # Passo 2: Transpor o grafo
    grafo_transposto = transpor_grafo(grafo)

    # Passo 3: Processar os vértices na ordem inversa da finalização
    visitado = set()
    componentes = []
    while pilha:
        v = pilha.pop()
        if v not in visitado:
            componente = []
            dfs_transposto(v, visitado, componente, grafo_transposto)
            componentes.append(componente)

    return len(componentes)

def encontra_vertice_articulacao(grafo, nao_direcionado):
    if not nao_direcionado:
        return -1

    # Estruturas para a busca em profundidade
    tempo = [0]  # Relógio de tempo da DFS
    num_vertices = len(grafo)
    descoberta = [-1] * (num_vertices + 1)  # Tempo de descoberta dos vértices na DFS
    menor = [-1] * (num_vertices + 1)  # Menor tempo de descoberta acessível
    pai = [-1] * (num_vertices + 1)  # Vértice pai na DFS
    articulacao = [False] * (num_vertices + 1)  # Marca se um vértice é de articulação
    vertices_articulacao = []  # Lista de vértices de articulação

    def dfs(v):
        # Aumenta o tempo e marca o tempo de descoberta do vértice
        descoberta[v] = menor[v] = tempo[0]
        tempo[0] += 1
        filhos = 0  # Conta o número de filhos na DFS

        for (id_aresta, vizinho, peso) in grafo[v]:
            if descoberta[vizinho] == -1:  # Se vizinho não foi descoberto
                pai[vizinho] = v
                filhos += 1
                dfs(vizinho)

                # Atualiza o menor tempo de descoberta acessível
                menor[v] = min(menor[v], menor[vizinho])

                # Checa condição para que v seja vértice de articulação
                if pai[v] == -1 and filhos > 1:  # Raiz da DFS com mais de 1 filho
                    articulacao[v] = True
                if pai[v] != -1 and menor[vizinho] >= descoberta[v]:
                    articulacao[v] = True

            elif vizinho != pai[v]:  # Atualiza menor[v] para back edge
                menor[v] = min(menor[v], descoberta[vizinho])

    # Chama DFS para cada vértice não visitado
    for i in sorted(grafo.keys()):  # Ordena os vértices em ordem lexicográfica
        if descoberta[i] == -1:
            dfs(i)

    # Coleta os vértices de articulação
    for i in range(1, num_vertices + 1):  # Ajusta para começar de 1
        if articulacao[i]:
            vertices_articulacao.append(i)

    return vertices_articulacao

def arvore_minima(vertices, arestas, nao_direcionado):
    if not nao_direcionado:
        return -1

    if not arestas:
        return -1  # Retorna -1 se o dicionário de arestas estiver vazio

    visitados = set()
    pq = []
    total_minimo = 0
    arestas_selecionadas = []  # Lista para armazenar os IDs das arestas selecionadas

    # Seleciona um vértice inicial (o primeiro vértice da lista de chaves do dicionário)
    inicial = next(iter(arestas))
    visitados.add(inicial)

    # Adiciona as arestas conectadas ao vértice inicial na fila de prioridades
    for id_aresta, vertice, peso in arestas[inicial]:
        heapq.heappush(pq, (peso, vertice, id_aresta))

    # Processa a fila de prioridades para encontrar a árvore geradora mínima
    while pq:
        peso, v, id_aresta = heapq.heappop(pq)
        if v not in visitados:
            visitados.add(v)
            total_minimo += peso
            arestas_selecionadas.append(id_aresta)  # Armazena o ID da aresta

            # Verifica se o vértice atual tem arestas associadas
            if v in arestas:
                for id_proxima_aresta, proximo, p in arestas[v]:
                    if proximo not in visitados:
                        heapq.heappush(pq, (p, proximo, id_proxima_aresta))

    # Verifica se todos os vértices foram visitados (grafo conectado)
    if len(visitados) != len(vertices):
        return -1  # Retorna -1 se o grafo não for conectado

    return arestas_selecionadas

# OK
@app.route('/bfs', methods=['POST'])
def bfs_route():
    data = request.get_json()
    print(data)

    try: 
        graph = data['Grafo']
    
        converted_graph = {}
        for key, edges in graph.items():
            node = int(key)
            converted_graph[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400
    
    print(converted_graph)
    bfs_result = arvore_largura(converted_graph, 1)
    print(f"resultado do bfs: {bfs_result}")    
    
    return jsonify({'bfs_order': bfs_result})

# OK
@app.route('/dfs', methods=['POST'])
def dfs_route():
    data = request.get_json()
    print(data)

    try: 
        graph = data['Grafo']
    
        converted_graph = {}
        for key, edges in graph.items():
            node = int(key)
            converted_graph[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400
    
    print(converted_graph)
    bfs_result = arvore_profundidade(converted_graph, 1)
    print(f"resultado do bfs: {bfs_result}")    
    
    return jsonify({'bfs_order': bfs_result})

#OK
@app.route('/conexo', methods=['POST'])
def is_connected():
    data = request.get_json()
    print(data)

    try: 
        nao_direcionado = data['nao_direcionado']
        graph = data['Grafo']
    
        converted_graph = {}
        for key, edges in graph.items():
            node = int(key)
            converted_graph[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400
    print(converted_graph)
    resultado = conexo(1, converted_graph, nao_direcionado)

    return jsonify({'resultado': resultado})

#
@app.route("/euleriano", methods=['POST'])
def is_euleriano():
    data = request.get_json()
     
    try: 
        graph = data['Grafo']
        nao_direcionado = data['nao_direcionado']
    
        converted_graph = {}
        for key, edges in graph.items():
            node = int(key)
            converted_graph[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400

    if not conexo(1, converted_graph, nao_direcionado):
        return jsonify({'resultado': 0}) 

    for vertice in converted_graph: 
        if (len(converted_graph[vertice]) % 2 == 1):
            return jsonify({'resultado': 0}) 

    return jsonify({'resultado': 1}) 

#OK
@app.route('/bipartido', methods=['POST'])
def verificar_bipartido():
    data = request.get_json()
    print(data)

    try: 
        nao_direcionado = data['nao_direcionado']
        graph = data['Grafo']
    
        convertedGraph = {}
        for key, edges in graph.items():
            node = int(key)
            convertedGraph[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
            
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400
    print(convertedGraph)
    resultado = bipartido(convertedGraph, nao_direcionado)

    return jsonify({'resultado': resultado})

#OK
@app.route('/ciclo', methods=['POST'])
def verificar_ciclo():
    data = request.get_json()
    print(data)

    try: 
        nao_direcionado = data['nao_direcionado']
        graph = data['Grafo']
    
        converted_graph_ = {}
        for key, edges in graph.items():
            node = int(key)
            converted_graph_[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
            
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400
    print(converted_graph_)
    resultado = possui_ciclo(converted_graph_.keys(), converted_graph_, nao_direcionado)

    return jsonify({'resultado': resultado})

#ok
@app.route('/componentes_conexos', methods=['POST'])
def calcular_componentes_conexos():
    data = request.get_json()
    print(data)

    try: 
        nao_direcionado = data['nao_direcionado']
        graph = data['Grafo']

        print(nao_direcionado)
        print(graph)
    
        convertedGraph = {}
        for key, edges in graph.items():
            node = int(key)
            convertedGraph[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
            
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400
    print(convertedGraph)
    resultado = componentes_conexas(convertedGraph, nao_direcionado)
    print(resultado)
    return jsonify({'resultado': resultado})

#ok
@app.route('/componentes_fortes', methods=['POST'])
def calcular_componentes_fortes():
    data = request.get_json()
    print(data)

    try: 
        nao_direcionado = data['nao_direcionado']
        graph = data['Grafo']

        print(nao_direcionado)
        print(graph)
    
        convertedGraph = {}
        for key, edges in graph.items():
            node = int(key)
            convertedGraph[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
            
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400
    print(convertedGraph)
    resultado = componentes_fortemente_conexos(1, convertedGraph, nao_direcionado)
    print(resultado)
    return jsonify({'resultado': resultado})

# ok
@app.route('/pontos_articulacao', methods=['POST'])
def imprimir_pontos_articulacao():
    data = request.get_json()

    try: 
        nao_direcionado = data['nao_direcionado']
        graph = data['Grafo']

        convertedGraph = {}
        for key, edges in graph.items():
            node = int(key)
            convertedGraph[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
            
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400
    print(convertedGraph)
    resultado = encontra_vertice_articulacao(convertedGraph, nao_direcionado)
    print(resultado)
    return jsonify({'resultado': resultado})

#OK
@app.route('/arestas_ponte', methods=['POST'])
def calcular_arestas_ponte():
    data = request.get_json()
    print(data)

    try: 
        nao_direcionado = data['nao_direcionado']
        graph = data['Grafo']
    
        convertedGraph = {}
        for key, edges in graph.items():
            node = int(key)
            convertedGraph[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
            
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400
    print(convertedGraph)
    resultado = encontrarPontes(convertedGraph, nao_direcionado)

    return jsonify({'resultado': resultado})

#
@app.route('/arvore_geradora_minima', methods=['POST'])
def calcular_arvore_geradora_minima():
    data = request.get_json()

    try: 
        nao_direcionado = data['nao_direcionado']
        graph = data['Grafo']
    
        convertedGraph = {}
        for key, edges in graph.items():
            node = int(key)
            convertedGraph[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
            
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400
    print(convertedGraph)
    resultado = arvore_minima(convertedGraph.keys(), convertedGraph, nao_direcionado)
    
    return jsonify({'resultado': resultado})

@app.route('/ordenacao_topologica', methods=['POST'])
def imprimir_ordenacao_topologica():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement topological sort here
    result = "topological_sort(graph)"
    return jsonify({'ordenacao_topologica': result})

@app.route('/caminho_minimo', methods=['POST'])
def calcular_caminho_minimo():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement shortest path calculation here
    result = "shortest_path(graph)"
    return jsonify({'caminho_minimo': result})

@app.route('/fluxo_maximo', methods=['POST'])
def calcular_fluxo_maximo():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement max flow calculation here
    result = "max_flow(graph)"
    return jsonify({'fluxo_maximo': result})

@app.route('/fecho_transitivo', methods=['POST'])
def calcular_fecho_transitivo():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement transitive closure here
    result = "transitive_closure(graph)"
    return jsonify({'fecho_transitivo': result})

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        # Save the file using the UPLOAD_FOLDER variable
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        try:
            
            
            print(f"Saving file at: {file_path}")
            file.save(file_path)
            print("File saved successfully")
        except Exception as save_error:
            print(f"Error saving file: {save_error}")
            return jsonify({'error': 'Failed to save file'}), 500

        try:
            print(f"Processing file at: {file_path}")
            width = request.form.get('width')
            height = request.form.get('height')

            width = int(float(width))
            height = int(float(height))

            v, arestas, nao_direcionado = ler_grafo(filepath=file_path, nao_direcionado="direcionado")
            dados_json = preparar_dados_para_frontend(len(v), arestas, nao_direcionado, width - 200, height - 200)
            print(dados_json)
            return dados_json, 200, {'Content-Type': 'application/json'}
        except Exception as process_error:
            print(f"Error processing graph: {process_error}")
            return jsonify({'error': 'Failed to process graph'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)