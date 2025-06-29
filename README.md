# ExpressBolt ⚡

[![npm version](https://badge.fury.io/js/expressbolt.svg)](https://badge.fury.io/js/expressbolt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/derekzyl/expressbolt.svg?style=social&label=Star)](https://github.com/derekzyl/expressbolt)

> A powerful middleware layer for Express.js that simplifies CRUD operations with MongoDB and Mongoose. Build RESTful APIs faster with type-safe operations, automatic error handling, and advanced querying capabilities.

## ✨ Key Features

- 🔥 **Simplified CRUD Operations** - Create, read, update, and delete with minimal boilerplate
- 🛡️ **Type Safety** - Full TypeScript support with strict type checking
- 📊 **Advanced Querying** - Built-in filtering, sorting, pagination, and population
- 🎯 **Dynamic Schema Generation** - Generate Mongoose schemas from TypeScript interfaces
- ⚡ **Error Handling** - Graceful error handling with environment-aware responses
- 🔌 **Middleware Integration** - Seamless Express.js middleware compatibility

## 📦 Installation

```bash
npm install expressbolt
```

## 🚀 Quick Start

### 1. Define Your Interface

```typescript
interface UserI {
  name: string;
  email: string;
  password: string;
}

interface UserDocI extends mongoose.Document, UserI {}

interface UserModelI {
  isEmailTaken(email: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<any>;
}
```

### 2. Create Your Model

```typescript
import { generateDynamicSchema } from 'expressbolt';
import { model } from 'mongoose';

const userModel = generateDynamicSchema<UserI, UserModelI>({
  modelName: "USER",
  fields: {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  schemaOptions: {
    timestamps: true,
  },
  model: model, // Required for MongoDB sync
});
```

### 3. Use CrudController in Routes

```typescript
import { CrudController } from 'expressbolt';
import { Request, Response, NextFunction } from 'express';

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  const crud = new CrudController({
    next,
    request: req,
    response: res,
    env: "production",
    useNext: false,
  });

  await crud.getMany<UserI>({
    modelData: { Model: userModel.model, select: ["-password"] },
    filter: { name: req.body.name },
    populate: {},
    query: req.query,
  });
}
```

## 📚 API Reference

### CrudController

The main controller class for handling HTTP requests with CRUD operations.

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `request` | `Request` | - | Express request object |
| `response` | `Response` | - | Express response object |
| `next` | `NextFunction` | - | Express next function |
| `env` | `"development" \| "production"` | `"development"` | Environment mode |
| `useNext` | `boolean` | `false` | Whether to use next() for error handling |

#### Methods

##### `create<T, U>(options)`
Creates a new document in the database.

```typescript
await crud.create<UserI>({
  modelData: { Model: userModel.model, select: ["-password"] },
  data: userData,
  check: { email: userData.email } // Prevent duplicates
});
```

##### `getMany<T>(options)`
Fetches multiple documents with advanced querying.

```typescript
await crud.getMany<UserI>({
  modelData: { Model: userModel.model, select: ["-password"] },
  filter: { active: true },
  populate: { path: "profile", fields: ["firstName", "lastName"] },
  query: req.query // Supports ?page=1&limit=10&sort=name&fields=name,email
});
```

##### `getOne<T>(options)`
Retrieves a single document.

```typescript
await crud.getOne<UserI>({
  modelData: { Model: userModel.model, select: ["-password"] },
  data: { _id: userId },
  populate: {}
});
```

##### `update<T, U>(options)`
Updates an existing document.

```typescript
await crud.update<UserI>({
  modelData: { Model: userModel.model, select: ["-password"] },
  data: updateData,
  filter: { _id: userId }
});
```

##### `delete<T>(options)`
Deletes documents from the database.

```typescript
await crud.delete<UserI>({
  modelData: { Model: userModel.model },
  data: { _id: userId }
});
```

### CrudService

For more control over responses, use CrudService directly:

```typescript
import { CrudService } from 'expressbolt';

export async function createUser(user: UserI) {
  try {
    const userCreate = await CrudService.create<UserI>({
      check: { email: user.email },
      data: user,
      modelData: { Model: userModel.model, select: ["-password"] },
    });
    return userCreate;
  } catch (error) {
    // Handle error yourself
    throw error;
  }
}
```

### Advanced Population

Support for nested population:

```typescript
// Single level population
populate: { path: "author", fields: ["name", "email"] }

// Multi-level population
populate: [
  { path: "author", fields: ["name"] },
  { 
    path: "category", 
    fields: ["name", "image"],
    second_layer_populate: { path: "parent", select: "name" }
  }
]
```

### Query Parameters

ExpressBolt automatically handles these query parameters:

- `?page=2&limit=10` - Pagination
- `?sort=name,-createdAt` - Sorting (prefix with `-` for descending)
- `?fields=name,email` - Field selection
- `?name=john&active=true` - Filtering

## 🔧 Error Handling

### Global Error Handler

```typescript
import { errorCenter } from 'expressbolt';

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorCenter({
    env: process.env.NODE_ENV as "production" | "development",
    error: err,
    response: res,
  });
});
```

### Response Format

Success Response:
```json
{
  "message": "Users fetched successfully",
  "data": [...],
  "success": true,
  "doc_length": 25
}
```

Error Response:
```json
{
  "message": "Validation failed",
  "error": "Email already exists",
  "success": false,
  "stack": {} // Only in development mode
}
```

## 🏗️ Complete Example

<details>
<summary>Click to see a full blog application example</summary>

```typescript
import express, { Express, NextFunction, Request, Response } from "express";
import {
  CrudController,
  CrudService,
  errorCenter,
  generateDynamicSchema,
} from "expressbolt";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { model } from 'mongoose';

// User Interface
interface UserI {
  name: string;
  email: string;
  password: string;
}

// Blog Interface
interface BlogI {
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  title: string;
  content: string;
  likes: number;
}

// Create User Model
const userModel = generateDynamicSchema<UserI, any>({
  modelName: "USER",
  fields: {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
  },
  schemaOptions: { timestamps: true },
  model: model,
});

const { model: USER, schema: userSchema } = userModel;

// Hash password before saving
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Create Blog Model
const blogModel = generateDynamicSchema<BlogI, any>({
  modelName: "BLOG",
  fields: {
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "USER" },
    category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "CATEGORY" },
    title: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
  },
  schemaOptions: { timestamps: true },
  model: model,
});

const { model: BLOG } = blogModel;

// Routes
export async function getAllBlogs(req: Request, res: Response, next: NextFunction) {
  const crud = new CrudController({
    next, request: req, response: res,
    env: process.env.NODE_ENV as "production" | "development",
    useNext: false,
  });

  await crud.getMany<BlogI>({
    modelData: { Model: BLOG, select: ["-__v"] },
    populate: [
      { path: "author", fields: ["name"] },
      { path: "category", fields: ["name"] },
    ],
    query: req.query,
  });
}

export async function createBlog(req: Request, res: Response, next: NextFunction) {
  const crud = new CrudController({
    next, request: req, response: res,
    env: process.env.NODE_ENV as "production" | "development",
    useNext: false,
  });

  await crud.create<BlogI>({
    modelData: { Model: BLOG, select: ["-__v"] },
    data: { ...req.body, author: req.user.id },
    check: { title: req.body.title }
  });
}

const app: Express = express();

app.use(express.json());
app.get("/blogs", getAllBlogs);
app.post("/blogs", createBlog);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorCenter({
    env: process.env.NODE_ENV as "production" | "development",
    error: err,
    response: res,
  });
});

export default app;
```

</details>

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⭐ Show Your Support

If ExpressBolt helps you build better APIs faster, please consider giving it a star on [GitHub](https://github.com/derekzyl/expressbolt)!

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/derekzyl">Derek</a></p>
</div>
