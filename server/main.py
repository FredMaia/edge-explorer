from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import deque
import os
import random
import json

from read import ler_grafo

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads/'




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
            dados_json = preparar_dados_para_frontend(len(v), arestas, nao_direcionado, width, height)
            print(dados_json)
            return dados_json, 200, {'Content-Type': 'application/json'}
        except Exception as process_error:
            print(f"Error processing graph: {process_error}")
            return jsonify({'error': 'Failed to process graph'}), 500

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




def convert_graph(data):
    try:
        graph = data['Grafo']
        converted_graph = {int(key): [(int(edge[0]), int(edge[1]), float(edge[2])) for edge in edges] for key, edges in graph.items()}
        return converted_graph, None
    except Exception as e:
        return None, 'Invalid input'

@app.route('/conexo', methods=['POST'])
def verificar_conexo():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement the connectivity check here
    result = "is_connected(graph)"
    return jsonify({'conexo': result})

@app.route('/bipartido', methods=['POST'])
def verificar_bipartido():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement bipartite check here
    result = "is_bipartite(graph)"
    return jsonify({'bipartido': result})

@app.route('/euleriano', methods=['POST'])
def verificar_euleriano():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement Eulerian check here
    result = "is_eulerian(graph)"
    return jsonify({'euleriano': result})

@app.route('/ciclo', methods=['POST'])
def verificar_ciclo():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement cycle check here
    result = "has_cycle(graph"
    return jsonify({'ciclo': result})

@app.route('/componentes_conexos', methods=['POST'])
def calcular_componentes_conexos():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement connected components count here
    result = "count_connected_components(graph)"
    return jsonify({'componentes_conexos': result})

@app.route('/componentes_fortes', methods=['POST'])
def calcular_componentes_fortes():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement strongly connected components count here
    result = "count_strongly_connected_components(graph)"
    return jsonify({'componentes_fortes': result})

@app.route('/pontos_articulacao', methods=['POST'])
def imprimir_pontos_articulacao():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement articulation points listing here
    result = "articulation_points(graph)"
    return jsonify({'pontos_articulacao': result})

@app.route('/arestas_ponte', methods=['POST'])
def calcular_arestas_ponte():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement bridge edges count here
    result = "count_bridges(graph)"
    return jsonify({'arestas_ponte': result})

@app.route('/arvore_profundidade', methods=['POST'])
def imprimir_arvore_profundidade():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement depth tree here
    result = "depth_tree(graph)"
    return jsonify({'arvore_profundidade': result})

@app.route('/arvore_largura', methods=['POST'])
def imprimir_arvore_largura():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement breadth tree here
    result = "breadth_tree(graph)"
    return jsonify({'arvore_largura': result})

@app.route('/arvore_geradora_minima', methods=['POST'])
def calcular_arvore_geradora_minima():
    data = request.get_json()
    graph, error = convert_graph(data)
    if error:
        return jsonify({'error': error}), 400
    # Implement MST value calculation here
    result = "minimum_spanning_tree(graph)"
    return jsonify({'arvore_geradora_minima': result})

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





if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)