import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
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
import { LongPressGestureHandler, State, GestureHandlerRootView } from "react-native-gesture-handler";

const { height, width } = Dimensions.get("window");

type Vertex = {
  x: number;
  y: number;
  id: number;
};

type Edge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
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

  const addVertex = (x: number, y: number) => {
    const newVertex: Vertex = {
      x,
      y,
      id: vertices.length + 1,
    };
    setVertices((prevVertices) => [...prevVertices, newVertex]);
  };

  const addEdge = (vertex1: Vertex, vertex2: Vertex) => {
    const newEdge: Edge = {
      x1: vertex1.x,
      y1: vertex1.y,
      x2: vertex2.x,
      y2: vertex2.y,
      directed: isDirected,
    };
    setEdges((prevEdges) => [...prevEdges, newEdge]);
    if (!isDirected) {
      setEdges((prevEdges) => [
        ...prevEdges,
        {
          x1: vertex2.x,
          y1: vertex2.y,
          x2: vertex1.x,
          y2: vertex1.y,
          directed: false,
        },
      ]);
    }
  };

  const handlePress = (event: GestureResponderEvent) => {
    const locationX = event.nativeEvent.locationX;
    const locationY = event.nativeEvent.locationY;

    const clickedVertex = vertices.find((vertex) => {
      const distance = Math.sqrt(
        (locationX - vertex.x) ** 2 + (locationY - vertex.y) ** 2
      );
      return distance < 20;
    });

    if (clickedVertex) {
      if (selectedVertex) {
        addEdge(selectedVertex, clickedVertex);
        setSelectedVertex(null);
      } else {
        setSelectedVertex(clickedVertex);
      }
    } else {
      addVertex(locationX, locationY);
      setSelectedVertex(null);
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
              <Line
                key={index}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={"black"}
                strokeWidth={2}
                markerEnd={edge.directed ? "url(#arrowhead)" : undefined}
              />
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
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
