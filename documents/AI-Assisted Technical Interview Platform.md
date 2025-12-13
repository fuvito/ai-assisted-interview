# AI-Assisted Technical Interview Platform

## Purpose

The purpose of this project is to develop an **AI-assisted online interview platform** dedicated to helping software developers practice and master their technical interview skills. The system will offer structured mock interviews across key programming subjects, initially focusing on **Java, JavaScript, TypeScript, and NodeJS**, with the architecture designed for seamless future expansion. It will host a comprehensive, section-based database of questions and expert answers. Users can initiate a highly customized mock interview by selecting a subject and specific technical sections. The core value of the platform lies in its **AI Agent**, which will evaluate the user's written (with future voice-to-text support) responses, provide immediate, constructive feedback based on the stored answers, and assign a score. The system will maintain a historical record of all user scores and performance to enable continuous skill tracking and targeted improvement.

## High Level Architecture

The platform will follow a standard Multi-Tier Architecture, separating the presentation, business logic, and data layers to ensure scalability, security, and maintainability.

### **I. Presentation Layer (Frontend)**

This layer is responsible for user interaction and will consist of two primary interfaces served via the Common Backend.

| Interface | Components | Key Functions |
| :---- | :---- | :---- |
| **1\. User Web App** | Web Browser / Mobile Viewport | **Mock Interview Flow:** Initiating, receiving questions, submitting written answers. **Profile:** Login, Registration, Account Management. **History:** Viewing scores, feedback, and performance tracking. |
| **2\. User Mobile App (Future development)** | Mobile Device: iOS or Android | **Mock Interview Flow:** Initiating, receiving questions, submitting written answers. **Profile:** Login, Registration, Account Management. **History:** Viewing scores, feedback, and performance tracking. |
| **3\. Admin Web App** | Web Browser | **User Management:** View, create, and manage user accounts. **Subject Management:** Create, edit, and retire subjects (Java, JavaScript, etc.) and their sections. **Content Management:** CRUD (Create, Read, Update, Delete) operations for the Question & Answer database. |

### **II. Application Layer (Common Backend)**

This layer contains the core business logic and services, acting as the intermediary between the Frontend and the Data Layer.

| Component | Description |
| :---- | :---- |
| **API Gateway / Load Balancer** | The single entry point for all frontend requests, ensuring security, rate limiting, and distribution of traffic to the internal services. |
| **Authentication & User Service** | Handles user authentication (login/logout), authorization (User vs. Admin roles), and basic CRUD operations for user profiles. |
| **Content Management Service** | Exposes APIs for reading and retrieving Subjects, Sections, and Questions for the mock interviews. It also serves CRUD APIs for the Admin interface. |
| **Interview Service** | Manages the state of an active mock interview (e.g., populating the question list based on user selection, tracking the current question, and logging the user's answer). |
| **AI Evaluation Service (Core Engine)** | **The specialized service:** Receives a user's answer and the expert answer, runs the comparison and scoring logic, and generates the detailed, constructive feedback. |
| **History & Reporting Service** | Processes the results from the AI Evaluation Service (score, feedback) and persists the data. It also handles data retrieval for the User and Admin History/Reporting dashboards. |

### **III. Data Layer (Persistence)**

This layer is responsible for the secure storage and retrieval of all system data.

| Component | Description |
| :---- | :---- |
| **Primary Database (e.g., PostgreSQL, MySQL)** | Stores structured data: **User and Admin Accounts**, **Interview History**, **Scores**, **Subject/Section Structure**. |
| **Content Database (e.g., MongoDB, JSON/Document Store)** | Stores the highly textual content: The **Question Database**, **Expert Answers**, and potentially the detailed **AI Feedback** reports. This separation allows for efficient querying of unstructured content. |
| **Caching Layer (e.g., Redis)** | Improves performance by caching frequently accessed data, such as high-level subject lists or recent user scores. |

### **IV. High-Level Flow: Mock Interview & Evaluation**

1. **Start Interview (User App):** User selects Subject/Section → **Interview Service** populates questions from the **Content Management Service**.  
2. **Submit Answer (User App):** User submits a written answer → Answer is routed to the **Interview Service**.  
3. **Evaluation (Common Backend):** **Interview Service** sends the User's Answer and the corresponding Expert Answer to the **AI Evaluation Service**.  
4. **Feedback Loop (AI Service):** **AI Evaluation Service** processes the input, generates a Score and Feedback → The results are returned to the **Interview Service**.  
5. **Persistence:** **Interview Service** passes the final result to the **History & Reporting Service** to be persisted in the **Data Layer**.  
6. **Display (User App):** The score and feedback are returned to the User Web App for display.

## Development Plan: AI-Assisted Interview Platform

The plan prioritizes building the end-to-end core loop (MVP) first, then focusing on scaling the content (Admin UI/New Subjects), and finally enhancing the user experience and platform reach.

### Phase 1: Minimum Viable Product (MVP) \- Core Loop & Validation (1st Focus)

**Goal:** Launch a fully functional, end-to-end system for the core interview and evaluation process.

| Component | Deliverable | Priority Subjects |
| :---- | :---- | :---- |
| **Backend/Data** | 1\. **Core Data Layer Setup:** Primary DB (Users, History structure) and Content DB (Q\&A). | Java, TypeScript |
| **Backend/Services** | 2\. **Authentication Service MVP:** Simple User Login. Probably registration | Java, TypeScript |
| **Backend/Services** | 3\. **AI Evaluation Service MVP:** Simple scoring and basic feedback generation logic. | Java, TypeScript |
| **Backend/Services** | 4\. **Interview Service MVP:** Question population and answer routing for 2 subjects. | Java, TypeScript |
| **Admin UI (Initial)** | 5\. **Admin Content CRUD (MVP Only):** Basic forms to add/edit Questions & Expert Answers for Java and TypeScript. **Note:** *This is crucial to load content for the Client MVP.* | Java, TypeScript |
| **Client UI (MVP)** | 6\. **Web Client Core Flow:** Initiate interview, display question, and text input for user answer submission. No history view yet. | Java, TypeScript |

### Phase 2: Productization & Feature Completeness (Scale & Persistence) (2nd Focus)

**Goal:** Build out all remaining planned core features, complete the content for all initial subjects, and ensure system manageability.

| Component | Deliverable | Priority Subjects |
| :---- | :---- | :---- |
| **Admin UI (Full)** | 1\. **Full Admin Management:** Complete interface for **User Management** and **Subject/Section Management** (create/edit all subjects and sections). | All four (Java, TypeScript, JavaScript, NodeJS) |
| **Content/Data** | 2\. **Content Ingestion:** Populate the database with the full set of questions and answers for **JavaScript and NodeJS**. | JavaScript, NodeJS |
| **Backend/Services** | 3\. **History & Reporting Service:** Store and retrieve detailed interview results, including scores and full feedback. | All four |
| **Client UI (Enhanced)** | 4\. **History Dashboard:** Implement the client-side view for historical scores, past answers, and detailed AI feedback. | All four |
| **Client UI (Enhanced)** | 5\. **Enhanced Client UI:** Refined user experience, better visual design, and comprehensive subject/section selection menus. | All four |

### Phase 3: Optimization & Strategic Expansion (Enhancement & Reach) (3rd Focus)

**Goal:** Enhance the core AI value and expand the platform's reach to new devices.

| Component | Deliverable | Notes |
| :---- | :---- | :---- |
| **AI Evaluation** | 1\. **Advanced AI Agent:** Integrate more sophisticated NLP for evaluating context, tone, and depth, not just keyword matching. | Focus on quality of feedback. |
| **Client UI (Future)** | 2\. **Voice-to-Text Integration:** Implement the user input method allowing users to speak their answers, which are then transcribed for the AI Evaluation Service. | Major feature enhancement. |
| **Client UI (Mobile)** | 3\. **Mobile Client MVP:** Develop a lightweight, native or responsive mobile application (or PWA) focused *only* on the core interview flow and result display. | Separate platform development. |

### Phase 4: Growth, Maintenance, and Future Enhancements (Ongoing)

**Goal:** Continuous improvement, new subject integration, and scaling the infrastructure.

| Component | Deliverable |
| :---- | :---- |
| **Content** | 1\. Integrate the next set of subjects and sections as planned (e.g., Python, C++, etc.). |
| **Infrastructure** | 2\. Implement performance monitoring, scaling of the API Gateway, and fine-tuning of database performance. |
| **Client UI** | 3\. Introduce gamification, peer review features, or community forum integration. |
| **Monetization** | 4\. Implement a payment gateway and subscription logic (if planned). |

## Product Requirements Checklist (PRC)

| ID | Feature Area | Requirement | Status | Priority | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **AUTH-1** | **Authentication** | The system must support basic **User Registration (Sign Up)**. |  |  | Will be done as last step of MVP, 2 Users will be created in Supabase for development,  Signup will be added later |
| **AUTH-2** | **Authentication** | The system must support basic **User Login** and session management. |  | 1 |  |
| **S-1** | **Subject Scope** | The content must be restricted to **Java** and **TypeScript** subjects only. |  | 2 |  |
| **D-1** | **Content Data** | The database must be populated with a foundational set of technical questions and expert answers for both Java and TypeScript. |  | 1 | Supabase DN will be directly populated, However table schemas are important |
| **I-1** | **Interview Initiation** | Users must be able to start an interview by selecting one of the two available subjects (Java or TypeScript). |  | 2 |  |
| **I-2** | **Interview Flow** | The system must dynamically populate the mock interview with questions from the selected subject. |  | 2 |  |
| **UI-1** | **Web Client** | The Web Client UI must clearly display the current interview question. |  | 3 |  |
| **UI-2** | **User Input** | The Web Client UI must provide a **text input field** for the user to write and submit their answer. |  | 3 |  |
| **A-1** | **AI Evaluation** | The system must successfully route the user's written answer to the AI Evaluation Service. |  | 4 |  |
| **A-2** | **AI Evaluation** | The AI Service must return a **simple numeric score** (e.g., a 0-10 rating) for the answer. |  | 4 |  |
| **A-3** | **AI Evaluation** | The AI Service must provide **basic, minimal text feedback** for the answer (e.g., a summary of what was missed). |  | 4 |  |
| **H-1** | **History/Data** | The system must persist the final interview results (score, user answer, and AI feedback) in the History database. |  | 5 |  |
| **ADM-1** | **Admin Content** | A basic Admin interface must be implemented to allow for **CRUD** (Create, Read, Update, Delete) operations on **Questions and Expert Answers** for Java and TypeScript. |  | 6 | It will be done later in the development An Admin user will be created manually in supabase |
| **UI-3** | **Web Client** | The Web Client UI does **not** need a History dashboard or reporting view in this phase. |  |  | **\[SCOPE EXCLUSION\]** |
| **UI-4** | **Web Client** | The Web Client UI does **not** need section selection functionality; questions are pulled from the subject level only. |  |  | **\[SCOPE EXCLUSION\]** |

## Product Requirements Document (PRD)

### 1\. Authentication & User Management

| ID | Requirement | Description | Success Criteria |
| :---- | :---- | :---- | :---- |
| **AUTH-1** | **User Registration** | The system must allow new users to register an account using a valid email and a secure password. | A new user record is created in the database, and the user receives a confirmation email (or is immediately logged in). |
| **AUTH-2** | **User Login** | The system must allow registered users to log in securely with their credentials. | Upon successful authentication, a secure session token is generated, and the user is redirected to the main dashboard/subject selection screen. |

### 2\. Content & Subject Scope

| ID | Requirement | Description | Success Criteria |
| :---- | :---- | :---- | :---- |
| **S-1** | **Subject Scope Restriction** | The platform must only display and serve content for two initial subjects: **Java** and **TypeScript**. | The subject selection screen only presents two options: Java and TypeScript. No other subjects are visible or accessible via API. |
| **D-1** | **Foundational Q\&A Content** | The Content Database must be populated with a foundational set of interview questions and corresponding expert answers for both Java and TypeScript. | A minimum of 20 questions and expert answers are stored for each of the two subjects. |

### 3\. Mock Interview Flow (Client UI & Backend)

| ID | Requirement | Description | Success Criteria |
| :---- | :---- | :---- | :---- |
| **I-1** | **Interview Initiation** | The user must be able to initiate a mock interview by selecting one of the available subjects. | A unique interview session ID is created in the backend, and the user is presented with the first question. |
| **I-2** | **Question Population** | The Interview Service must dynamically select and present questions sequentially until the interview is complete (e.g., a set number of questions is reached). | Questions are pulled from the selected subject's content, and the interview progresses through the sequence until terminated. |
| **UI-1** | **Question Display** | The Web Client UI must clearly and legibly display the current interview question text. | The question text is visible and formatted for readability, along with an indicator of question progress (e.g., "Question 3 of 10"). |
| **UI-2** | **User Answer Submission** | The Web Client UI must provide a multi-line **text input field** for the user to write their answer and a clear **Submit** button to proceed. | Upon clicking 'Submit', the user's answer text and the question ID are successfully transmitted to the Interview Service API. |

### 4\. AI Evaluation & Feedback

| ID | Requirement | Description | Success Criteria |
| :---- | :---- | :---- | :---- |
| **A-1** | **AI Routing** | The Interview Service must successfully route the user's written answer, along with the correct expert answer, to the AI Evaluation Service. | The AI Evaluation Service receives both the user's answer and the expert answer without data loss. |
| **A-2** | **Simple Numeric Score** | The AI Evaluation Service must process the answers and return a simple numeric score for the response (e.g., a rating from 1 to 10). | A score is returned as an integer or float, and the data type is validated upon receipt by the Interview Service. |
| **A-3** | **Basic Text Feedback** | The AI Evaluation Service must generate and return a basic text summary of the answer's strengths and weaknesses. | A text string of at least 50 characters is returned, containing high-level constructive feedback. |

### 5\. Data Persistence & Management

| ID | Requirement | Description | Success Criteria |
| :---- | :---- | :---- | :---- |
| **H-1** | **History Persistence** | The system must successfully persist the complete record of the interview round (User ID, Score, User Answer, Expert Answer, and AI Feedback). | A new record is successfully written to the History Database upon completion of the interview. |
| **ADM-1** | **Admin Content CRUD (MVP)** | A basic Admin interface must be available to allow for **CRUD** (Create, Read, Update, Delete) operations on **Questions and Expert Answers** for Java and TypeScript. | An authenticated Admin user can successfully add a new question/answer pair and edit/delete existing content via the interface. |

### Scope Exclusions for MVP (Phase 1\)

The following features are explicitly **excluded** from the MVP to maintain focus and speed:

* **History Dashboard:** Users cannot view past interview scores or detailed history (Phase 2).  
* **Section Selection:** Questions are pulled from the entire subject level; there is no option to select specific technical sections (Phase 2).  
* **JavaScript/NodeJS Content:** Content for these subjects will not be available or visible (Phase 2).  
* **Voice-to-Text Input:** Input is restricted to text submission only (Phase 3).

## Technical Design Requirements Checklist \- Phase 1: MVP

This checklist outlines the core technology decisions required to implement the MVP's functional components (Authentication, Interview Flow, AI Evaluation, and Content Management).

### 1\. Backend & Core Services (Common Backend)

| ID | Component | Technical Requirement | Decisions / Notes |
| :---- | :---- | :---- | :---- |
| **B-1.1** | **Backend Framework** | Choose the primary programming language and web framework for the API Gateway and core services (Auth, Interview, History, Content). | NodeJs, Express, TypeScript, Supabase as DB and Authentication |
| **B-1.2** | **Authentication Solution** | Select the third-party or self-hosted solution for managing user accounts and secure session/token (JWT) generation. | Supabase |

### 2\. Data Layer (Persistence)

| ID | Component | Technical Requirement | Decisions / Notes |
| :---- | :---- | :---- | :---- |
| **D-2.1** | **Primary Database** | Select the database engine (SQL or NoSQL) for structured data: User Accounts, Interview History, and Scores. | Supabase |
| **D-2.2** | **Content Storage** | Select the storage solution for the highly textual Question & Answer content. | Supabase, somehow questions should be displayed in a pretty format: so maybe we can store questions in Markdown format? |

### 3\. AI Evaluation Engine

| ID | Component | Technical Requirement | Decisions / Notes |
| :---- | :---- | :---- | :---- |
| **AI-3.1** | **AI Model Provider** | Select the external AI provider (API) or framework/model for running the scoring and feedback logic. | Will use Gemini with Gemini File Search: so questions and answers can be provided in a document and Gemini FileSearch can refer to those |

### 4\. Frontend (Web Client & Admin UI)

| ID | Component | Technical Requirement | Decisions / Notes |
| :---- | :---- | :---- | :---- |
| **F-4.1** | **Frontend Framework** | Select the JavaScript framework or library for building the User Web Client and the Basic Admin UI. | React, Typescript, Material UI Styles, and other needed libraries: Supabase, display Markdown, etc |

### 5\. Deployment & DevOps

| ID | Component | Technical Requirement | Decisions / Notes |
| :---- | :---- | :---- | :---- |
| **V-5.1** | **Cloud Provider** | Select the cloud platform (AWS, GCP, Azure, etc.) or hosting service for infrastructure and deployment. | For MVP Netlify is going to be used |

### Technology & Solution Questions

Please answer the following questions to allow me to create the formal Technical Design Document:

1. **Backend Framework:** What programming language and framework will you use for the Common Backend (e.g., Python/Django, **Node.js/Express**, Go/Fiber, Java/Spring Boot)?  
2. **Authentication Solution:** Which solution will you use for Authentication (e.g., **Supabase**, Firebase Auth, Auth0, or something else)?  
3. **Primary Database:** What database will you use for User Data and History (e.g., PostgreSQL, MySQL, MongoDB, **Supabase**)?  
4. **AI Model Provider:** Which AI provider's API will you use for the AI Evaluation Service (e.g., **Gemini API and Gemini File Search**, OpenAI, or a self-hosted open-source model)?  
5. **Frontend Framework:** Which framework will you use for the Web Client UI (e.g., **React**, Vue, Angular, Svelte)?  
6. **Cloud/Hosting:** Which platform will you use for hosting and deployment (e.g., Vercel, **Netlify**, AWS, DigitalOcean)?

## Technical Design Document (TDD) \- Phase 1: MVP

### 1\. Backend & Core Services (Common Backend)

| Component | Technical Requirement | Decisions / Notes |
| :---- | :---- | :---- |
| **B-1.1** | **Backend Framework** | The core business logic and APIs will be implemented using **Node.js** with the **Express** framework. |
| **B-1.2** | **Authentication Solution** | User registration, login, and secure session/token (JWT) management will be handled by **Supabase Authentication**. |
| **B-1.3** | **API Gateway** | Express will serve as the primary API layer, routing traffic to the internal services (Auth, Interview, History, Content). |
| **B-1.4** | **Interview Service** | Logic will manage session state, fetch questions based on subject, and route user answers for evaluation. |
| **B-1.5** | **Content Service** | Implemented as Express endpoints managing CRUD operations for Questions/Answers (Admin) and read-only access (Client). |

### 2\. Data Layer (Persistence)

| ID | Component | Technical Requirement | Decisions / Notes |
| :---- | :---- | :---- | :---- |
| **D-2.1** | **Primary Database** | All structured data, including **User Accounts**, **Interview History**, and **Scores**, will be stored in **PostgreSQL**. | Supabase includes a managed PostgreSQL database, simplifying integration. |
| **D-2.2** | **Content Storage** | The highly textual **Question & Answer** content will also reside within the **PostgreSQL** database, leveraging features like JSONB columns or full-text search capabilities if needed later. | Using a single database for the MVP simplifies deployment and management. |

### 3\. AI Evaluation Engine

| ID | Component | Technical Requirement | Decisions / Notes |
| :---- | :---- | :---- | :---- |
| **AI-3.1** | **AI Model Provider** | The primary service for generating scores and feedback will utilize the **Gemini API**. | This choice will power the AI Evaluation Service (A-2, A-3). Other APIs (OpenAI) or models are reserved for Phase 3: Optimization. |
| **AI-3.2** | **Evaluation Service** | A dedicated Node.js service will handle API calls to the Gemini API, process the request/response, and enforce strict JSON input/output for reliable data exchange. | This service will be isolated for easy upgrading or switching AI providers in the future. |

### 4\. Frontend (Web Client & Admin UI)

| ID | Component | Technical Requirement | Decisions / Notes |
| :---- | :---- | :---- | :---- |
| **F-4.1** | **Frontend Framework** | The User Web Client UI (Login, Subject Selection, Interview Screen) and the Basic Admin UI will be built using **React with Typescript**. Material UI will be used as CSS / Styling Framework  | React allows for reusable components and a highly interactive user experience. **Material UI Component Library:** Provides thousands of ready-to-use, accessible, and well-designed React components (buttons, forms, tables, sidebars). This is ideal for quickly building the structured Mock Interview UI and the complex **Admin Interface** (User Management, Q\&A CRUD). **Tech Stack Fit:** Designed specifically for seamless integration with **React** and **TypeScript**. **Aesthetics:** Adheres to Google's Material Design principles, providing a consistent, modern, and professional aesthetic without needing a dedicated designer.  |
| **F-4.2** | **State Management** | (TBD) A state management library (e.g., React Context, Redux, Zustand) will be selected to handle global application state and user session data. | For MVP basic state management is sufficient |
| **F-4.3** | **API Integration** | Client-side logic will use standard TypeScript fetching (or a library like Axios) to communicate with the Node.js/Express APIs. | TypeScript Axios |

### 5\. Deployment & DevOps

| ID | Component | Technical Requirement | Decisions / Notes |
| :---- | :---- | :---- | :---- |
| **V-5.1** | **Frontend Hosting** | The static assets for the React Web Client UI will be deployed using **Netlify**. | Netlify offers a simple, fast, and reliable solution for hosting the client-side MVP. |
| **V-5.2** | **Backend Hosting** | The Node.js/Express backend services and the AI Evaluation Service will require a separate hosting environment (e.g., a managed service like AWS, DigitalOcean, or a similar cloud provider) to ensure continuous operation and database connectivity. | BAckend app can be hosted on AWS as Lambda function, Supabase provides hosting for Auth and PostgreSQL, which simplifies the database portion. |
| **V-5.3** | **CI/CD** | Basic Continuous Integration/Deployment pipeline will be set up to deploy the React app automatically upon Git pushes to the main or prod branch on Netlify. |  |
| **V-5.4** | **Security** | API keys for the Gemini API and database credentials will be secured using environment variables managed by the hosting provider. |  |

