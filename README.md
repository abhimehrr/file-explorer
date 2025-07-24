# File Explorer

A simple Node.js, Express, and TypeScript-based file explorer backend. It provides an API to recursively read directories and files, and serves a basic login page as the frontend.

## Features

- Recursively reads and lists files and folders from specified directories.
- Ignores specified directories (e.g., `node_modules`).
- Serves static frontend files (currently a login page).
- Uses environment variables for configuration.
- Cookie parsing middleware included for future authentication/authorization.

## Folder Structure

```
file-explorer/
├── src/
│   ├── controller/
│   │   └── file-reader.controller.ts   # File reading logic and API
│   ├── server.ts                      # Main Express server
│   └── view/
│       ├── js/
│       │   └── script.js              # (empty, for future frontend logic)
│       └── login.html                 # Basic login page
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js (v16+ recommended)
- npm

## Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd file-explorer
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variable:

```
PORT=2000
```

- `PORT`: The port on which the server will run.

## Running the Project

### Development

Runs the server with hot-reloading using `nodemon` and `ts-node`:

```sh
npm run dev
```

### Production

1. Build the TypeScript code:
   ```sh
   npm run build
   ```
2. Start the server:
   ```sh
   npm start
   ```

## API Endpoints

### `GET /`

- Serves the `login.html` page.
- Example: [http://localhost:2000/](http://localhost:2000/)

### `GET /files`

- Returns a JSON object with the directory structure of the configured folders.
- Example response:
  ```json
  {
    "directories": {
      "some": [ ... ],
      "@root": [ ... ]
    }
  }
  ```
- The directories to be read are configured in `src/server.ts`:
  - `some`: Reads from `a:/f`
  - `@root`: Reads from the project root (`.`)
  - Both ignore the `node_modules` directory.

#### File/Folder Object Structure

Each file/folder object contains:
- `name`: File or folder name
- `type`: `"file"` or `"folder"`
- `size`: File size in bytes (null for folders)
- `path`: Full path
- `ext`: File extension (for files)
- `children`: Array of child files/folders (for folders)

## TypeScript

- Source code is in `src/`
- Compiled output is in `dist/`
- TypeScript configuration is in `tsconfig.json`

## License

This project is licensed under the ISC License.