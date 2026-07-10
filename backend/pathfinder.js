import fs from 'fs';

// A Graph-Theoretic Curricular Pathfinder engine handling Directed Acyclic Graphs (DAGs),
// topological dependencies, cycle validation, and path recalculations for irregular students.

export class CurriculumPathfinder {
  constructor() {
    this.courses = {};      // Course ID -> Course details
    this.graph = {};        // Course ID -> Array of downstream courses (adjacency list)
    this.prereqs = {};      // Course ID -> Set of prerequisite Course IDs
  }

  // Load curriculum from the JSON file
  initialize(curriculumJsonPath) {
    try {
      const data = JSON.parse(fs.readFileSync(curriculumJsonPath, 'utf-8'));
      this.buildGraph(data.nodes);
      const hasCycles = this.validateDAG();
      console.log(`[Pathfinder] Curriculum loaded. DAG validation: ${hasCycles ? '❌ FAILED (Cycles detected)' : '✅ PASSED (No cycles)'}`);
    } catch (err) {
      console.error('[Pathfinder] Error initializing curriculum graph:', err);
    }
  }

  buildGraph(nodes) {
    // Reset structures
    this.courses = {};
    this.graph = {};
    this.prereqs = {};

    // 1. Populate nodes
    nodes.forEach(node => {
      this.courses[node.id] = {
        id: node.id,
        name: node.name,
        units: node.units,
        defaultYear: node.year,
        defaultSemester: node.semester,
        prerequisites: node.prerequisites
      };
      this.graph[node.id] = [];
      this.prereqs[node.id] = new Set(node.prerequisites);
    });

    // 2. Build adjacency list (downstream connections)
    nodes.forEach(node => {
      node.prerequisites.forEach(prereqId => {
        if (this.graph[prereqId]) {
          this.graph[prereqId].push(node.id);
        } else {
          console.warn(`[Pathfinder] Warning: Prerequisite course ${prereqId} not found in nodes list.`);
        }
      });
    });
  }

  // Tarjan's or DFS-based Cycle Detection (validates DAG structure)
  validateDAG() {
    const visited = {}; // ID -> Status (0 = unvisited, 1 = visiting, 2 = visited)
    let hasCycle = false;

    const dfs = (courseId) => {
      visited[courseId] = 1; // Mark as visiting

      const downstreams = this.graph[courseId] || [];
      for (let i = 0; i < downstreams.length; i++) {
        const neighbor = downstreams[i];
        if (visited[neighbor] === 1) {
          hasCycle = true; // Found a back edge (cycle)
          return;
        } else if (!visited[neighbor]) {
          dfs(neighbor);
          if (hasCycle) return;
        }
      }

      visited[courseId] = 2; // Mark as fully visited
    };

    Object.keys(this.courses).forEach(courseId => {
      if (!visited[courseId]) {
        dfs(courseId);
      }
    });

    return hasCycle;
  }

  // Recalculates graduation roadmap when subjects are failed
  // failedCourseIds: Array of course IDs that the student failed (e.g. ["MATH11"])
  // startYear / startSemester: The current year and semester when the recalculation takes place
  recalculatePlan(failedCourseIds = [], currentYear = 1, currentSemester = 1) {
    const failedSet = new Set(failedCourseIds);
    const passedCourses = new Set();
    const completedPrereqs = new Set();

    // 1. Mark all courses as "not completed" initially
    const pendingCourses = new Set(Object.keys(this.courses));

    // 2. Separate already passed courses from failed/uncompleted courses.
    // We assume any course scheduled *before* the currentYear/semester was passed,
    // unless it is explicitly marked as failed.
    Object.keys(this.courses).forEach(id => {
      const course = this.courses[id];
      if (
        (course.defaultYear < currentYear || 
         (course.defaultYear === currentYear && course.defaultSemester < currentSemester)) &&
        !failedSet.has(id)
      ) {
        passedCourses.add(id);
        completedPrereqs.add(id);
        pendingCourses.delete(id);
      }
    });

    // 3. Construct chronological semesters to allocate uncompleted classes.
    const adjustedPlan = []; // Array of semesters: { year, semester, courses: [] }
    let iterYear = currentYear;
    let iterSemester = currentSemester;
    const maxSemesters = 16; // Safety cutoff to prevent infinite loops (max residency safety)
    let safetyCounter = 0;

    // Load constraints
    const maxUnitsPerSemester = 21;

    while (pendingCourses.size > 0 && safetyCounter < maxSemesters) {
      safetyCounter++;
      const semesterCourses = [];
      let semUnits = 0;

      // Identify candidates that can be taken in the current iterYear / iterSemester
      // Candidates must satisfy:
      // a) All prerequisites are passed (exist in passedCourses set).
      // b) Matches the offering cycle (e.g., first-sem courses must be taken in first semesters).
      //    Note: In Philippine SUCs, major courses are typically offered only during their default semester.
      const candidates = [];

      pendingCourses.forEach(id => {
        const course = this.courses[id];
        
        // Check prerequisites
        const prereqsSatisfied = course.prerequisites.every(prereqId => passedCourses.has(prereqId));
        
        // Check offering cycle (odd semesters are 1st Sem, even semesters are 2nd Sem)
        const isOfferedInThisSemester = (course.defaultSemester % 2) === (iterSemester % 2);

        if (prereqsSatisfied && isOfferedInThisSemester) {
          candidates.push(course);
        }
      });

      // Sort candidates: prioritize failed subjects first, then downstream chain length (highest in-degrees/out-degrees)
      candidates.sort((a, b) => {
        const isAFailed = failedSet.has(a.id) ? 1 : 0;
        const isBFailed = failedSet.has(b.id) ? 1 : 0;
        if (isAFailed !== isBFailed) return isBFailed - isAFailed; // failed first

        // Otherwise prioritize by default year/semester (earliest first)
        if (a.defaultYear !== b.defaultYear) return a.defaultYear - b.defaultYear;
        return a.defaultSemester - b.defaultSemester;
      });

      // Allocate candidates within maxUnitsPerSemester constraint
      candidates.forEach(course => {
        if (semUnits + course.units <= maxUnitsPerSemester) {
          semesterCourses.push(course);
          semUnits += course.units;
        }
      });

      // Save allocated courses for this semester
      adjustedPlan.push({
        year: iterYear,
        semester: iterSemester,
        courses: semesterCourses.map(c => ({
          id: c.id,
          name: c.name,
          units: c.units,
          isDelayed: failedSet.has(c.id) || (c.defaultYear < iterYear) || (c.defaultYear === iterYear && c.defaultSemester < iterSemester)
        })),
        totalUnits: semUnits
      });

      // Update sets for next iteration
      semesterCourses.forEach(c => {
        passedCourses.add(c.id);
        pendingCourses.delete(c.id);
      });

      // Advance semester clock
      if (iterSemester === 1) {
        iterSemester = 2;
      } else {
        iterSemester = 1;
        iterYear++;
      }
    }

    return {
      adjustedPlan,
      isExceedingMRR: iterYear - currentYear > 6, // checks if student exceeds maximum residency (6 years for BSCS)
      totalSemestersNeeded: adjustedPlan.length
    };
  }
}
