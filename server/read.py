import ast
import sys


def ler_grafo(filepath: str, nao_direcionado: bool):
    # Abrir o arquivo com a opção encoding='utf-8-sig' para remover o BOM
    with open(filepath, 'r', encoding='utf-8-sig') as grafo:
        print(f"Arquivo lido: {filepath}")

        # Ler número de vértices e arestas
        try:
            v, a = map(int, grafo.readline().split())
            print(f"Número de vértices: {v}, Número de arestas: {a}")
        except ValueError as e:
            print(f"Erro ao ler o número de vértices ou arestas: {e}")
            sys.exit(1)

        # Ler a informação sobre se o grafo é direcionado ou não
        direcao = grafo.readline().strip()
        print(f"Direção do grafo: {direcao}")
        if direcao != "nao_direcionado":
            nao_direcionado = False
        print(f"Grafo não direcionado: {nao_direcionado}")

        # Inicializar o dicionário de arestas
        arestas = {i: [] for i in range(v)}

        # Ler as arestas
        for _ in range(a):
            try:
                id, v1, v2, p = map(int, grafo.readline().split())
                arestas[v1].append((id, v2, p))
                if nao_direcionado:
                    arestas[v2].append((id, v1, p))
            except ValueError as e:
                print(f"Erro ao ler uma aresta: {e}")
                sys.exit(1)

        print("Arestas do grafo:")
        print(arestas)

    return list(arestas.keys()), arestas, nao_direcionado


if __name__ == '__main__':
    vertices, arestas, nao_direcionado = ler_grafo()
    print(vertices, arestas, nao_direcionado)