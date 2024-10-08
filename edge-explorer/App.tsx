import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
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

import * as DocumentPicker from "expo-document-picker";

import axios from "axios";

const { height, width } = Dimensions.get("window");

interface FileInfo {
  uri: string;
  name: string;
  type: string;
}

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
  origem: number;
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
  const [visitedEdges, setVisitedEdges] = useState<number[]>([]);
  const [isDirected, setIsDirected] = useState<boolean>(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showEdgeModal, setShowEdgeModal] = useState<boolean>(false);

  const edgeClickedRef = useRef<boolean>(false);

  const [newWeight, setNewWeight] = useState<string>("");
  const [idEdge, setIdEdge] = useState<number>(0);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showAlgorithmsModal, setShowAlgorithmsModal] =
    useState<boolean>(false);
  const [vertexToDelete, setVertexToDelete] = useState<Vertex | null>(null);
  const [file, setFile] = useState<FileInfo | null>(null);

  const showEdges = () => {
    return edges
      .map(
        (edge) =>
          `Aresta ID: ${edge.idAresta}\n` +
          `Origem: (${edge.x1}, ${edge.origem})\n` +
          `Destino: (${edge.x2}, ${edge.destino})\n` +
          `Peso: ${edge.pesoAresta}\n` +
          `Direcionado: ${edge.directed ? "Sim" : "Não"}\n`
      )
      .join("\n");
  };

  useEffect(() => {
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
          idAresta: idEdge,
          x1: selectedVertex.x,
          y1: selectedVertex.y,
          x2: vertex.x,
          y2: vertex.y,
          destino: vertex.id,
          origem: selectedVertex.id,
          pesoAresta: 1,
          directed: isDirected,
        };

        setEdges((prevEdges) => [...prevEdges, newEdge]);

        if (!isDirected) {
          setEdges((prevEdges) => [
            ...prevEdges,
            {
              idAresta: idEdge,
              x1: vertex.x,
              y1: vertex.y,
              x2: selectedVertex.x,
              y2: selectedVertex.y,
              destino: selectedVertex.id,
              origem: vertex.id,
              pesoAresta: 1,
              directed: false,
            },
          ]);
        }

        setIdEdge(idEdge + 1);
      }
      setSelectedVertex(null); 
    } else {
      setSelectedVertex(vertex); 
    }
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (edgeClickedRef.current) {
      edgeClickedRef.current = false; 
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
      addEdge(clickedVertex);
    } else {
      addVertex(locationX, locationY);
      setSelectedVertex(null);
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
      setEdges(edges.filter((e) => e.idAresta !== selectedEdge.idAresta));
      setShowEdgeModal(false);
      setSelectedEdge(null);
    } else {
      console.log("Nenhum edge selecionado!");
    }
  };

  const updateEdgeWeight = (newWeight: number) => {
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

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "text/plain",
      });

      console.log(res.canceled);
      if (!res.canceled) {
        const { uri, name, mimeType } = res.assets[0];
        console.log(uri);
        setFile({
          uri,
          name,
          type: mimeType || "text/plain",
        });
      }
    } catch (err) {
      console.log("Error picking file:", err);
    }
  };

  const uploadFile = async () => {
    if (file) {
      try {
        const formData = new FormData();

        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as unknown as Blob);

        formData.append("width", width.toString());
        formData.append("height", height.toString());

        const res = await axios.post(
          "http://192.168.15.7:5000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );


        setVertices(res.data.vertices);
        setEdges(res.data.edges);

        console.log(res.data);
      } catch (err) {
        console.log("Error uploading file:", err);
      }
    }
  };

  // Algoritmos
  const bipartiteCheck = async () => {
    Alert.alert("bipartiteCheck");
    try {
      const grafo = edges.reduce<{ [key: number]: [number, number, number][] }>(
        (acc, edge) => {
          if (!acc[edge.origem]) acc[edge.origem] = [];
          acc[edge.origem].push([edge.idAresta, edge.destino, edge.pesoAresta]);
          return acc;
        },
        {}
      );

      const response = await axios.post(
        "http://192.168.15.7:5000/bipartido",
        {
          Grafo: grafo,
          nao_direcionado: !isDirected,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const resultado = response.data.resultado;
      Alert.alert(`É bipartido: ${resultado}`);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const cycleCheck = async () => {
    Alert.alert("cycleCheck");
    try {
      const grafo = edges.reduce<{ [key: number]: [number, number, number][] }>(
        (acc, edge) => {
          if (!acc[edge.origem]) acc[edge.origem] = [];
          acc[edge.origem].push([edge.idAresta, edge.destino, edge.pesoAresta]);
          return acc;
        },
        {}
      );

      const response = await axios.post(
        "http://192.168.15.7:5000/ciclo",
        {
          Grafo: grafo,
          nao_direcionado: !isDirected,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("BFS Order:", response.data.resultado);
      const resultado = response.data.resultado;
      Alert.alert(`Possui ciclo: ${resultado}`);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const connectedComponents = async () => {
    Alert.alert("connectedComponents");
    try {
      const grafo = edges.reduce<{ [key: number]: [number, number, number][] }>(
        (acc, edge) => {
          if (!acc[edge.origem]) acc[edge.origem] = [];
          acc[edge.origem].push([edge.idAresta, edge.destino, edge.pesoAresta]);
          return acc;
        },
        {}
      );

      const response = await axios.post(
        "http://192.168.15.7:5000/componentes_conexos",
        {
          Grafo: grafo,
          nao_direcionado: !isDirected,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const resultado = response.data.resultado;
      Alert.alert(`There's ${resultado} connected components.`);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const stronglyConnectedComponents = async () => {
    Alert.alert("stronglyConnectedComponents");
    try {
      const grafo = edges.reduce<{ [key: number]: [number, number, number][] }>(
        (acc, edge) => {
          if (!acc[edge.origem]) acc[edge.origem] = [];
          acc[edge.origem].push([edge.idAresta, edge.destino, edge.pesoAresta]);
          return acc;
        },
        {}
      );

      const response = await axios.post(
        "http://192.168.15.7:5000/componentes_fortes",
        {
          Grafo: grafo,
          nao_direcionado: !isDirected,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const resultado = response.data.resultado;
      Alert.alert(`There's ${resultado} strongly connected components.`);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const articulationPoints = async () => {
    Alert.alert("articulationPoints");
    try {
      const grafo = edges.reduce<{ [key: number]: [number, number, number][] }>(
        (acc, edge) => {
          if (!acc[edge.origem]) acc[edge.origem] = [];
          acc[edge.origem].push([edge.idAresta, edge.destino, edge.pesoAresta]);
          return acc;
        },
        {}
      );

      const response = await axios.post(
        "http://192.168.15.7:5000/pontos_articulacao",
        {
          Grafo: grafo,
          nao_direcionado: !isDirected,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const resultado = response.data.resultado;
      Alert.alert(`Articulation points: ${resultado}.`);
      setVisitedVertices(resultado);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const bridgesCount = async () => {
    try {
      const grafo = edges.reduce<{ [key: number]: [number, number, number][] }>(
        (acc, edge) => {
          if (!acc[edge.origem]) acc[edge.origem] = [];
          acc[edge.origem].push([edge.idAresta, edge.destino, edge.pesoAresta]);
          return acc;
        },
        {}
      );

      const response = await axios.post(
        "http://192.168.15.7:5000/arestas_ponte",
        {
          Grafo: grafo,
          nao_direcionado: !isDirected,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const resultado = response.data.resultado;
      Alert.alert(`Arestas ponte: ${resultado}`);
      setVisitedEdges(resultado);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const dfs = async (startId: number) => {
    console.log("clicou no bfs");
    try {
      const grafo = edges.reduce<{ [key: number]: [number, number, number][] }>(
        (acc, edge) => {
          if (!acc[edge.origem]) acc[edge.origem] = [];
          acc[edge.origem].push([edge.idAresta, edge.destino, edge.pesoAresta]);
          return acc;
        },
        {}
      );

      const response = await axios.post(
        "http://192.168.15.7:5000/dfs",
        {
          Grafo: grafo,
          start_node: startId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("BFS Order:", response.data.bfs_order);
      const bfsOrder = response.data.bfs_order;
      Alert.alert(`Dfs order: ${bfsOrder}`);

      bfsOrder.forEach((vertexId: number, index: number) => {
        setTimeout(() => {
          setVisitedVertices((prev) => [...prev, vertexId]);
        }, index * 2000);
      });
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const bfs = async (startId: number) => {
    console.log("clicou no bfs");
    try {
      console.log("edgessss");
      console.log(edges);
      console.log("edgessss");
      const grafo = edges.reduce<{ [key: number]: [number, number, number][] }>(
        (acc, edge) => {
          if (!acc[edge.origem]) acc[edge.origem] = [];
          acc[edge.origem].push([edge.idAresta, edge.destino, edge.pesoAresta]);
          return acc;
        },
        {}
      );

      const response = await axios.post(
        "http://192.168.15.7:5000/bfs",
        {
          Grafo: grafo,
          start_node: startId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("BFS Order:", response.data.bfs_order);
      const bfsOrder = response.data.bfs_order;
      Alert.alert(`Bfs order: ${bfsOrder}`);

      bfsOrder.forEach((vertexId: number, index: number) => {
        setTimeout(() => {
          setVisitedVertices((prev) => [...prev, vertexId]);
        }, index * 2000);
      });
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const minimumSpanningTree = async () => {
    try {
      const grafo = edges.reduce<{ [key: number]: [number, number, number][] }>(
        (acc, edge) => {
          if (!acc[edge.origem]) acc[edge.origem] = [];
          acc[edge.origem].push([edge.idAresta, edge.destino, edge.pesoAresta]);
          return acc;
        },
        {}
      );

      const response = await axios.post(
        "http://192.168.15.7:5000/arvore_geradora_minima",
        {
          Grafo: grafo,
          nao_direcionado: !isDirected,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const resultado = response.data.resultado;
      Alert.alert(`Min tree: ${resultado}.`);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const topologicalSort = () => {
    Alert.alert("topologicalSort");
    // Implement topological sort
  };

  const shortestPath = () => {
    Alert.alert("shortestPath");
    // Implement shortest path calculation
  };

  const maxFlow = () => {
    Alert.alert("maxFlow");
    // Implement max flow calculation
  };

  const transitiveClosure = () => {
    Alert.alert("transitiveClosure");
    // Implement transitive closure
  };

  const conexidade = async () => {
    Alert.alert("conexidade");
    const grafo = edges.reduce<{ [key: number]: [number, number, number][] }>(
      (acc, edge) => {
        if (!acc[edge.origem]) acc[edge.origem] = [];
        acc[edge.origem].push([edge.idAresta, edge.destino, edge.pesoAresta]);
        return acc;
      },
      {}
    );

    const response = await axios.post(
      "http://192.168.15.7:5000/conexo",
      {
        Grafo: grafo,
        nao_direcionado: isDirected,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.resultado) {
      console.log("É conexo");
      Alert.alert("É conexo");
    } else {
      console.log("Não é conexo");
      Alert.alert("Não é conexo");
    }
  };

  const euleriano = async () => {
    const grafo = edges.reduce<{ [key: number]: [number, number, number][] }>(
      (acc, edge) => {
        if (!acc[edge.origem]) acc[edge.origem] = [];
        acc[edge.origem].push([edge.idAresta, edge.destino, edge.pesoAresta]);
        return acc;
      },
      {}
    );
    const response = await axios.post(
      "http://192.168.15.7:5000/euleriano",
      {
        Grafo: grafo,
        nao_direcionado: !isDirected,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.resultado) {
      console.log("É euleriano");
      Alert.alert("É euleriano");
    } else {
      console.log("Não é euleriano");
      Alert.alert("Não é euleriano");
    }
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setShowAlgorithmsModal(!showAlgorithmsModal)}
          >
            <Text style={styles.clearButtonText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={handleReset}>
            <Text style={styles.clearButtonText}>Reset</Text>
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
                  stroke={
                    visitedEdges.includes(edge.idAresta) ? "green" : "black"
                  }
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
                  {edge.pesoAresta}, {edge.idAresta}
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
                    marginTop: 30,
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
      </View>
      {showAlgorithmsModal && (
        <Modal transparent={true} animationType="fade">
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, isDirected && styles.selectedOption]}
              onPress={() => setIsDirected(true)}
            >
              <Text style={styles.optionButtonText}>Direcionado</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                !isDirected && styles.selectedOption,
              ]}
              onPress={() => setIsDirected(false)}
            >
              <Text style={styles.optionButtonText}>Não direcionado</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContainer}>
            <View
              style={{
                width: "90%",
                padding: 40,
                backgroundColor: "#ffffff", // Fundo branco
                borderRadius: 10, // Bordas arredondadas
                shadowColor: "#000", // Sombra
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              {/* Botão para fechar o modal */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAlgorithmsModal(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <View>
                <Text style={{ textAlign: "center", fontWeight: "bold" }}>
                  Graphs algorithms
                </Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => bfs(1)}
                >
                  <Text style={styles.clearButtonText}>BFS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => dfs(1)}
                >
                  <Text style={styles.clearButtonText}>DFS</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={conexidade}
                >
                  <Text style={styles.clearButtonText}>Connectivity</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={bipartiteCheck}
                >
                  <Text style={styles.clearButtonText}>
                    Check Bipartiteness
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={cycleCheck}
                >
                  <Text style={styles.clearButtonText}>Check Cycles</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={connectedComponents}
                >
                  <Text style={styles.clearButtonText}>
                    Connected Components
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={stronglyConnectedComponents}
                >
                  <Text style={styles.clearButtonText}>
                    Strongly Connected Components
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={articulationPoints}
                >
                  <Text style={styles.clearButtonText}>
                    Articulation Points
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={bridgesCount}
                >
                  <Text style={styles.clearButtonText}>Bridge Edges</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={topologicalSort}
                >
                  <Text style={styles.clearButtonText}>Topological Sort</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={shortestPath}
                >
                  <Text style={styles.clearButtonText}>Shortest Path</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearButton} onPress={maxFlow}>
                  <Text style={styles.clearButtonText}>Max Flow</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={transitiveClosure}
                >
                  <Text style={styles.clearButtonText}>Transitive Closure</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={euleriano}
                >
                  <Text style={styles.clearButtonText}>Eulerian</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={minimumSpanningTree}
                >
                  <Text style={styles.clearButtonText}>Min tree</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.clearButton} onPress={pickFile}>
                  <Text style={styles.clearButtonText}>pickFile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={uploadFile}
                >
                  <Text style={styles.clearButtonText}>uploadFile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    justifyContent: "center",
    marginTop: 10,
  },
  clearButton: {
    marginHorizontal: "1%",
    backgroundColor: "black",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: "60%",
    borderRadius: 5,
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
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
