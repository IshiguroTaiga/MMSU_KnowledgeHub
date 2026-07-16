# Outline of the Research Plan

## Research Title
**MMSU Knowledge Hub**: An Integrated Multi-Campus Academic Information System with Graph-Theoretic Pathfinding and Semantic Policy Retrieval

---

## Problem Statement
While Mariano Marcos State University (MMSU) maintains an official website, a student portal, the MMSU Virtual Learning Environment (MVLE), and other digital platforms, there is no dedicated website/system that consolidates and redirects users to all the university's scattered online resources, department pages, and social media announcements. Currently, vital student guides, college-specific portals, and academic advisories are scattered across disjointed sites and various Facebook pages or messenger group chats. Because there is no single directory or launchpad to index and redirect students to these separate digital nodes, students face severe information fragmentation. They must navigate multiple independent platforms just to retrieve basic academic information, leading to search delays, missed announcements, and confusion.

---

## Objective
To develop a mobile-responsive, unified academic portal that:
1. Centralizes university resources into a single access point (inspired by the DOST SOLIDO Knowledge Hub).
2. Models curriculum paths as Directed Acyclic Graphs (DAGs) to support topological pathfinding, cycle detection, and prerequisite validation.
3. Hosts an offline-capable Retrieval-Augmented Generation (RAG) chatbot for semantic policy queries.
4. Automates event aggregation from official social channels into a unified, categorized feed.

---

## Methodology
The research and development will follow a systematic software engineering and computational approach:

1. **Requirements Gathering & Data Modeling**:
   Collect and digitize academic curricula (specifically BS Computer Science), department contact details, official resource links, and the MMSU Student Handbook. Translate these resources into structured Markdown and JSON formats.

2. **Graph-Theoretic Curricular Modeling**:
   Represent multi-campus curricula as Directed Acyclic Graphs (DAGs) where courses are vertices ($V$) and prerequisites are directed edges ($E$).
   * **Cycle Detection**: Implement Depth-First Search (DFS) / Tarjan's algorithm to detect and reject cycles in the prerequisite tree, ensuring a valid DAG structure.
   * **Topological Sorting**: Order courses based on prerequisite dependencies to compute logical semester-by-semester tracks.
   * **Pathfinding & Recalculation**: Implement pathfinding algorithms (such as Dijkstra's or $A^*$) to dynamically calculate alternative graduation roadmaps for irregular, transferee, or returning students.

3. **Natural Language Processing & Semantic Retrieval**:
   * **Handbook Chunking**: Segment the handbook document into paragraphs mapped to metadata (Article, Section, Page number).
   * **Semantic Search Engine**: Build a local, lightweight vector database and lookup engine using TF-IDF Vectorization or client-side embeddings paired with Cosine Similarity, ensuring the chatbot can retrieve precise answers with exact handbook citations to avoid hallucinations.

4. **Distributed Database & Campus Synchronization**:
   * **Local Database Nodes**: Create relational schemas using SQLite for independent campus installations (Batac, Laoag, Currimao) to allow offline-first performance.
   * **Delta Synchronization**: Program a Sync Coordinator (Node.js/Express) that syncs only modified database records using timestamp-based changes.
   * **Conflict Resolution**: Implement deterministic conflict resolution algorithms (combining Vector Timestamps and Priority Rules) to handle data collisions.

5. **Unified Dashboard & Interface Development**:
   Develop a responsive, mobile-first Web Application using React (v19) and Vite (v8), styled with clean custom CSS, integrating the launcher, graph visualizer, and chatbot UI.

6. **Testing and Evaluation**:
   Verify loop detection accuracy, measure database delta synchronization latencies, and check cosine similarity matches on a variety of policy queries.

---

## Tools and Technologies
* **Frontend**: React (v19), Vite (v8), Vanilla CSS (designed for mobile responsiveness and premium aesthetics)
* **Backend**: Node.js, Express (REST API gateway, delta synchronization controller)
* **Database**: SQLite (managed locally via `sqlite3` for local campus replication and offline-first usage)
* **Algorithms & Logic**: Custom Graph Pathfinder (DFS, Topological Sort, Dijkstra's / A*), Custom NLP Search Engine (TF-IDF Vectorization, Cosine Similarity matching)
* **DevOps & Infrastructure**: Docker, Docker Compose (for containerized campus deployments), Git, Nodemailer (for notification workflows)

---

## Timeline
| Phase | Duration | Details |
| :--- | :---: | :--- |
| **Literature Review** | 2 weeks | Examining existing academic launchers, pathfinding algorithms, and client-side RAG implementations. |
| **Data Collection** | 3 weeks | Gathering official MMSU curriculum data, student handbooks, and resource links. |
| **Model Development** | 4 weeks | Building the graph pathfinder (cycle validation and topological sort) and TF-IDF search index. |
| **Model Evaluation** | 2 weeks | Testing pathfinding recalculation, SQLite database syncing, and vector search retrieval accuracy. |
| **Documentation** | 3 weeks | Drafting the capstone/thesis manuscript and preparing defense presentation materials. |

---

## Expected Output
1. **Progressive Web Application (PWA)**: A mobile-responsive academic hub featuring a high-fidelity layout inspired by the DOST SOLIDO dashboard, serving as a unified launcher.
2. **Interactive Curriculum Pathfinder**: A graphical visualization interface enabling students to track progress, check prerequisites, and recalculate curriculum roadmaps.
3. **Local Policy Consulting Chatbot**: An offline-capable, similarity-search-based chatbot that queries the student handbook and prints responses with matching citations.
4. **Multi-Campus Database Synchronization Framework**: A distributed database synchronization engine connecting Batac, Laoag, and Currimao nodes.

---

## Expected Beneficiaries
* **Students**: Benefit from a centralized, mobile-responsive portal that makes academic pathways, handbooks, and schedules easily queryable and readable anywhere.
* **Academic Advisers & Department Chairs**: Reduced administrative overhead when evaluating prerequisite waivers or detailing semester plans for irregular or transferee students.
* **Campus Registrar & IT Departments**: A distributed database structure that minimizes bandwidth usage and prevents database locking during peak enrollment/grading periods.

---

## Aligned SDG
* **SDG 4: Quality Education** – Equipping students and advisers with centralized, accurate academic roadmaps and direct access to university policies, reducing academic barriers.
* **SDG 9: Industry, Innovation, and Infrastructure** – Introducing a decentralized, offline-resilient multi-campus database architecture and advanced graph-theoretic models to university information infrastructure.
