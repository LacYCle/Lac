# Courser - 在线网课学习平台

## 项目简介

Courser 是一个基于前后端分离架构的在线网课学习平台。旨在为用户提供便捷的课程浏览、学习和管理体验。平台支持用户注册登录、课程搜索、课程详情查看、视频在线播放以及课程表的上传和解析等功能。

## 功能特性

*   **用户认证**：安全的用户注册和登录系统（基于 JWT）。
*   **课程管理**：展示课程列表，支持课程搜索和详情查看。
*   **视频播放**：集成视频播放功能，支持在线学习。
*   **课程表上传与解析**：支持上传 CSV/Excel 格式的课程表，并利用 AI 服务进行智能解析。
*   **用户互动**：支持课程收藏和观看记录。
*   **响应式设计**：界面适配不同设备。
*   **API 服务**：提供清晰的 RESTful API 供前端调用。

## 技术栈

**前端 (client)**

*   HTML5, CSS3
*   原生 JavaScript
*   jQuery
*   Bootstrap 5
*   Font Awesome (图标库)

**后端 (server)**

*   Node.js
*   Express.js (Web 框架)
*   MySQL (数据库)
*   Multer (文件上传)
*   jsonwebtoken (JWT 认证)
*   bcrypt (密码加密)
*   cors, morgan, cookie-parser (常用中间件)
*   express-validator (请求数据验证)
*   dotenv (环境变量管理)
*   winston (日志记录)
*   csv-parser, xlsx (文件解析)
*   openai (Deepseek API 交互)

## 项目结构

.env
.idea/
LICENSE.md
README.md
client/
├── css/
│   └── styles.css
├── index.html
├── js/
│   ├── api.js
│   ├── app.js
│   ├── auth.js
│   ├── courses.js
│   └── settings.js
├── libs/
│   ├── bootstrap/
│   └── jquery/
├── package-lock.json
└── package.json
server/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── courseController.js
│   └── videoController.js
├── data/
├── index.js
├── logs/
│   ├── combined.log
│   └── error.log
├── middleware/
│   ├── auth.js
│   └── upload.js
├── models/
│   ├── Course.js
│   ├── User.js
│   └── Video.js
├── package-lock.json
├── package.json
├── services/
│   ├── deepseekService.js
│   ├── fileParserService.js
│   └── searchService.js
├── uploads/
└── utils/
    ├── logger.js
    └── validators.js

## 环境设置

在开始之前，请确保您的系统已安装以下软件：

*   Node.js (推荐 LTS 版本)
*   npm (Node.js 安装时会一同安装)
*   MySQL 数据库

## 安装与运行

请按照以下步骤设置和运行项目：

1.  **克隆仓库**：
    ```bash
    git clone <您的仓库地址>
    cd Lac
    ```

2.  **后端设置**：
    进入 `server` 目录并安装依赖：
    ```bash
    cd server
    npm install
    ```
    配置数据库连接：
    编辑 `server/config/db.js` 文件，根据您的 MySQL 配置更新数据库连接信息。
    ```javascript:server%2Fconfig%2Fdb.js
    // ... existing code ...
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'your_mysql_user',
        password: 'your_mysql_password',
        database: 'your_database_name'
    });
    // ... existing code ...
    ```
    启动后端服务：
    ```bash
    npm start
    ```
    后端服务默认运行在 `http://localhost:3000`。

3.  **前端设置**：
    进入 `client` 目录并安装依赖：
    ```bash
    cd ../client
    npm install bootstrap@5 jquery
    ```
    更新 `client/index.html` 以引用本地 `node_modules` 中的 Bootstrap 和 jQuery：
    ```html:client%2Findex.html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Courser</title>
        <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="css/styles.css">
    </head>
    <body>
        <!-- ... existing code ... -->

        <!-- jQuery -->
        <script src="node_modules/jquery/dist/jquery.min.js"></script>
        <!-- Bootstrap JS -->
        <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
        <script src="js/api.js"></script>
        <script src="js/auth.js"></script>
        <script src="js/courses.js"></script>
        <script src="js/settings.js"></script>
        <script src="js/app.js"></script>
    </body>
    </html>
    ```
    启动前端服务（您可以使用任何静态文件服务器，例如 `http-server`）：
    ```bash
    npx http-server .
    ```
    前端服务默认运行在 `http://localhost:8080`。

## 使用指南

1.  打开浏览器访问前端地址 (例如 `http://localhost:8080`)。
2.  注册新用户或使用现有账户登录。
3.  浏览课程，观看视频，上传文件，并管理您的个人设置。