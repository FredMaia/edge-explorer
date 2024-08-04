import ast
import sys


def ler_grafo(filepath: str = './ler.txt', nao_direcionado: bool = True):
    grafo = open(filepath).read().split(';', 1)

    grafo_vertices = (grafo[0].strip().removeprefix('V = ').replace('{', '[').replace('}', ']'))

    try:
        grafo_vertices = list(ast.literal_eval(grafo_vertices))
    except:
        print('Formato do Arquivo está errado')
        sys.exit(1)

    grafo_arestas = (grafo[1].strip().removeprefix('A = ').replace('{', '[').replace('}', ']').removesuffix(';'))

    try:
        grafo_arestas = list(ast.literal_eval(grafo_arestas))
    except:
        print('Formato do Arquivo está errado')
        sys.exit(1)

    # Checa se todas arestas tem um vértice válido
    try:
        for aresta in grafo_arestas:
            if aresta[0] not in grafo_vertices or aresta[1] not in grafo_vertices:
                raise Exception
    except:
        print('Vértice de aresta não encontrado')
        sys.exit(1)

    if nao_direcionado:
        for aresta in grafo_arestas:
            if (aresta[1], aresta[0]) not in grafo_arestas:
                grafo_arestas.append((aresta[1], aresta[0]))

    return grafo_vertices, grafo_arestas


if __name__ == '__main__':
    arestas, vertices = ler_grafo()

    print(f'Arestas : {arestas}\nVertices : {vertices}')