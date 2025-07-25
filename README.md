# Project Artifact: SPOPA, Prototype #4.


## Team 1E
## Repository link: https://github.com/jdavidrt/spopa-25-frontend/
- David Santiago Castañeda Venegas - dscastanedav@unal.edu.co
- Gian Emanuel Morales González - gimoralesg@unal.edu.co
- Juan David Ramírez Torres - jdramirezt@unal.edu.co 
- Nicolas Machado Narvaez - nmachado@unal.edu.co
- Sergio Ivan Motta Doncel - smottad@unal.edu.co


Software Architecture.
Engineering Faculty.
2025-I
National University of Colombia.

![Unal Logo](https://lh4.googleusercontent.com/proxy/WNtyuTbDjnnITJFxg1dlI63L0jfIMRf0CIKg75VavFd3ameUuokpEiXIZvafO0UbA3rGKkhjDZ2HFtRWcGiPIn7Syd37PqnCrQuXFNHguRRPYm__safRJi9Q)


---


## Software System: SPOPA
![Spopa Logo](https://i.imgur.com/tDGdNvW.png)


### Description
Spopa is a distributed platform designed to connect university students with professional internship opportunities. The system allows companies to publish their internship offers and enables students to find opportunities that align with their academic and professional profiles. The platform offers advanced search functionalities, and selection process tracking, all built on a modern and scalable microservices architecture.

## Architectural Structures

### Component and Connector View

![image](https://github.com/user-attachments/assets/04aa1ece-493f-4a0b-b842-f1c09434278e)

### Components

| Connector       | Component                           |Description                                         |
| --------------- | ----------------------------------- |----------------------------------------------------|
| **HTTPS**        | `web browser` ↔ `fe`               |Expected user contact device                        |
| **HTTPS**        | `mobile app` ↔ `fe_app`            |Expected user contact device                        |
| **SSR**         | `fe` ↔ `fe_server`                  |Web front end contact with server service           |
| **GraphQL**     | `fe_app` ↔ `process_px`             |Proxy divider between public and private net        |
| **HTTP**        | `fe_server` ↔ `process_px`          |Proxy divider between public and private net        |
| **HTTP**        | `process_px` ↔ `API Gateway`        |Proxy divider between public and private net        |
| **REST**        | `API Gateway` ↔ `process_px`        |API Gateway communication with backend microservices|
| **REST**        | `API Gateway` ↔ `ss_offers_ms`      |API Gateway communication with backend microservices|
| **REST**        | `API Gateway` ↔ `ss_admin_ms`       |API Gateway communication with backend microservices|
| **MDBProtocol** | `ss_process_ms` ↔ `process_db`     |Microservice communication with it's database       |
| **MYSQLProtocol** | `ss_users_ms` ↔ `users_db`    |Microservice communication with it's database       |
| **MDBProtocol** | `ss_admin_ms` ↔ `admin_db`          |Microservice communication with it's database       |

### Connectors

|Connector       |Description                                                          |
|----------------|---------------------------------------------------------------------|
|**HTTP**        |Standard communication protocol                                      |
|**HTTPS**       |Hypertext Transfer Protocol Secure                                   |
|**GraphQL**     |Query communication protocol                                         |
|**REST**        |Format of HTTP(S) request that process requests using RESTful principles (GET, POST, PUT, DELETE, etc.)|
|**DB Protocol** |Low level protocol and format that varies depending on the database it communicates with.|

### Architecute Styles:

|Style  | Description|
| -------- | -------------- |
|Microservices|A distributed approach where the system is composed of small, independent services that communicate over a network and are responsible for a single business capability.|
|Client-Server Architecture| A style where clients request services and servers provide responses, separating concerns between the user interface and data processing.|
|Laeyered Architecture | A structure that organizes the system into layers, each with a distinct responsibility, typically including presentation, logic, and data access.|

### Architecture patterns:

|Pattern | Description |
| -------- | -------------- |
|Api Gateway|A centralized entry point that manages and routes client requests to the appropriate backend services, often handling cross-cutting concerns like authentication and logging.|
|Server Side Rendering | A technique where web page content is generated on the server and sent to the client, typically to improve performance and accessibility.|
|Reverse Proxy|A proxy server that sits in front of one or more services, forwarding client requests and often providing security, load balancing, and caching.|

### Layered View

![image](https://github.com/user-attachments/assets/36658636-9167-4e17-8ab6-d08721e1b0b5)

|Layer        |Description                                                                 |Elements|
|-------------|----------------------------------------------------------------------------|-|
|Client Side  |The interface users interact with. (web or mobile app)                      |Client web browser / App|
|Presentation |Formats and displays data to the user and handles input/output interactions.|`fe`, `fe_app`, `fe_server`|
|Orchestration|Coordinates communication between services, APIs, and components.           |`process_px`, API Gateway|
|Logic        |Contains the core business rules and application behavior.                  |`ss_process_ms`, `ss_offers_ms`, `ss_admin_ms`|
|Storage      |Manages data persistence using databases or file systems.                   |`ss_process_db`, `ss_offers_db`, `ss_admin_db`|

### Deployment View

![image](https://github.com/user-attachments/assets/e4aa465e-f8a8-42a8-b23b-bc823ccee080)

|Container|In-Private Network?|Description|Port|
|-|-|-|-|
|`fe`           |No |Web browser user display.                  |-|
|`fe_server`    |No |Web browser content rednerer.              |3000|
|`fe_app`       |No |App user display.                          |3001|
|`process_px`   |No |Network direction divider.                 |3002|
|`api-gateway`  |Yes|Load balancer and microservice coordinator.|3010|
|`ss_process_ms`|Yes|Existing internship details, contacts, status, and other details logic.|4001|
|`process_db`|Yes|Existing internship details, contacts, status, and other details storage. |4011|
|`ss_users_ms` |Yes|All user accounts, information, and internship application progress logic.      |4002|
|`users_db` |Yes|All user accounts, information, and internship application progress storage.|4012|
|`ss_admin_ms`  |Yes|Administration access for the management of accounts and data. Logic.      |4003|
|`admin_db`  |Yes|Administration access for the management of accounts and data. Storage.    |4013|

### Decomposition View

![image](https://github.com/user-attachments/assets/be252b97-2b74-4063-bf18-73d28f32782c)

|Function           |Elements|Description|
|-|-|-|
|User access        |User access for student, business, and administrative users.                    |Account and system access, and verification of the type of account and permissions of it.|
|Manage Offers      |Display listing and, if authorized, provide editing tools for internship offers.|See and manage, if authorized, live internship offers registered to the SPOPA system.|
|Administrator Tools|Manage registered students.                                                     |See and manage student accounts registered to the SPOPA system.|
|Student Portal     |Toolbar for the use of students during their internship application process.    |The student portal reffers to the tools exclusively thought for the student to facilitate the process of their application. This includes to track the total progress and information of their specific application, a checklist with all the necessary steps to get faculty approval, and a defined set list of approved proffessors affiliated with the University.|


## Quality Attributes

### Security
#### Scenarios
#### Scenario 1: the software system must implement the Secure Channel Pattern.
Source: External user. Stimulus: User makes a comunication with the system. Artifact: Connection carried out with the use of HTTPS protocol between the user browser and the front end components. Response: Establishment of a secure, encoded connection between the two components.
#### Scenario 2: the software system must implement the Reverse Proxy Pattern.
Source: Malicious external agent. Stimulus: Agent attempts to establish a direct connection to internal service endpoints, bypassing the reverse proxy. Artifact: Network-level configuration and NGINX reverse proxy restricting access to private internal services. Response: The connection is rejected or dropped, as direct access to internal services is blocked; only requests routed through the reverse proxy on the public interface are accepted.
#### Scenario 3: the software system must implement the Network Segmentation Pattern.
Source: Authenticated user with an unauthorized role. Stimulus: User attempts to access a system resource or service hosted in a restricted network segment. Artifact: Network segmentation rules enforced via private subnets. Response: The request is denied or blocked at the network or service level. Access is only granted to users whose roles permit communication with the corresponding network segment.
#### Scenario 4: the software system must implement the API Gateway Pattern for security purposes.
Source: External user. Stimulus: User sends a request to access backend services. Artifact: API Gateway positioned between the user and internal microservices. Response: The API Gateway authenticates and authorizes the request, applies rate limiting and validation rules, and routes the request to the appropriate internal service. Unauthorized or malformed requests are rejected before reaching internal components.

![complete_quality_scenarios](https://github.com/user-attachments/assets/f6e2b62b-40d1-4036-acfe-f2e8ca8d3d2b)


#### Applied patterns and tactics
Patterns:
|Pattern|Description|
|-|-|
|Secure channel|Usage of more secure communication protocols through HTTPS between components.|
|API Gateway pattern|Central point of access for security and access enforcement.|
|Reverse Proxy Net|All communications are filtered to public nets through a reverse proxy, keeping the private net isolated.|
|Authorization pattern / Network segmentation|Differing functionalities, services and views to student, business, and administrator depending on the role. This protects the system both to the spread of unauthorized access to all of the system, as well as control functionality access.|

Tactics:
|Tactic|Description|
|-|-|
|Authentication pattern|Use of OAuth for the managing of user accounts to ensure user identity.|
|Input validation|Restrictions are applied to the worked information to avoid inadequate injections.|


### Performance and Scalability
#### Scenarios:
#### Scenario 1: the software system must implement the Load Balancer Pattern.
Source: 2000 concurrent users. Stimulus: Multiple users simultaneously send requests to the system. Artifact: Load balancer positioned in front of a pool of backend service instances. Response: The load balancer distributes incoming requests evenly across available instances, ensuring no single instance is overwhelmed and overall system responsiveness is maintained under high concurrency.

#### Scenario 2: the software system must implement Horizontal Scaling.
Source: System administrator. Stimulus: Administrator detects increased traffic load and initiates the addition of more service instances. Artifact: Container orchestration platform or infrastructure layer managing service deployment Kubernetes). Response: The system provisions and deploys additional instances of the affected service, integrates them into the load balancer, and begins routing traffic to them, improving throughput and reducing response time.

#### Applied patterns and tactics

|Pattern|Description|
|-|-|
|Load Balancing Pattern|With the use of the API Gateway, as well with the slight amount of support provided by the reverse proxy, the requests that are handled within the private net are distributed as best as the components allow.|
|Bulkhead Pattern|The separation of services allows for components of the system to continue operating for certain roles in the case of maintnance or failure in any given microservice.|
|Horizontal scaling|With the division of services defined to the roles of users we expect, were it needed to contemplate a new whole role it is possible to add another branch upon the API Gateway, or to include more services for specific roles.|

|Tactic|Description|
|-|-|
|Statelessness|The services do not store session or user-specific state locally, meaning that new service instances can be added or removed without worrying about where the state lives.|
|Batching| The API Gateway, as a load balancer, groups multiple operations or requests together and process them as a single unit, which reduces the overhead of repeated operations, minimizing latency and improving throughput.|

## Testing (Analysis and Results)

![image](https://github.com/user-attachments/assets/e5dcb3c4-ea7b-4395-b833-c08cfe839aa3)

We tried to make the test with the tool used on the laboratory, however, since Jmeter is not compatible in a friendly manner with Mongo and FastAPI, we decided to run the tests directly in PowerShell,.
We conducted a series of load tests on our load-balanced microservices architecture, focusing on scalability, throughput, and stability. Below are the key results:

#### 1. Scalability

- Response time increased from *29.7ms to 76.7ms* when scaling from 1 to 2000 concurrent users — a *158% increase*, well below typical degradation levels.
- The system scaled smoothly with *no knee point* observed.

---

#### 2. Load Balancing Effectiveness

- Response times remained under *85ms* at all load levels.  
- *Low variance* across test runs confirms consistent and predictable performance.  
- Load was evenly distributed across all instances, with *no bottlenecks* detected.

---

#### 3. Throughput

- Throughput improved linearly: *363.3 → 618.3 transactions/min* (*+70%*).
- Performance peaked at 2000 users, indicating potential for handling higher traffic.

---

#### Key Technical Findings

- *The algorithm strategy* proved effective across three service instances.
- *API Gateway* introduced minimal overhead.
- System remained stable across all scenarios: *no memory leaks, **no connection issues*.

### Reliability
#### Scenario 1: the software system must implement the Replication Pattern.
Source: Internal service. Stimulus: A server instance hosting the service fails or becomes unresponsive. Artifact: Replicated service instances distributed across multiple nodes.
Response: The system reroutes requests to healthy replica instances without interrupting service availability. Failover mechanisms ensure continued operation while the failed instance is either restarted or replaced.
#### Scenario 2: the software system must implement the Service Discovery Pattern.
Source: Internal microservice. Stimulus: A microservice attempts to communicate with another service whose location (IP/port) may have changed due to scaling or redeployment. Artifact: Service discovery mechanism (e.g., service registry and discovery client). Response: The discovery client queries the service registry to obtain the current network location of the  target service. If the location has changed, the registry provides the updated endpoint, allowing communication to proceed without manual reconfiguration.
#### Scenario 3: the software system must implement the Cluster Pattern.
Source: External users. Stimulus: A large volume of concurrent requests is sent to a backend service. Artifact: Cluster of service instances managed under a load balancer or orchestration platform. Response: The load balancer distributes incoming requests evenly across the clustered instances. If an instance becomes unavailable, requests are rerouted to healthy nodes in the cluster, maintaining service continuity.
#### Scenario 4: the software system must implement the Circuit Breaker Pattern(?).
Source: Internal microservice. Stimulus: The service attempts repeated calls to a downstream dependency that is experiencing high latency or failure. Artifact: Circuit breaker module integrated into the service communication logic. Response: After a predefined threshold of failures is reached, the circuit breaker transitions to the open state, temporarily halting requests to the failing dependency and returning fallback responses or errors immediately. After a cool-down period, it transitions to a half-open state to test if the dependency has recovered.

<img width="769" height="932" alt="image" src="https://github.com/user-attachments/assets/4ce97b69-bb44-4d5d-9347-2a193d3c8e5d" />

### Interoperability
#### Scenario 1: the software system must implement a canonical data model between databases.
Source: Internal business service. Stimulus: A service attempts to read data from a MongoDB database and write related information to a MySQL database. Artifact: Canonical Data Model used as an intermediary schema for translating and mapping data between heterogeneous databases. Response: Data is first transformed into a standardized canonical format before being interpreted or written by the target system, ensuring semantic consistency and structural compatibility across both databases.

<img width="1347" height="317" alt="image" src="https://github.com/user-attachments/assets/db8d5f5c-b006-472c-8eba-755f08a53a05" />

## System Architecture Overview

### Architectural Styles Used

#### 1. Microservices Architecture
- The system follows the microservices pattern, where each service encapsulates a specific business domain.
- Services are independently deployable, scalable, and loosely coupled, with separate databases.

#### 2. API Gateway Pattern
- An API Gateway serves as a single entry point for mobile clients, handling routing and orchestration.
- For web clients, routing is handled by Server-Side Rendering (Next.js), which communicates directly with internal services.

#### 3. Polyglot Persistence
- The system employs different database technologies to suit varying data needs:
  - MySQL: Used by the Business Service for relational and transactional data.
  - MongoDB: Used by the Student and Admin Services for flexible, semi-structured data.

### Architectural Elements and Relations

#### Presentation Layer

- **Web Frontend (React + Next.js)**
  - Responsive user interface for students and companies.
  - Uses Server-Side Rendering for performance and SEO.
  - Auth0 is used for authentication and token handling.

- **Mobile Frontend (Flutter)**
  - Native-like experience.
  - Communicates exclusively via the API Gateway.
  - Secured using Auth0 tokens.

#### Interface / Gateway Layer

- **API Gateway (Node.js / Express)**
  - Single entry point for mobile traffic.
  - Routes and orchestrates requests to the correct microservice (Student, Business, Admin).
  - Handles token verification and basic access control.

#### Application Logic Layer (Microservices)

- **Student Service (Node.js)**
  - Manages student profiles, preferences, and applications.
  - Exposes REST endpoints.
  - Deployed behind an NGINX Proxy.
  - Persists data in MongoDB.

- **Business Service (Laravel / PHP)**
  - Manages internship offers (create, update, search, delete).
  - Uses MySQL for structured data.
  - Publishes events to a Broker for async workflows.

- **Admin Service (Python)**
  - Handles admin features: user moderation, data curation, reporting.
  - Uses MongoDB and communicates via a Broker for event-driven tasks.

#### Data Layer

- **MongoDB [Students]**
  - Stores student-related data (profiles, applications).

- **MySQL [Business]**
  - Stores relational data for internship offers and companies.

- **MongoDB [Admin]**
  - Stores admin metadata, logs, and system-level settings.

- **Brokers (Queue/Message Bus)**
  - Used by the Business and Admin Services.
  - Enables asynchronous communication and background processing.


## Prototype

### Instructions for Deploying the System Locally

#### Prerequisites
- Docker and Docker Compose installed
- Git

#### Deployment Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/username/prakticum-connect.git
   cd prakticum-connect
   ```

2. **Build and Start the Containers**
   ```bash
   docker-compose up -d
   ```
   
3. **Build and Start Administrator Service**
   ```bash
   docker-compose up --build -d
   ```
   
4. **Verify the Deployment**
   ```bash
   docker-compose ps
   ```

5. **Access the Services**
   - Frontend: http://localhost:3000
   - API Gateway ADMIN: http://localhost:8000
   - API Documentation (Swagger): http://localhost:8000/docs

To build and run the Docker image, run `exec.sh`, or `exec.ps1` on Windows.

### Run your tests

```bash
npm run build
```
