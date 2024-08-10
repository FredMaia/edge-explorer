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




def gerar_vertices(v: int) -> list:
    vertices = []
    for i in range(v):
        x = random.randint(50, 750)
        y = random.randint(50, 550)
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

def preparar_dados_para_frontend(v: int, arestas: dict, is_directed: bool) -> str:
    vertices = gerar_vertices(v)
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
            v, arestas, nao_direcionado = ler_grafo(filepath=file_path, nao_direcionado="direcionado")
            dados_json = preparar_dados_para_frontend(len(v), arestas, nao_direcionado)
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)