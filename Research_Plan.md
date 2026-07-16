# Outline of the Research Plan

## Research Title
**MMSU Knowledge Hub**: An Integrated Multi-Campus Academic Information System with Graph-Theoretic Pathfinding and Semantic Policy Retrieval

### Group Members
*   **Bagasani, Nythan**
*   **Bonifacio, Johnas Nathaniel**
*   **Permison, Micko Gabriel**
*   **Udani, Bryan Leo**

---

## Problem Statement
While the official Mariano Marcos State University (MMSU) website serves as a public-facing general information portal, it is not designed to support specialized, interactive, academic planning, advising, and distributed database utilities. Yes we have students portal and mvle but they lack the specialized functionality required for complex academic planning. Furthermore, searching for specific university regulations requires manually navigating dense, monolithic handbook documents due to the lack of a semantic search retrieval system.

---

## Objective
To develop a mobile-responsive, unified academic advising assistant and planning portal (inspired by the DOST SOLIDO Knowledge Hub design) that centralizes university resources and addresses multi-campus information fragmentation. The specific objectives are:
1.  **Graph-Theoretic Curricular Modeling**: Represent multi-campus curricula as Directed Acyclic Graphs (DAGs) to enable cycle detection (preventing prerequisite loop deadlocks) and dynamically calculate optimal, alternative paths to graduation for irregular, transferee, or returning students.
2.  **Semantic Student Handbook Policy Retrieval**: Host a local, offline-capable Retrieval-Augmented Generation (RAG) search engine utilizing vector embeddings and cosine similarity to answer student policy queries with precise text chunk citations.
3.  **Multi-Campus Database Synchronization**: Implement a secure, distributed database syncing engine that connects Batac, Laoag, and Currimao campus nodes to coordinate updates (e.g., student records, schedules) via timestamp-based delta syncing and conflict resolution.
4.  **Social Channel Event Aggregation**: Automate the aggregation and categorization of academic updates, notices, and events from social media channels into a single, clean notification feed.

---

## Methodology
The research and development will follow a systematic software engineering and computational approach:

1.  **Requirements Analysis & Curriculum Mapping**:
    Collect academic curricula (specifically BS Computer Science) from different MMSU campuses. Model these curricula as Directed Acyclic Graphs (DAGs) where courses represent vertices ($V$) and prerequisites represent directed edges ($E$).
2.  **Graph Engine & Recalculation Algorithm Development**:
    *   Implement **Depth-First Search (DFS) / Tarjan's Algorithm** to detect and reject any cycles in the prerequisite tree, ensuring a valid DAG.
    *   Design a **Topological Sorting** pipeline that calculates prerequisite dependencies.
    *   Implement a recalculation algorithm (utilizing topological paths and **Dijkstra's / A\* pathfinding**) to dynamically suggest alternative paths to graduation for students who fail, skip, or transfer out of specific courses.
3.  **Handbook Parsing & Retrieval Engine Implementation**:
    *   Convert the official MMSU Student Handbook into a structured, chunk-based Markdown document.
    *   Build a local, lightweight text chunker and search engine using **TF-IDF (Term Frequency-Inverse Document Frequency) Vectorization** and **Cosine Similarity** to match natural language queries against handbook clauses.
    *   Program the engine to output answers alongside direct section citations, minimizing semantic search hallucinations.
4.  **Distributed Database Design & Sync Setup**:
    *   Create local relational schemas using **SQLite** to represent individual campus nodes (Batac, Laoag, Currimao).
    *   Develop a **Sync Coordinator** using Node.js/Express that runs delta synchronization (syncing only modified records based on timestamps) and resolves master-master database conflicts using vector timestamps.
5.  **Frontend Dashboard Integration**:
    *   Develop a responsive, mobile-first Web Application using **React (v19)** and **Vite (v8)**, styled with clean custom CSS.
    *   Integrate interactive graph visualizations for curriculum pathfinding and a messaging UI for the handbook bot.
6.  **Testing, Evaluation & Deployment**:
    *   Verify DAG cycle detection accuracy.
    *   Perform load tests on database delta-syncing.
    *   Deploy the application using **Docker** and **Docker Compose** to guarantee multi-platform environment consistency.

---

## Tools and Technologies
*   **Frontend**: React (v19), Vite (v8), Vanilla CSS (styled for mobile-responsiveness and premium aesthetics)
*   **Backend**: Node.js, Express (REST API gateway, delta synchronization controller)
*   **Database**: SQLite (managed locally via `sqlite3` for local campus replication and offline-first usage)
*   **Algorithms & Logic**: Custom Graph Pathfinder (DFS, Topological Sort), Custom TF-IDF Search Engine
*   **DevOps & Tools**: Docker, Docker Compose, Git, Nodemailer (for notification and user management workflows)

---

## Timeline

| Phase | Duration | Details |
| :--- | :---: | :--- |
| **1. Literature Review & Proposal Drafting** | 2 weeks | Analyzing existing academic pathfinders and local RAG search implementations; structuring the research proposal. |
| **2. Requirements Gathering & Data Modeling** | 3 weeks | Collecting official MMSU curriculum data and translating the Student Handbook into structured JSON/Markdown formats. |
| **3. Core Algorithmic Development** | 4 weeks | Writing the graph pathfinder (cycle validation and topological sort) and RAG indexing (TF-IDF model). |
| **4. Database Design & Campus Sync Implementation** | 3 weeks | Creating SQLite schemas and engineering the master-master delta synchronization API endpoints. |
| **5. Frontend UI Development & Integration** | 3 weeks | Implementing the dashboard, curriculum visualizer, chatbot interface, and mobile optimization. |
| **6. System Testing & Evaluation** | 2 weeks | Performance validation on pathfinding algorithms, database sync conflict resolutions, and vector search accuracy. |
| **7. Thesis Documentation & Defense** | 3 weeks | Compiling research results, writing the final thesis manuscript, and preparing for the final defense presentation. |

---

## Expected Output
1.  **Progressive Web Application (PWA)**: A mobile-responsive academic hub featuring a high-fidelity layout inspired by the DOST SOLIDO dashboard, serving as a dedicated, specialized interface for academic planning.
2.  **Interactive Curriculum Pathfinder**: A graphical visualization interface enabling students to track their current progress, check prerequisites, and automatically recalculate their curriculum roadmaps.
3.  **Local Policy Consulting Chatbot**: An offline-capable, vector-search-based chatbot that queries the student handbook and prints responses with matching citations.
4.  **Multi-Campus Database Synchronization Framework**: A working distributed database synchronization engine that connects Batac, Laoag, and Currimao nodes and resolves conflicts deterministically.

---

## Expected Beneficiaries
*   **Students**: Benefit from a centralized, mobile-responsive portal that makes academic pathways, handbooks, and schedules easily queryable and readable anywhere.
*   **Academic Advisers & Department Chairs**: Reduced administrative overhead when evaluating prerequisite waivers or detailing semester plans for irregular or transferee students.
*   **Campus Registrar & IT Departments**: A distributed database structure that minimizes bandwidth usage and prevents database locking during peak enrollment/grading periods.

---

## Aligned SDG
*   **SDG 4: Quality Education** – Equipping students and advisers with centralized, accurate academic roadmaps and direct access to university policies, thus reducing academic friction.
*   **SDG 9: Industry, Innovation, and Infrastructure** – Introducing a decentralized, offline-resilient multi-campus database architecture and advanced graph-theoretic models to university information infrastructure.
---

## Lead Researcher & Developer Profile and Self-Evaluation

To ensure the successful technical execution of the MMSU Knowledge Hub, this section details the research interests, development plans, and self-evaluation of the lead developer, **[Lead Developer]**, who is responsible for the system's core engineering.

### [Lead Developer] (Lead Systems Developer)
*   **Research Interest & Motivation:** The motivation for building this platform stems directly from my OJT experience at the IT Services & Management (ITSM) unit of [Agency Redacted for Anonymity]. Observing their robust, integrated, and highly traceable institutional systems highlighted the operational gaps within our current university information infrastructure, prompting the question: “What if there was a centralized platform designed specifically to bridge the information fragments, scattered resources, and curriculum tracking challenges faced by MMSU students?” I mean sure MVLE and Student Portal exists but still this inquiry directly inspired the conception of the MMSU Knowledge Hub as mentioned in the problem statement. Leveraging my hands-on exposure to full-stack architectural integration and distributed database layouts, this research serves as a practical test bed to apply these methodologies to real-world academic advising challenges appropriate for a thesis. Again (unless there is an existing one out there that we don't know of).
*   **Team Plan:** Because each group member has submitted an individual capstone/thesis proposal, the formal execution of this project and the corresponding division of labor WILL depend on whether this specific proposal is selected for development.
*   **Strengths & Weaknesses (Thesis-Specific):**
    *   *Strengths:* Experience building web applications using frontend scripting and styling (HTML, CSS, JavaScript, basic React), backend routing (PHP, Flask, basic Node.js), and relational databases (MySQL, SQLite). Additionally, I am highly proficient in AI-assisted development, leveraging agentic coding tools (like Antigravity) to rapidly navigate codebases, debug system conflicts, and implement features efficiently.
    *   *Weaknesses:* Limited experience writing advanced graph-based algorithms, configuring advanced NLP models, managing wide-scale database synchronization, and navigating complex, unfamiliar architectures.
*   **Compensation Strategy:** I will leverage online documentation, developer resources, and AI tools to research, build isolated prototypes, and adapt quickly to unfamiliar requirements as development progresses.
