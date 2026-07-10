# MMSU Knowledge Hub

MMSU Knowledge Hub is a unified, mobile-first academic information portal and advising assistant designed to serve the Mariano Marcos State University community. 

Inspired by the DOST SOLIDO dashboard design, this system bridges the information gaps of the fragmented multi-campus ecosystem by integrating graph-theoretic academic pathfinding, local offline-capable policy retrieval, and secure multi-campus database synchronization.

---

## 📂 Project Architecture & Directory Structure

This folder contains the initial codebase blueprints, database designs, and local document replicas for the thesis project.

```text
MMSU_KnowledgeHub/
├── README.md               # Project overview and architecture details
├── data/
│   ├── mmsu_handbook.md    # Local Student Handbook Markdown replica
│   ├── database_schema.sql # Relational schemas for Batac, Laoag, and Currimao nodes
│   └── curriculum/
│       ├── bscs_curriculum.json  # Graph definition of the BSCS curriculum (DAG structure)
│       └── custom_paths/
└── backend/                # Processing engine (Pathfinding, local embeddings, and sync coordinator)
└── frontend/               # Mobile-first unified UI (Inspired by SOLIDO dashboard)
```

---

## 🛠️ Core Systems & Computer Science Components

### 1. Curriculum Pathfinder (Graph Theory)
*   **Mathematical Model:** The student curriculum is modeled as a **Directed Acyclic Graph (DAG)**:
    $$G = (V, E)$$
    where:
    *   $V$ (Vertices) = Academic courses (e.g., `CS 101`, `CS 102`).
    *   $E$ (Edges) = Prerequisite relationships (a directed arrow from `CS 101` $\rightarrow$ `CS 102` indicates `CS 101` is a prerequisite).
*   **Cycle Detection:** Depth-First Search (DFS) or Tarjan's strongly connected components algorithm is used to mathematically prove that no prerequisite cycles exist (preventing gridlocks where A requires B, and B requires A).
*   **Recalculation Algorithm:** If a student fails a course or a course is not offered, the pathfinding engine executes a topological sort to identify downstream dependencies and applies **Dijkstra's / A* pathfinding** to dynamically compute a customized, optimal alternative semester-by-semester path to graduation.

### 2. Local Student Handbook Assistant (NLP & Vector Search)
*   **Document Database:** A local Markdown replica of the official Student Handbook is saved under `data/mmsu_handbook.md`.
*   **Text Chunking & Tokenization:** The text parser splits the handbook into structural paragraphs (chunks) paired with metadata (Article, Section, Page number).
*   **Embedding Pipeline:** An offline embedding engine (using the `all-MiniLM-L6-v2` transformer model) runs locally, converting each text chunk into a 384-dimensional vector.
*   **Vector Search & Citation:** Student queries are run through the same embedding model, and a cosine-similarity search against the HNSW index locates the top matching paragraphs. The chatbot outputs the answer alongside exact citations (e.g., *"Source: Student Handbook Section 4.2"*), completely eliminating LLM hallucinations.

### 3. Multi-Campus Data Sync Engine (Distributed Databases)
*   **Topology:** Master-to-Master or Hub-and-Spoke replication connecting local SQL database nodes in **Batac**, **Laoag**, and **Currimao** campuses.
*   **Delta Syncing:** To preserve bandwidth, nodes only synchronize changes (deltas) logged since the last successful sync timestamp.
*   **Conflict Resolution:** Relies on deterministic conflict resolution algorithms (combining Vector Timestamps and priority rules) to resolve data collisions (e.g., matching room reassignments or grade modifications across campuses) without administrative intervention.
