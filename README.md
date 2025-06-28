# 🗄️ Extra Memory - Backend API

A robust Node.js backend API for the Extra Memory second brain application. Built with Express.js, MongoDB, and TypeScript to provide secure content management, user authentication, and content sharing capabilities.

## 🚀 Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication system
- **Password Hashing**: bcrypt for secure password storage
- **User Registration**: Account creation with validation
- **Protected Routes**: Middleware-based route protection
- **CORS Support**: Cross-origin resource sharing configuration

### 📝 Content Management
- **Multi-format Content**: Support for text, images, videos, audio, and links
- **CRUD Operations**: Create, read, update, and delete content
- **User Isolation**: Users can only access their own content
- **Content Validation**: Type-safe content creation and updates

### 🏷️ Tag System
- **Smart Tag Management**: Automatic tag creation and resolution
- **Tag Relationships**: MongoDB ObjectId references for data integrity
- **Tag Cleanup**: Automatic removal of unused tags
- **Tag Discovery**: Retrieve all available tags

### 🤝 Content Sharing
- **Brain Sharing**: Share entire content collections publicly
- **Privacy Controls**: Enable/disable sharing per user
- **Read-only Access**: Shared content is view-only for visitors
- **Secure Links**: Protected sharing endpoints

### 📊 Data Management
- **MongoDB Integration**: Mongoose ODM for database operations
- **Schema Validation**: Structured data models
- **Relationship Management**: Proper foreign key relationships
- **Data Integrity**: Referential integrity with cleanup operations

## 🛠️ Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe JavaScript development
- **MongoDB** - NoSQL document database
- **Mongoose** - MongoDB object modeling

### Security & Validation
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt** - Password hashing and verification
- **Zod** - Runtime type validation and parsing
- **CORS** - Cross-origin resource sharing middleware

### Development Tools
- **TypeScript Compiler** - Static type checking and compilation
- **dotenv** - Environment variable management
- **cookie-parser** - HTTP cookie parsing middleware

## 📁 Project Structure

```
src/
├── server.ts           # Main server file with all routes
├── db.ts              # Database models and schemas
├── middleware.ts      # Authentication middleware
└── types/            # TypeScript type definitions

dist/                 # Compiled JavaScript output
├── server.js
├── db.js
└── middleware.js

.env                  # Environment variables (not in repo)
.env.example         # Environment variables template
package.json         # Dependencies and scripts
tsconfig.json        # TypeScript configuration
```

## 📋 Database Schema

### User Model
```typescript
{
  username: String (unique, required)
  password: String (hashed, required)
  share: Boolean (default: false)
}
```

### Content Model
```typescript
{
  link: String (content URL or text)
  type: String (enum: 'text', 'image', 'video', 'audio', 'link')
  title: String (required)
  tags: [ObjectId] (references to Tag model)
  userId: ObjectId (reference to User model)
}
```

### Tag Model
```typescript
{
  title: String (unique, required)
}
```

## 🛣️ API Endpoints

### Authentication Routes

#### User Registration
```http
POST /api/v1/signup
Content-Type: application/json

{
  "username": "user123",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "message": "Signed Up"
}
```

#### User Login
```http
POST /api/v1/signin
Content-Type: application/json

{
  "username": "user123",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "message": "Signed In",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Content Management Routes

#### Create Content
```http
POST /api/v1/content
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "My Article",
  "link": "https://example.com/article",
  "type": "link",
  "tags": ["javascript", "tutorial", "web-development"]
}

Response: 200 OK
{
  "message": "Content added successfully",
  "userId": "user_id"
}
```

#### Get User Content
```http
GET /api/v1/content
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "contents": [
    {
      "_id": "content_id",
      "title": "My Article",
      "link": "https://example.com/article",
      "type": "link",
      "tags": [
        {
          "_id": "tag_id",
          "title": "javascript"
        }
      ],
      "userId": {
        "_id": "user_id",
        "username": "user123"
      }
    }
  ]
}
```

#### Delete Content
```http
DELETE /api/v1/content
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "contentId": "content_id"
}

Response: 200 OK
{
  "message": "Content deleted successfully"
}
```

### Tag Management Routes

#### Get All Tags
```http
GET /api/v1/tags
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "message": "Tags retrieved successfully",
  "tags": ["javascript", "tutorial", "web-development", "react"]
}
```

#### Add Tag (Manual)
```http
POST /api/v1/addtag
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "new-tag"
}

Response: 200 OK
{
  "message": "new-tag tag is added"
}
```

### Content Sharing Routes

#### Enable Brain Sharing
```http
POST /api/v1/brain/share
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "message": "you can now share your contents",
  "shareableLink": "http://localhost:3000/api/v1/brain/user_id"
}
```

#### Disable Brain Sharing
```http
PUT /api/v1/brain/share
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "message": "Content Sharing is closed"
}
```

#### View Shared Brain
```http
GET /api/v1/brain/:userId

Response: 200 OK
{
  "message": "content found",
  "contents": [
    // Array of shared content objects
  ]
}
```

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_CONNECTION_STRING=mongodb://localhost:27017/

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL (for CORS and sharing links)
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=3000
```

### Environment Variables Explained

- **DATABASE_CONNECTION_STRING**: MongoDB connection URL (without database name)
- **JWT_SECRET**: Secret key for JWT token signing and verification
- **FRONTEND_URL**: Frontend application URL for CORS and shareable links
- **PORT**: Server port (optional, defaults to 3000)

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Extra-Memory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string
   ```

5. **Build and start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

6. **Verify server is running**
   ```bash
   curl http://localhost:3000/
   # Should return: http://localhost:3000/
   ```

## 🔒 Security Features

### Authentication Security
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Password Hashing**: bcrypt with salt rounds for secure storage
- **Input Validation**: Zod schemas for request validation
- **Protected Routes**: Middleware-based route protection

### Data Security
- **User Isolation**: Users can only access their own content
- **Ownership Validation**: Content operations require ownership verification
- **SQL Injection Prevention**: Mongoose ODM provides query sanitization
- **CORS Configuration**: Controlled cross-origin access

### Privacy Features
- **Optional Sharing**: Users control content visibility
- **Read-only Sharing**: Shared content cannot be modified by viewers
- **Secure Endpoints**: All sensitive operations require authentication

## 🔧 Middleware

### User Authentication Middleware
```typescript
// Located in src/middleware.ts
export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Extracts and verifies JWT token from Authorization header
  // Adds userId to request object for route handlers
  // Returns 401 for invalid/missing tokens
}
```

### CORS Configuration
```typescript
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 📊 Data Flow

### Content Creation Flow
1. Client sends POST request with content data
2. JWT middleware validates user authentication
3. Server processes tags (create new ones if needed)
4. Content is saved with tag ObjectId references
5. Success response sent to client

### Tag Management Flow
1. Tags are created automatically during content creation
2. Existing tags are reused via title lookup
3. Unused tags are cleaned up during content deletion
4. Tag relationships maintain data integrity

### Sharing Flow
1. User enables sharing via POST /api/v1/brain/share
2. User model updated with share: true
3. Public endpoint /api/v1/brain/:userId becomes accessible
4. Shared content is read-only for visitors

## 🧪 Testing

### Manual API Testing

Using curl or Postman:

```bash
# Register a user
curl -X POST http://localhost:3000/api/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123!"}'

# Login and get token
curl -X POST http://localhost:3000/api/v1/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123!"}'

# Create content (use token from login response)
curl -X POST http://localhost:3000/api/v1/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"title":"Test Content","link":"https://example.com","type":"link","tags":["test"]}'

# Get content
curl -X GET http://localhost:3000/api/v1/content \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Testing Checklist
- [ ] User registration with password validation
- [ ] User login with JWT token generation
- [ ] Content creation with tag processing
- [ ] Content retrieval with user filtering
- [ ] Content deletion with cleanup
- [ ] Tag management and cleanup
- [ ] Brain sharing enable/disable
- [ ] Public shared content access

## 🐛 Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "message": "Invalid or missing token"
}
```

**403 Forbidden**
```json
{
  "message": "Content with this contentId not present or you don't have permission to delete it"
}
```

**411 Validation Error**
```json
{
  "message": {
    "issues": [
      {
        "path": ["password"],
        "message": "Password must contain at least one uppercase letter"
      }
    ]
  }
}
```

**500 Internal Server Error**
```json
{
  "message": "Some Error while adding data",
  "error": "Detailed error information"
}
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Considerations
- Use strong JWT secrets in production
- Configure proper MongoDB connection strings
- Set appropriate CORS origins
- Use HTTPS in production
- Configure proper logging

### Deployment Options
- **Heroku**: Easy deployment with MongoDB Atlas
- **AWS EC2**: Full control with custom configuration
- **DigitalOcean**: Droplets with MongoDB setup
- **Railway**: Modern deployment platform
- **Render**: Simple deployment with database integration

## 📈 Performance Considerations

### Database Optimization
- **Indexing**: Automatic indexing on unique fields (username, tag titles)
- **Population**: Efficient data loading with Mongoose populate
- **Query Optimization**: Filtered queries for user-specific data

### Memory Management
- **Connection Pooling**: MongoDB connection optimization
- **Middleware Efficiency**: Lightweight authentication middleware
- **Error Handling**: Proper cleanup in error scenarios

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Validate all inputs with Zod schemas
3. Include proper error handling
4. Maintain database referential integrity
5. Write descriptive commit messages

### Code Style
- Use meaningful variable names
- Include JSDoc comments for complex functions
- Follow Express.js conventions
- Maintain consistent error response formats

## 📝 License

This project is licensed under the MIT License.

## 🔧 Troubleshooting

### Common Issues

**"JWT secret not configured"**
- Ensure JWT_SECRET is set in .env file
- Restart server after environment changes

**Database connection errors**
- Verify MongoDB is running
- Check DATABASE_CONNECTION_STRING in .env
- Ensure network connectivity to MongoDB

**CORS errors**
- Update CORS origin in server.ts
- Match frontend URL exactly
- Include necessary headers

**Token validation failures**
- Check token format in Authorization header
- Verify JWT_SECRET matches between sessions
- Ensure token hasn't expired

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review API documentation
- Create an issue in the repository

---

Built with 💪 using Node.js, Express.js, MongoDB, and TypeScript
