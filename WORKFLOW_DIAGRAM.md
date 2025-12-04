# CampusCook - Workflow Diagrams

## 1. System Architecture

```mermaid
graph TB
    User[User Browser] --> Frontend[React Frontend]
    Frontend --> API[Express.js Backend API]
    API --> Auth[JWT Authentication]
    API --> DB[(MongoDB Database)]
    
    subgraph Frontend Layer
        Frontend --> Pages[Pages]
        Frontend --> Components[Components]
        Frontend --> Context[Auth Context]
    end
    
    subgraph Backend Layer
        API --> Routes[Routes]
        Routes --> Middleware[Auth Middleware]
        Routes --> Controllers[Controllers]
        Controllers --> Models[Mongoose Models]
        Models --> DB
    end
    
    subgraph Database
        DB --> Users[Users Collection]
        DB --> Recipes[Recipes Collection]
        DB --> Categories[Categories Collection]
        DB --> Favorites[Favorites Collection]
        DB --> Ratings[Ratings Collection]
    end
```

## 2. User Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB
    
    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/auth/signup or /login
    Backend->>DB: Check/Create user
    DB-->>Backend: User data
    Backend->>Backend: Hash password (signup)
    Backend->>Backend: Generate JWT token
    Backend-->>Frontend: Return token + user data
    Frontend->>Frontend: Store token in localStorage
    Frontend-->>User: Redirect to home
    
    Note over Frontend,Backend: All subsequent requests include token
    Frontend->>Backend: Request with Authorization header
    Backend->>Backend: Verify JWT token
    Backend-->>Frontend: Protected resource
```

## 3. Recipe Creation Flow

```mermaid
flowchart TD
    Start([User clicks Add Recipe]) --> Login{User logged in?}
    Login -->|No| Redirect[Redirect to Login]
    Login -->|Yes| Form[Show Recipe Form]
    Form --> Fill[User fills form]
    Fill --> Validate{Client validation}
    Validate -->|Invalid| Error1[Show validation errors]
    Error1 --> Fill
    Validate -->|Valid| Submit[Submit to API]
    Submit --> API[POST /api/recipes]
    API --> Auth{Verify JWT}
    Auth -->|Invalid| Error2[401 Unauthorized]
    Auth -->|Valid| ServerValidate{Server validation}
    ServerValidate -->|Invalid| Error3[400 Bad Request]
    ServerValidate -->|Valid| Save[Save to MongoDB]
    Save --> Response[201 Created]
    Response --> Redirect2[Redirect to recipe detail]
    Redirect2 --> End([Recipe displayed])
```

## 4. Recipe Search & Filter Flow

```mermaid
flowchart LR
    User[User Input] --> Search[Search Term]
    User --> Filter[Category Filter]
    User --> Sort[Sort Option]
    User --> Page[Page Number]
    
    Search --> Query[Build Query String]
    Filter --> Query
    Sort --> Query
    Page --> Query
    
    Query --> API[GET /api/recipes?params]
    API --> Backend[Backend Processing]
    
    Backend --> SearchDB[Search in DB]
    Backend --> FilterDB[Filter by category]
    Backend --> SortDB[Sort results]
    Backend --> Paginate[Paginate results]
    
    SearchDB --> Results[Combined Results]
    FilterDB --> Results
    SortDB --> Results
    Paginate --> Results
    
    Results --> Response[JSON Response]
    Response --> Frontend[Display Recipes]
```

## 5. Recipe Rating Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB
    
    User->>Frontend: Open recipe detail
    Frontend->>Backend: GET /api/recipes/:id
    Backend->>DB: Fetch recipe + ratings
    DB-->>Backend: Recipe data
    Backend-->>Frontend: Recipe with avg rating
    Frontend-->>User: Display recipe + rating form
    
    User->>Frontend: Submit rating (1-5 stars + review)
    Frontend->>Backend: POST /api/ratings/:recipeId
    Backend->>Backend: Verify JWT token
    Backend->>DB: Check existing rating
    
    alt Rating exists
        DB-->>Backend: Existing rating
        Backend->>DB: Update rating
    else No rating
        Backend->>DB: Create new rating
    end
    
    DB-->>Backend: Rating saved
    Backend->>DB: Recalculate average
    Backend-->>Frontend: Success response
    Frontend->>Frontend: Refresh ratings
    Frontend-->>User: Show updated rating
```

## 6. Favorites Management Flow

```mermaid
stateDiagram-v2
    [*] --> ViewRecipe: User views recipe
    ViewRecipe --> CheckAuth: Click favorite button
    
    CheckAuth --> NotLoggedIn: No token
    CheckAuth --> CheckFavorite: Has token
    
    NotLoggedIn --> Login: Redirect
    Login --> ViewRecipe: After login
    
    CheckFavorite --> IsFavorited: Check status
    CheckFavorite --> NotFavorited: Check status
    
    IsFavorited --> RemoveFavorite: DELETE /api/favorites/:id
    RemoveFavorite --> UpdateUI: Remove from favorites
    
    NotFavorited --> AddFavorite: POST /api/favorites/:id
    AddFavorite --> UpdateUI: Add to favorites
    
    UpdateUI --> ViewRecipe: Update heart icon
    ViewRecipe --> [*]
```

## 7. Admin Recipe Management Flow

```mermaid
flowchart TD
    Admin[Admin User] --> Dashboard[Admin Dashboard]
    Dashboard --> View[View All Recipes]
    
    View --> Action{Choose Action}
    
    Action -->|Edit| Edit[Edit Any Recipe]
    Edit --> Update[PUT /api/recipes/:id]
    Update --> Verify{Verify Admin Role}
    Verify -->|Not Admin| Error[403 Forbidden]
    Verify -->|Admin| SaveEdit[Save Changes]
    SaveEdit --> Success1[Recipe Updated]
    
    Action -->|Delete| Delete[Delete Recipe]
    Delete --> Confirm{Confirm Delete?}
    Confirm -->|No| View
    Confirm -->|Yes| DeleteAPI[DELETE /api/recipes/:id]
    DeleteAPI --> VerifyAdmin{Verify Admin Role}
    VerifyAdmin -->|Not Admin| Error
    VerifyAdmin -->|Admin| Cascade[Cascade Delete]
    Cascade --> DelFav[Delete Favorites]
    Cascade --> DelRating[Delete Ratings]
    Cascade --> DelRecipe[Delete Recipe]
    DelRecipe --> Success2[Recipe Deleted]
    
    Success1 --> Dashboard
    Success2 --> Dashboard
```

## 8. Complete User Journey

```mermaid
journey
    title College Student Using CampusCook
    section Discovery
      Visit website: 5: Student
      Browse recipes: 4: Student
      Search for quick recipes: 5: Student
      Filter by easy difficulty: 5: Student
    section Engagement
      Signup for account: 4: Student
      Login: 5: Student
      View recipe details: 5: Student
      Save to favorites: 5: Student
    section Contribution
      Try recipe: 5: Student
      Rate recipe 5 stars: 5: Student
      Write review: 4: Student
      Share own recipe: 5: Student
    section Community
      View own recipes: 5: Student
      Check ratings received: 5: Student
      Browse favorites: 5: Student
      Discover new recipes: 5: Student
```

## 9. Data Flow Diagram

```mermaid
graph LR
    subgraph Client
        UI[User Interface]
        State[Application State]
    end
    
    subgraph API Layer
        Routes[API Routes]
        Auth[Auth Middleware]
        Controllers[Controllers]
    end
    
    subgraph Data Layer
        Models[Mongoose Models]
        DB[(MongoDB)]
    end
    
    UI -->|HTTP Request| Routes
    Routes -->|Verify Token| Auth
    Auth -->|Authorized| Controllers
    Controllers -->|Query/Update| Models
    Models -->|CRUD Operations| DB
    DB -->|Data| Models
    Models -->|Response| Controllers
    Controllers -->|JSON| Routes
    Routes -->|HTTP Response| UI
    UI -->|Update| State
    State -->|Render| UI
```

## 10. Recipe CRUD Operations

```mermaid
graph TD
    subgraph CREATE
        C1[User fills form] --> C2[POST /api/recipes]
        C2 --> C3[Validate data]
        C3 --> C4[Save to DB]
        C4 --> C5[Return recipe]
    end
    
    subgraph READ
        R1[Browse recipes] --> R2[GET /api/recipes]
        R2 --> R3[Query with filters]
        R3 --> R4[Return paginated list]
        
        R5[View details] --> R6[GET /api/recipes/:id]
        R6 --> R7[Fetch recipe + ratings]
        R7 --> R8[Return full details]
    end
    
    subgraph UPDATE
        U1[Edit recipe] --> U2[PUT /api/recipes/:id]
        U2 --> U3[Verify ownership]
        U3 --> U4[Update in DB]
        U4 --> U5[Return updated recipe]
    end
    
    subgraph DELETE
        D1[Delete recipe] --> D2[DELETE /api/recipes/:id]
        D2 --> D3[Verify admin role]
        D3 --> D4[Cascade delete]
        D4 --> D5[Remove from DB]
        D5 --> D6[Return success]
    end
```

## 11. Error Handling Flow

```mermaid
flowchart TD
    Request[API Request] --> Auth{Authenticated?}
    Auth -->|No Token| E401[401 Unauthorized]
    Auth -->|Invalid Token| E401
    Auth -->|Valid| Authorize{Authorized?}
    
    Authorize -->|No Permission| E403[403 Forbidden]
    Authorize -->|Yes| Validate{Valid Data?}
    
    Validate -->|Invalid| E400[400 Bad Request]
    Validate -->|Valid| Process[Process Request]
    
    Process --> Exists{Resource Exists?}
    Exists -->|No| E404[404 Not Found]
    Exists -->|Yes| Execute[Execute Operation]
    
    Execute --> Duplicate{Duplicate?}
    Duplicate -->|Yes| E409[409 Conflict]
    Duplicate -->|No| Success[200/201 Success]
    
    Execute --> ServerError{Server Error?}
    ServerError -->|Yes| E500[500 Internal Error]
    ServerError -->|No| Success
    
    E401 --> ErrorResponse[Error JSON Response]
    E403 --> ErrorResponse
    E400 --> ErrorResponse
    E404 --> ErrorResponse
    E409 --> ErrorResponse
    E500 --> ErrorResponse
    Success --> SuccessResponse[Success JSON Response]
```

---

## Technology Stack Flow

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           React Frontend (Port 3001)              │  │
│  │  • React Router  • Axios  • TailwindCSS          │  │
│  │  • Auth Context  • Components  • Pages           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│              Express.js Backend (Port 3000)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Routes → Middleware → Controllers → Models      │  │
│  │  • JWT Auth  • bcrypt  • CORS  • Compression    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ MongoDB Protocol
┌─────────────────────────────────────────────────────────┐
│                  MongoDB Database                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Collections: users, recipes, categories,        │  │
│  │              favorites, ratings                  │  │
│  │  • Mongoose ODM  • Indexes  • Validation        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

