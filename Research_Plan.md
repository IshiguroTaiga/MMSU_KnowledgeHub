# Outline of the Research Plan

## Research Title
**MMSU Knowledge Hub**: An Integrated Academic Advising Portal and Launcher with Graph-Theoretic Pathfinding and Semantic Policy Retrieval

### Group Members
*   **Bagasani, Nythan**
*   **Bonifacio, Johnas Nathaniel**
*   **Permison, Micko Gabriel**
*   **Udani, Bryan Leo**

---

## Problem Statement
While Mariano Marcos State University (MMSU) maintains an official website, a student portal, the MMSU Virtual Learning Environment (MVLE), and other digital platforms, there is no dedicated website that consolidates and redirects users to all the university's scattered online resources, department pages, and social media announcements. Currently, vital student guides, college-specific portals, and academic advisories are scattered across disjointed sites and various Facebook pages. Because there is no single directory or launchpad to index and redirect students to these separate digital nodes, students face severe information fragmentation. They must navigate multiple independent platforms just to retrieve basic academic information, leading to search delays, missed announcements, and confusion.

Specifically, students, academic advisers, and administrative departments face critical operational and informational gaps across four main areas:

1. **Curriculum Complexity and Advising Bottlenecks:**
   Irregular, transferee, and returning students frequently face difficulty tracking complex prerequisite chains and plotting graduation roadmaps. Because current portals lack automated topological modeling tools, students and advisers must manually map prerequisite paths. This manual process is prone to human error, risking academic deadlocks (e.g., prerequisite loops) and delaying graduation. Department chairs and advisers also suffer from severe administrative overhead during peak enrollment periods due to this manual vetting process.

2. **Friction in Student Handbook Navigation:**
   Important academic policies regarding retention, grading, shifting, and residency are locked within dense, monolithic PDF handbook documents spanning hundreds of pages. Keyword searching is often ineffective and fails to comprehend semantic or natural-language student queries. Without a local, offline-resilient, semantic search and retrieval system, students struggle to quickly find exact policy sections, leading to academic friction and missed administrative guidelines.

3. **Multi-Campus Data Synchronization Delays:**
   The physical separation of MMSU regional campuses (Batac, Laoag, and Currimao) results in fragmented local academic databases. Since these areas are prone to network outages and bandwidth constraints in Ilocos Norte, real-time database synchronization is unreliable. Consequently, local nodes fail to coordinate academic records and scheduling updates efficiently, causing data discrepancies and administrative delays across campuses.

4. **Fragmented Academic Notice Dissemination:**
   University updates, deadlines, and events are scattered across informal and disparate channels, including separate campus Facebook pages, department group chats, and physical bulletin boards. This fragmentation leads to information overload and notification fatigue. Students frequently miss critical academic opportunities (e.g., scholarship applications, special exam schedules) because they lack a single, aggregated, and filtered channel.

To address these distinct technical and operational challenges, there is a clear need for a dedicated, separate academic advising utility—the **MMSU Knowledge Hub**—designed to bridge these functional gaps.

---

## Objective
To develop a mobile-responsive, unified academic advising assistant and planning portal (inspired by the DOST SOLIDO Knowledge Hub design) that centralizes university resources and addresses multi-campus information fragmentation. The specific objectives are:
1.  **Graph-Theoretic Curricular Modeling**: Represent multi-campus curricula as Directed Acyclic Graphs (DAGs) to enable cycle detection (preventing prerequisite loop deadlocks) and dynamically calculate optimal, alternative paths to graduation for irregular, transferee, or returning students.
2.  **Semantic Student Handbook Policy Retrieval**: Host a local, offline-capable Retrieval-Augmented Generation (RAG) search engine utilizing vector embeddings and cosine similarity to answer student policy queries with precise text chunk citations.
3.  **Multi-Campus Database Synchronization**: Implement a secure, distributed database syncing engine that connects Batac, Laoag, and Currimao campus nodes to coordinate updates (e.g., student records, schedules) via timestamp-based delta syncing and conflict resolution.
4.  **Academic Bulletin & Media Walkthroughs**: Develop a real-time academic alert bulletin for critical notices (e.g., enrollment deadlines, suspensions) and embed video guides to walk users through university services.

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
    *   Integrate a unified quick-link portal directory, a real-time academic alert bulletin, and a featured video gallery for academic walkthroughs inspired by the DOST SOLIDO layout.
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
1.  **Progressive Web Application (PWA)**: A mobile-responsive academic hub featuring a high-fidelity layout inspired by the DOST SOLIDO dashboard, serving as a dedicated launcher and advising interface.
2.  **Interactive Curriculum Pathfinder**: A graphical visualization interface enabling students to track progress, check prerequisites, and automatically recalculate curriculum roadmaps.
3.  **Local Policy Consulting Chatbot**: An offline-capable, vector-search-based chatbot that queries the student handbook and prints responses with matching citations.
4.  **Multi-Campus Database Synchronization Framework**: A working distributed database synchronization engine that connects Batac, Laoag, and Currimao nodes and resolves conflicts deterministically.
5.  **Advising Alert Bulletin & Media Walkthrough Portal**: An integrated module offering real-time alerts on registration/clearance deadlines and embedded video walkthroughs for campus services.

---

## Expected Beneficiaries
*   **Students**: Benefit from a centralized, mobile-responsive portal that makes academic pathways, handbooks, and schedules easily queryable and readable anywhere.
*   **Academic Advisers & Department Chairs**: Reduced administrative overhead when evaluating prerequisite waivers or detailing semester plans for irregular or transferee students.
*   **Campus Registrar & IT Departments**: A distributed database structure that minimizes bandwidth usage and prevents database locking during peak enrollment/grading periods.

---

## Aligned SDG
*   **SDG 4: Quality Education** – Equipping students and advisers with centralized, accurate academic roadmaps and direct access to university policies, thus reducing academic friction.
*   **SDG 9: Industry, Innovation, and Infrastructure** – Introducing a decentralized, offline-resilient multi-campus database architecture and advanced graph-theoretic models to university information infrastructure.
