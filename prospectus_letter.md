# MMSU Knowledge Hub: Prospectus Data Collection Guide & Letter

This document contains a formal letter template and data collection options for gathering course prospectuses across all Mariano Marcos State University (MMSU) colleges. This data is critical for building the Directed Acyclic Graph (DAG) for the **Curriculum Pathfinder** component of the MMSU Knowledge Hub.

---

## 📅 Directory of MMSU Colleges & Target Recipients
When sending these letters, you will want to customize the salutation for each college. Here is a list of the colleges and campuses to target:

| College / Unit | Campus | Code | Target Recipient (Dean / Chair) |
| :--- | :--- | :--- | :--- |
| **College of Computing and Information Sciences** | Batac | CCIS | *Already Completed (BSCS)* |
| **College of Teacher Education** | Laoag | CTE | Dean, College of Teacher Education |
| **College of Engineering** | Batac | COE | Dean, College of Engineering |
| **College of Arts and Sciences** | Batac | CAS | Dean, College of Arts and Sciences |
| **College of Business, Economics and Accountancy** | Batac | CBEA | Dean, College of Business, Economics and Accountancy |
| **College of Health Sciences** | Batac | CHS | Dean, College of Health Sciences |
| **College of Agriculture, Food and Sustainable Resources** | Batac | CAFSR | Dean, CAFSR |
| **College of Industrial Technology** | Laoag | CIT | Dean, College of Industrial Technology |
| **College of Aquatic Sciences and Applied Technology** | Currimao | CASAT | Dean, CASAT |
| **College of Law** | Batac | COL | Dean, College of Law |
| **College of Medicine** | Batac | COM | Dean, College of Medicine |
| **Office of the University Registrar** | Batac | OUR | University Registrar |

---

## ✉️ Formal Request Letter Template

Copy the markdown below, replace the bracketed placeholders `[like this]`, and paste it into your word processor or email client.

***

### MARIANO MARCOS STATE UNIVERSITY
**College of Computing and Information Sciences**  
Department of Computer Science  
City of Batac, Ilocos Norte

**Date:** July 18, 2026

**MEMORANDUM**

**TO:**  
**[Name of Dean or Registrar]**  
[Dean, College of / University Registrar]  
Mariano Marcos State University  

**THRU:**  
**Dr. [Name of CCIS Dean]**  
Dean, College of Computing and Information Sciences  

**FROM:**  
**Bagasani, Nythan**  
**Bonifacio, Johnas Nathaniel**  
**Permison, Micko Gabriel**  
**Udani, Bryan Leo**  
Researchers, BS Computer Science  

**SUBJECT: Request for Course Prospectuses/Curricula of Undergraduate Programs**

Warm greetings!

We, the undersigned BS Computer Science students of the College of Computing and Information Sciences (CCIS), are currently working on our capstone thesis project entitled **"MMSU Knowledge Hub: An Integrated Multi-Campus Academic Information System with Graph-Theoretic Pathfinding and Semantic Policy Retrieval."**

The project aims to develop a mobile-responsive academic advising portal that centralizes university resources and addresses multi-campus information fragmentation. A core feature of this system is the **Curriculum Pathfinder**, which represents student curricula as Directed Acyclic Graphs (DAGs). This feature will mathematically validate prerequisite streams, detect cycle deadlocks, and dynamically calculate optimal, alternative pathways to graduation for irregular, transferee, or returning students.

To achieve this, we need to model the academic curricula of all undergraduate programs offered across all colleges and campuses of Mariano Marcos State University (Batac, Laoag, and Currimao). 

In this regard, we would like to formally request from your good office a copy of the official course prospectuses or curriculum layouts for the undergraduate programs under your college. Specifically, we require the following data points for each course:
1. **Course Code** (e.g., `CMPSC 100`, `MATH 16_N`)
2. **Course Description/Title** (e.g., `Computer Science Fundamentals`)
3. **Credit Units** (e.g., `3`)
4. **Pre-requisite/s and Co-requisite/s** (e.g., `CMPSC 111` or `None`)
5. **Recommended Year Level and Semester** (e.g., First Year, Second Semester)

We have prepared three convenient ways for your college or department representatives to provide this data:
* **Option A (Preferred - Digital File Upload):** Providing copies of official curriculum sheets in PDF, MS Word, or Excel format via email to **[your_email@mmsu.edu.ph]** or our upload portal.
* **Option B (Shared Spreadsheet):** Entering or pasting curriculum tables directly into our structured, secure online Google Sheets spreadsheet.
* **Option C (Google Form):** Directly keying in individual course structures via a specialized submission form.

Rest assured that all gathered materials will be handled with strict confidentiality and will be used solely for the development, testing, and validation of the MMSU Knowledge Hub system.

We hope for your favorable response and support towards this academic endeavor. Thank you very much for your time and cooperation.

Respectfully yours,

*(Signed)*  
**NYTHAN BAGASANI**  
Lead Researcher  

*(Signed)*  
**JOHNAS NATHANIEL BONIFACIO**  
Researcher  

*(Signed)*  
**MICKO GABRIEL PERMISON**  
Researcher  

*(Signed)*  
**BRYAN LEO UDANI**  
Researcher  

**Recommending Approval:**  

*(Signed)*  
**[NAME OF THESIS ADVISER]**  
Thesis Adviser  

***

---

## 🛠️ Data Collection Strategies

Because typing out curriculum sheets manually can lead to typos (especially in Course Codes and Prerequisites, which will break the Graph Pathfinder's edges), choosing the right collection method is key. Here are the three main options you can set up:

### 📊 Strategy 1: Shared Google Sheets Template (Highly Recommended)
Instead of a Google Form, which requires submitting a form 40+ times for a single curriculum, a **Google Sheet** allows departments to copy and paste entire tables at once.

1. **Create a Google Sheet** named `MMSU Curricula Collection Master`.
2. Create tabs for each college (e.g., `COE`, `CTE`, `CAS`, `CBEA`).
3. Set up the following columns in row 1:
   * **Program Name** (e.g., `BS Civil Engineering`, `BS Secondary Education`)
   * **Year Level** (e.g., `1st Year`, `2nd Year`, `3rd Year`, `4th Year`)
   * **Semester** (e.g., `1st Semester`, `2nd Semester`, `Mid-Year`)
   * **Course Code** (e.g., `MATH 21`, `COE 101`) — *Emphasize that this must match prerequisites exactly!*
   * **Course Description** (e.g., `Calculus I`)
   * **Units** (e.g., `3` or `5`)
   * **Pre-requisite/s** (e.g., `MATH 16_N` or `None`. If multiple, separate with commas like: `MATH 11, PHYS 21`)
   * **Co-requisite/s** (e.g., `COE 101L` or `None`)
4. **Share settings:** Share the spreadsheet with "Anyone with the link can edit" (or restrict it to `@mmsu.edu.ph` accounts) and send the link in your request emails.

---

### 📝 Strategy 2: Google Form for File Upload (Low Friction for Deans)
Deans and Department Chairs are busy. The fastest way to get their data is to let them upload their existing PDF/Word files, and then you and your team do the encoding.

#### Form Structure:
1. **College:** (Dropdown: `CTE`, `COE`, `CAS`, `CBEA`, `CHS`, `CAFSR`, `CIT`, `CASAT`, `COL`, `COM`)
2. **Department:** (Short answer: e.g., `Department of Civil Engineering`)
3. **Contact Person / Representative Name:** (Short answer)
4. **Representative Email Address:** (Short answer - Email format validation)
5. **Curriculum/Prospectus File Upload:** (File Upload question)
   * *Settings:* Allow only specific file types: PDF, Document, Spreadsheet.
   * *Settings:* Max file size: 10 MB.
   * *Settings:* Allow multiple files (in case they have multiple programs).

---

### 💻 Strategy 3: Google Form for Encoders (Course-by-Course)
If you hire/ask student volunteers (or your team splits up the work) to encode curriculum sheets manually into a database-ready structure, use this Google Form structure to standardize inputs.

#### Form Fields:
1. **Program/Degree:** (Short Answer - e.g., `BS Computer Science`)
2. **Effective Curriculum Year:** (Short Answer - e.g., `2024-2025`)
3. **Year Level:** (Multiple Choice: `First Year`, `Second Year`, `Third Year`, `Fourth Year`, `Fifth Year`)
4. **Semester:** (Multiple Choice: `First Semester`, `Second Semester`, `Mid-Year`)
5. **Course Code:** (Short Answer - *Short, exact code, e.g., CMPSC 111*)
6. **Course Description:** (Short Answer - *Full course name, e.g., Computer Programming I*)
7. **Lecture Units:** (Number - *e.g., 2*)
8. **Lab Units:** (Number - *e.g., 1*)
9. **Total Units:** (Number - *e.g., 3*)
10. **Pre-requisite Course Codes:** (Short Answer - *Enter codes separated by commas, or write "None"*)
11. **Co-requisite Course Codes:** (Short Answer - *Enter codes separated by commas, or write "None"*)

> [!TIP]
> When creating this Google Form, enable **Response Validation** on numerical fields (Units) to ensure only numbers are input, and use **Capitalization Rules** or instructions on Course Codes to avoid entries like `cmpsc-111` when it should be `CMPSC 111`.

---

## 💾 Technical Data Schema Mappings

Once you collect the data, you will need to structure it into your SQLite database (`database_schema.sql`) and JSON files (`bscs_curriculum.json`). Below are the templates for how this data should be structured for your Graph Pathfinder.

### 1. CSV Structure (For import into SQLite)
If you collect the data via Google Sheets, you can export it to a CSV file named `curricula.csv` with this header structure:

```csv
program_code,year_level,semester,course_code,course_description,units,prerequisites
BSCS,1,1,CMPSC 100,Computer Science Fundamentals,3,None
BSCS,1,1,CMPSC 111,Computer Programming I - C,3,None
BSCS,1,2,CMPSC 113,Object-oriented Programming,3,CMPSC 111
BSCS,2,1,CMPSC 131,Data Structures,3,CMPSC 111
BSCS,2,1,CMPSC 116,Database Systems,3,CMPSC 100
```

### 2. JSON Structure (Graph Node-Edge Representation)
For your graph pathfinding algorithms (DFS cycle detection and Dijkstra/A* pathing), you can represent each curriculum in a JSON file format:

```json
{
  "program": "Bachelor of Science in Computer Science",
  "program_code": "BSCS",
  "courses": [
    {
      "code": "CMPSC 100",
      "description": "Computer Science Fundamentals",
      "units": 3,
      "year": 1,
      "semester": 1,
      "prerequisites": []
    },
    {
      "code": "CMPSC 111",
      "description": "Computer Programming I - C",
      "units": 3,
      "year": 1,
      "semester": 1,
      "prerequisites": []
    },
    {
      "code": "CMPSC 116",
      "description": "Database Systems",
      "units": 3,
      "year": 2,
      "semester": 1,
      "prerequisites": ["CMPSC 100"]
    },
    {
      "code": "CMPSC 113",
      "description": "Object-oriented Programming",
      "units": 3,
      "year": 1,
      "semester": 2,
      "prerequisites": ["CMPSC 111"]
    }
  ]
}
```

> [!IMPORTANT]
> **Data Integrity Warning for Graph Pathfinding:**  
> When modeling the curriculum as a Directed Acyclic Graph (DAG), ensure that:
> - **Prerequisite Codes match Course Codes exactly** (case-sensitive and spaces-sensitive). For example, if a prerequisite is entered as `CmpSc 111`, but the course code is defined as `CMPSC 111`, your pathfinding parser will fail to draw an edge.
> - **No loop cycles exist** (e.g., Course A requires Course B, which requires Course A). You should run your cycle detection logic immediately after loading new data sheets.
