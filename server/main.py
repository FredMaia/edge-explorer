from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# import logging
# logging.basicConfig(level=logging.DEBUG)

Grafo = {
    0: [(0, 1, 1)],
    1: [(0, 0, 1), (1, 2, 1), (2, 3, 1)],
    2: [(1, 1, 1), (3, 3, 1)],
    3: [(2, 1, 1), (3, 2, 1)]
}

from collections import deque

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

def conexo(grafo):
    vertices_visitados = arvore_largura(grafo, 1)
    return len(vertices_visitados) == len(grafo.keys())

@app.route('/bfs', methods=['POST'])
def bfs_route():
    # data = request.json
    # print(data)
    # grafo = data.get('Grafo')
    # print(grafo)
    # start_node = data.get('start_node')
    # print(start)
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

# Rota POST para DFS
@app.route('/dfs', methods=['POST'])
def dfs_route():
    data = request.json
    start_node = data.get('start_node')
    if start_node is None or start_node not in Grafo:
        return jsonify({'error': 'Invalid start node'}), 400
    
    dfs_result = "yes"
    return jsonify({'dfs_order': dfs_result})

@app.route('/conexo', methods=['POST'])
def is_connected():
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
    
    resultado = conexo(converted_graph)

    return jsonify({'resultado': resultado})

@app.route("/euleriano", methods=['POST'])
def is_euleriano():
    data = request.get_json()
     
    try: 
        graph = data['Grafo']
    
        converted_graph = {}
        for key, edges in graph.items():
            node = int(key)
            converted_graph[node] = [(edge[0], edge[1], edge[2]) for edge in edges]
    except Exception as e:
        return jsonify({'error': 'Invalid input'}), 400

    if not conexo(converted_graph):
        return jsonify({'resultado': 0}) 
    

    for vertice in converted_graph: 
        if (len(converted_graph[vertice]) % 2 == 1):
            return jsonify({'resultado': 0}) 

    return jsonify({'resultado': 1}) 


@app.route('/', methods=['GET'])
def get_route():
    return jsonify({'message': "working"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)