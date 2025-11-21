# AI 霓裳 (AI Fashion Try-On)

基于 Gemini Nano Banana 模型构建的 AI 智能换装应用。

## 前置条件

你需要一个 Google Gemini API Key。
API Key 获取地址: [Google AI Studio](https://aistudiocdn.com/google-ai-studio)

## 1. 本地开发 (Local Development)

确保已安装 Node.js (v18+)。

```bash
# 安装依赖
npm install

# 设置 API Key (Linux/Mac)
export API_KEY="your_api_key_here"

# 或者在 Windows PowerShell
$env:API_KEY="your_api_key_here"

# 启动开发服务器
npm run dev
```

访问: `http://localhost:3000`

---

## 2. Docker 部署

### 构建镜像

由于这是一个纯前端静态应用，环境变量需要在**构建时**注入（或者需要在运行时配置复杂的 ConfigMap 注入方案）。

```bash
docker build --build-arg API_KEY=your_real_api_key_here -t ai-fashion-app .
```

### 运行容器

```bash
docker run -d -p 8080:80 --name ai-fashion ai-fashion-app
```

访问: `http://localhost:8080`

---

## 3. Docker Compose 一键部署

在项目根目录创建 `.env` 文件：

```env
API_KEY=your_api_key_here
```

然后运行：

```bash
docker-compose up -d --build
```

访问: `http://localhost:8080`

---

## 4. Kubernetes (K8s) 部署

1.  **构建并推送镜像**:
    你需要将镜像推送到你的容器镜像仓库（Registry）。

    ```bash
    docker build --build-arg API_KEY=your_key -t your-registry/ai-fashion:v1 .
    docker push your-registry/ai-fashion:v1
    ```

2.  **修改配置**:
    修改 `k8s-deployment.yaml` 中的 `image` 字段为你刚才推送的镜像地址。

3.  **应用配置**:

    ```bash
    kubectl apply -f k8s-deployment.yaml
    ```

4.  **验证**:

    ```bash
    kubectl get pods
    kubectl get services
    ```
