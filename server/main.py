from flask import Flask, request, jsonify
from collections import deque

app = Flask(__name__)

# Função de busca em largura (BFS)
def bfs(graph, start):
    visited = set()
    queue = deque([start])
    result = []

    while queue:
        vertex = queue.popleft()
        if vertex not in visited:
            visited.add(vertex)
            result.append(vertex)
            queue.extend(neighbor for neighbor in graph.get(vertex, []) if neighbor not in visited)
    return result

# Função de busca em profundidade (DFS)
def dfs(graph, start):
    visited = set()
    result = []

    def _dfs(vertex):
        if vertex not in visited:
            visited.add(vertex)
            result.append(vertex)
            for neighbor in graph.get(vertex, []):
                _dfs(neighbor)

    _dfs(start)
    return result

@app.route('/bfs', methods=['POST'])
def bfs_route():
    data = request.json
    graph = data.get('graph')
    start = data.get('start')
    result = bfs(graph, start)
    return jsonify(result)

@app.route('/dfs', methods=['POST'])
def dfs_route():
    data = request.json
    graph = data.get('graph')
    start = data.get('start')
    result = dfs(graph, start)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)


from flask import Flask, request, jsonify
from collections import deque

app = Flask(__name__)

# Função de busca em largura (BFS)
def bfs(graph, start):
    visited = set()
    queue = deque([start])
    result = []

    while queue:
        vertex = queue.popleft()
        if vertex not in visited:
            visited.add(vertex)
            result.append(vertex)
            queue.extend(neighbor for neighbor in graph.get(vertex, []) if neighbor not in visited)
    return result

# Função de busca em profundidade (DFS)
def dfs(graph, start):
    visited = set()
    result = []

    def _dfs(vertex):
        if vertex not in visited:
            visited.add(vertex)
            result.append(vertex)
            for neighbor in graph.get(vertex, []):
                _dfs(neighbor)

    _dfs(start)
    return result

@app.route('/bfs', methods=['POST'])
def bfs_route():
    data = request.json
    graph = data.get('graph')
    start = data.get('start')
    result = bfs(graph, start)
    return jsonify(result)

@app.route('/dfs', methods=['POST'])
def dfs_route():
    data = request.json
    graph = data.get('graph')
    start = data.get('start')
    result = dfs(graph, start)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)


from flask import Flask, request, jsonify
from collections import deque

app = Flask(__name__)

# Função de busca em largura (BFS)
def bfs(graph, start):
    visited = set()
    queue = deque([start])
    result = []

    while queue:
        vertex = queue.popleft()
        if vertex not in visited:
            visited.add(vertex)
            result.append(vertex)
            queue.extend(neighbor for neighbor in graph.get(vertex, []) if neighbor not in visited)
    return result

# Função de busca em profundidade (DFS)
def dfs(graph, start):
    visited = set()
    result = []

    def _dfs(vertex):
        if vertex not in visited:
            visited.add(vertex)
            result.append(vertex)
            for neighbor in graph.get(vertex, []):
                _dfs(neighbor)

    _dfs(start)
    return result

@app.route('/bfs', methods=['POST'])
def bfs_route():
    data = request.json
    graph = data.get('graph')
    start = data.get('start')
    result = bfs(graph, start)
    return jsonify(result)

@app.route('/dfs', methods=['POST'])
def dfs_route():
    data = request.json
    graph = data.get('graph')
    start = data.get('start')
    result = dfs(graph, start)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)


from flask import Flask, request, jsonify
from collections import deque

app = Flask(__name__)

# Função de busca em largura (BFS)
def bfs(graph, start):
    visited = set()
    queue = deque([start])
    result = []

    while queue:
        vertex = queue.popleft()
        if vertex not in visited:
            visited.add(vertex)
            result.append(vertex)
            queue.extend(neighbor for neighbor in graph.get(vertex, []) if neighbor not in visited)
    return result

# Função de busca em profundidade (DFS)
def dfs(graph, start):
    visited = set()
    result = []

    def _dfs(vertex):
        if vertex not in visited:
            visited.add(vertex)
            result.append(vertex)
            for neighbor in graph.get(vertex, []):
                _dfs(neighbor)

    _dfs(start)
    return result

@app.route('/bfs', methods=['POST'])
def bfs_route():
    data = request.json
    graph = data.get('graph')
    start = data.get('start')
    result = bfs(graph, start)
    return jsonify(result)

@app.route('/dfs', methods=['POST'])
def dfs_route():
    data = request.json
    graph = data.get('graph')
    start = data.get('start')
    result = dfs(graph, start)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
