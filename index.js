const http = require("http")
const fs = require("fs")
const path = require("path")

const rootDir = __dirname
const port = Number(process.env.PORT) || 3000
const host = process.env.HOST || "127.0.0.1"

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
}

function resolveFilePath(requestUrl) {
  const { pathname } = new URL(requestUrl, "http://localhost")
  let safePath = decodeURIComponent(pathname)

  if (safePath.endsWith("/")) {
    safePath += "index.html"
  }

  const filePath = path.join(rootDir, safePath)

  if (!filePath.startsWith(rootDir)) {
    return null
  }

  return filePath
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath)
  const contentType = mimeTypes[ext] || "application/octet-stream"

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
        res.end("Arquivo não encontrado.")
      } else {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
        res.end("Erro interno do servidor.")
      }
      return
    }

    res.writeHead(200, { "Content-Type": contentType })
    res.end(content)
  })
}

const server = http.createServer((req, res) => {
  const filePath = resolveFilePath(req.url)

  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" })
    res.end("Acesso negado.")
    return
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
        res.end("Arquivo não encontrado.")
      } else {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
        res.end("Erro interno do servidor.")
      }
      return
    }

    if (stats.isDirectory()) {
      const indexFile = path.join(filePath, "index.html")
      fs.access(indexFile, fs.constants.R_OK, (accessErr) => {
        if (accessErr) {
          res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" })
          res.end("Acesso negado.")
          return
        }

        sendFile(res, indexFile)
      })
      return
    }

    sendFile(res, filePath)
  })
})

server.listen(port, host, () => {
  console.log(`Servidor rodando em http://${host}:${port}`)
})
