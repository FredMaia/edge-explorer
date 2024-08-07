import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  GestureResponderEvent,
} from "react-native";
import {
  Svg,
  Circle,
  Line,
  Text as SvgText,
  Marker,
  Defs,
  Path,
} from "react-native-svg";
import {
  LongPressGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const { height, width } = Dimensions.get("window");

type Vertex = {
  x: number;
  y: number;
  id: number;
};

type Edge = {
  idAresta: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  destino: number;
  pesoAresta: number;
  directed: boolean;
};

export default function App() {
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [draggedVertexIndex, setDraggedVertexIndex] = useState<number | null>(
    null
  );
  const [selectedVertex, setSelectedVertex] = useState<Vertex | null>(null);
  const [visitedVertices, setVisitedVertices] = useState<number[]>([]);
  const [isDirected, setIsDirected] = useState<boolean>(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showEdgeModal, setShowEdgeModal] = useState<boolean>(false);

  const [edgeClicked, setEdgeClicked] = useState(false);
  const edgeClickedRef = useRef<boolean>(false);

  const [newWeight, setNewWeight] = useState<string>("");

  const addEdgeFromBackend = (
    idAresta: number,
    vertex1: Vertex,
    vertex2: Vertex,
    pesoAresta: number
  ) => {
    const newEdge: Edge = {
      idAresta,
      x1: vertex1.x,
      y1: vertex1.y,
      x2: vertex2.x,
      y2: vertex2.y,
      destino: vertex2.id,
      pesoAresta,
      directed: isDirected,
    };
    setEdges((prevEdges) => [...prevEdges, newEdge]);

    if (!isDirected) {
      setEdges((prevEdges) => [
        ...prevEdges,
        {
          idAresta,
          x1: vertex2.x,
          y1: vertex2.y,
          x2: vertex1.x,
          y2: vertex1.y,
          destino: vertex1.id,
          pesoAresta,
          directed: false,
        },
      ]);
    }
  };

  const showEdges = () => {
    return edges
      .map(
        (edge) =>
          `Aresta ID: ${edge.idAresta}\n` +
          `Origem: (${edge.x1}, ${edge.y1})\n` +
          `Destino: (${edge.x2}, ${edge.y2})\n` +
          `Peso: ${edge.pesoAresta}\n` +
          `Direcionado: ${edge.directed ? "Sim" : "Não"}\n`
      )
      .join("\n");
  };

  useEffect(() => {
    const graphData = {
      0: [0, 1, 1],
      1: [
        [0, 0, 1],
        [1, 2, 1],
        [2, 3, 1],
      ],
    };

    // Object.entries(graphData).forEach(([vertexKey, edges]) => {
    //   const vertex1 = vertices.find((v) => v.id === parseInt(vertexKey));
    //   if (vertex1) {
    //     edges.forEach(([idAresta, destino, pesoAresta]) => {
    //       const vertex2 = vertices.find((v) => v.id === destino);
    //       if (vertex2) {
    //         addEdgeFromBackend(idAresta, vertex1, vertex2, pesoAresta);
    //       }
    //     });
    //   }
    // });
    console.log(showEdges());
  }, [edges]);

  const addVertex = (x: number, y: number) => {
    const newVertex: Vertex = {
      x,
      y,
      id: vertices.length + 1,
    };
    setVertices((prevVertices) => [...prevVertices, newVertex]);
  };

  const addEdge = (vertex: Vertex) => {
    if (selectedVertex) {
      if (vertex.id !== selectedVertex.id) {
        const newEdge: Edge = {
          idAresta: edges.length, // ou um ID único, dependendo do seu sistema
          x1: selectedVertex.x,
          y1: selectedVertex.y,
          x2: vertex.x,
          y2: vertex.y,
          destino: vertex.id,
          pesoAresta: 1, // Defina o peso padrão ou ajuste conforme necessário
          directed: isDirected,
        };
        setEdges((prevEdges) => [...prevEdges, newEdge]);

        if (!isDirected) {
          setEdges((prevEdges) => [
            ...prevEdges,
            {
              idAresta: edges.length, // ID para a aresta invertida
              x1: vertex.x,
              y1: vertex.y,
              x2: selectedVertex.x,
              y2: selectedVertex.y,
              destino: selectedVertex.id,
              pesoAresta: 1,
              directed: false,
            },
          ]);
        }
      }
      setSelectedVertex(null); // Deseleciona o vértice após criar a aresta
    } else {
      setSelectedVertex(vertex); // Seleciona o vértice
    }
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (edgeClickedRef.current) {
      edgeClickedRef.current = false; // Reset após detectar clique na aresta
      console.log("edge po");
      return;
    } else {
      console.log("clicou fora");
    }

    const locationX = event.nativeEvent.locationX;
    const locationY = event.nativeEvent.locationY;

    const clickedVertex = vertices.find((vertex) => {
      const distance = Math.sqrt(
        (locationX - vertex.x) ** 2 + (locationY - vertex.y) ** 2
      );
      return distance < 20;
    });

    if (clickedVertex) {
      addEdge(clickedVertex); // Adiciona ou seleciona um vértice
    } else {
      addVertex(locationX, locationY); // Adiciona um novo vértice
      setSelectedVertex(null); // Deseleciona qualquer vértice previamente selecionado
    }
  };

  const handleEdgePress = (edgeId: number) => {
    edgeClickedRef.current = true;
    const edge = edges.find((e) => e.idAresta === edgeId);

    if (edge) {
      setSelectedEdge(edge);
      setShowEdgeModal(true);
    }
  };

  const onTouchMovePolygon = (event: GestureResponderEvent) => {
    if (draggedVertexIndex !== null) {
      const updatedVertices = [...vertices];
      updatedVertices[draggedVertexIndex] = {
        ...updatedVertices[draggedVertexIndex],
        x: event.nativeEvent.locationX,
        y: event.nativeEvent.locationY,
      };
      setVertices(updatedVertices);
      setEdges(
        edges.map((edge) => ({
          ...edge,
          x1:
            edge.x1 === vertices[draggedVertexIndex].x
              ? updatedVertices[draggedVertexIndex].x
              : edge.x1,
          y1:
            edge.y1 === vertices[draggedVertexIndex].y
              ? updatedVertices[draggedVertexIndex].y
              : edge.y1,
          x2:
            edge.x2 === vertices[draggedVertexIndex].x
              ? updatedVertices[draggedVertexIndex].x
              : edge.x2,
          y2:
            edge.y2 === vertices[draggedVertexIndex].y
              ? updatedVertices[draggedVertexIndex].y
              : edge.y2,
        }))
      );
    }
  };

  const deleteEdge = () => {
    if (selectedEdge) {
      console.log(`selected edge: ${JSON.stringify(selectedEdge)}`);
      setEdges(edges.filter((e) => e.idAresta !== selectedEdge.idAresta));
      setShowEdgeModal(false);
      setSelectedEdge(null);
    } else {
      console.log("Nenhum edge selecionado!");
    }
  };

  const updateEdgeWeight = (newWeight: number) => {
    console.log(`newWeight: ${newWeight}`);
    if (selectedEdge) {
      setEdges(
        edges.map((edge) =>
          edge.idAresta === selectedEdge.idAresta
            ? { ...edge, pesoAresta: newWeight }
            : edge
        )
      );
      setShowEdgeModal(false);
      setSelectedEdge(null);
    } else {
      console.log("nenhum edge selecionado");
    }
  };

  const onTouchEndPolygon = () => {
    setDraggedVertexIndex(null);
  };

  const getActiveVertex = (x: number, y: number) => {
    const threshold = 20;
    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      const distance = Math.sqrt((x - vertex.x) ** 2 + (y - vertex.y) ** 2);
      if (distance <= threshold) {
        return i;
      }
    }
    return null;
  };

  const handleReset = () => {
    setVertices([]);
    setEdges([]);
    setSelectedVertex(null);
    setDraggedVertexIndex(null);
    setVisitedVertices([]);
  };

  const dfs = async (startId: number) => {
    const stack = [startId];
    const visited = new Set<number>();

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (!visited.has(currentId)) {
        visited.add(currentId);
        setVisitedVertices(Array.from(visited));
        await new Promise((res) => setTimeout(res, 2000)); // 2 segundos

        const neighbors = edges
          .filter(
            (edge) =>
              edge.x1 === vertices[currentId - 1].x &&
              edge.y1 === vertices[currentId - 1].y
          )
          .map(
            (edge) =>
              vertices.find(
                (vertex) => vertex.x === edge.x2 && vertex.y === edge.y2
              )!.id
          );

        stack.push(...neighbors.filter((neighbor) => !visited.has(neighbor)));
      }
    }
  };

  const bfs = async (startId: number) => {
    const queue = [startId];
    const visited = new Set<number>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (!visited.has(currentId)) {
        visited.add(currentId);
        setVisitedVertices(Array.from(visited));
        await new Promise((res) => setTimeout(res, 2000)); // 2 segundos

        const neighbors = edges
          .filter(
            (edge) =>
              edge.x1 === vertices[currentId - 1].x &&
              edge.y1 === vertices[currentId - 1].y
          )
          .map(
            (edge) =>
              vertices.find(
                (vertex) => vertex.x === edge.x2 && vertex.y === edge.y2
              )!.id
          );

        queue.push(...neighbors.filter((neighbor) => !visited.has(neighbor)));
      }
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [vertexToDelete, setVertexToDelete] = useState<Vertex | null>(null);

  const handleLongPress = ({ nativeEvent }: any) => {
    const index = getActiveVertex(nativeEvent.x, nativeEvent.y);
    if (index !== null) {
      setVertexToDelete(vertices[index]);
      setShowDeleteModal(true);
    }
  };

  const deleteVertex = () => {
    if (vertexToDelete) {
      setVertices(vertices.filter((v) => v.id !== vertexToDelete.id));
      setEdges(
        edges.filter(
          (edge) =>
            edge.x1 !== vertexToDelete.x &&
            edge.y1 !== vertexToDelete.y &&
            edge.x2 !== vertexToDelete.x &&
            edge.y2 !== vertexToDelete.y
        )
      );
      setShowDeleteModal(false);
      setVertexToDelete(null);
    }
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, isDirected && styles.selectedOption]}
            onPress={() => setIsDirected(true)}
          >
            <Text style={styles.optionButtonText}>Directed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, !isDirected && styles.selectedOption]}
            onPress={() => setIsDirected(false)}
          >
            <Text style={styles.optionButtonText}>Undirected</Text>
          </TouchableOpacity>
        </View>
        <View
          style={styles.svgContainer}
          onTouchStart={(e) => {
            const index = getActiveVertex(
              e.nativeEvent.locationX,
              e.nativeEvent.locationY
            );
            if (index !== null) setDraggedVertexIndex(index);
          }}
          onTouchMove={onTouchMovePolygon}
          onTouchEnd={onTouchEndPolygon}
          onTouchEndCapture={handlePress}
        >
          <Svg height={height * 0.7} width={width}>
            {edges.map((edge, index) => (
              <React.Fragment key={index}>
                <Line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  onPress={() => handleEdgePress(edge.idAresta)}
                  strokeWidth={20}
                />
                <Line
                  key={edge.idAresta}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke={"black"}
                  strokeWidth={8}
                  onPress={() => handleEdgePress(edge.idAresta)}
                  markerEnd={edge.directed ? "url(#arrowhead)" : undefined}
                />
                <SvgText
                  x={(edge.x1 + edge.x2) / 2}
                  y={(edge.y1 + edge.y2 - 20) / 2}
                  fontSize="20"
                  fill="black"
                  textAnchor="middle"
                >
                  {edge.pesoAresta}
                </SvgText>
              </React.Fragment>
            ))}

            {vertices.map((vertex, index) => (
              <LongPressGestureHandler
                key={index}
                onHandlerStateChange={(event) => {
                  if (event.nativeEvent.state === State.ACTIVE) {
                    handleLongPress(event);
                  }
                }}
                minDurationMs={800}
              >
                <Svg>
                  <Circle
                    cx={vertex.x}
                    cy={vertex.y}
                    r={25}
                    fill={
                      visitedVertices.includes(vertex.id)
                        ? "green"
                        : selectedVertex?.id === vertex.id
                        ? "blue"
                        : "#000080"
                    }
                  />
                  <SvgText
                    x={vertex.x}
                    y={vertex.y + 5}
                    fontSize="20"
                    fill="white"
                    textAnchor="middle"
                  >
                    {vertex.id}
                  </SvgText>
                </Svg>
              </LongPressGestureHandler>
            ))}

            {isDirected && (
              <Defs>
                <Marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="0"
                  refY="3"
                  orient="auto"
                >
                  <Path d="M 0,0 L 10,3 L 0,6 L 3,3 Z" />
                </Marker>
              </Defs>
            )}
          </Svg>
        </View>
        {showEdgeModal && (
          <Modal transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  onPress={() => setShowEdgeModal(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
                <Text>Editar Aresta</Text>
                <TextInput
                  value={newWeight}
                  onChangeText={(text) => setNewWeight(text)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="Novo peso"
                />
                <View
                  style={{
                    flexDirection: "row",
                    gap: 20,
                    justifyContent: "space-around",
                    marginTop: 30
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      const weight = parseFloat(newWeight);
                      if (!isNaN(weight)) {
                        updateEdgeWeight(weight);
                      } else {
                        alert("Por favor, insira um número válido.");
                      }
                    }}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.editButtonText}>Alterar Peso</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={deleteEdge}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
        {showDeleteModal && (
          <Modal transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text>Excluir o vértice {vertexToDelete?.id}?</Text>
                <TouchableOpacity
                  onPress={deleteVertex}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleReset}>
            <Text style={styles.clearButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={() => dfs(1)}>
            <Text style={styles.clearButtonText}>DFS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={() => bfs(1)}>
            <Text style={styles.clearButtonText}>BFS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  optionButton: {
    marginHorizontal: 10,
    backgroundColor: "gray",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: "black",
  },
  optionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  svgContainer: {
    height: height * 0.7,
    width,
    borderColor: "black",
    backgroundColor: "white",
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  clearButton: {
    marginHorizontal: 10,
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300, // Aumenta a largura do modal
    padding: 40,
    backgroundColor: "#ffffff", // Fundo branco
    borderRadius: 10, // Bordas arredondadas
    shadowColor: "#000", // Sombra
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "#6c757d", //
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    marginTop: 10,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#000",
  },
});
