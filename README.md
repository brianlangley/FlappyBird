# Phaser Game Project (Flappy Bird Clone)

## Table of Contents
- [Phaser Game Project (Flappy Bird Clone)](#phaser-game-project-flappy-bird-clone)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [About project](#about-project)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Development](#development)
    - [Serving the Project](#serving-the-project)
      - [Using `http-server` (optional)](#using-http-server-optional)
    - [Accessing the Project](#accessing-the-project)
  - [Build for Production](#build-for-production)
  - [License](#license)

## Getting Started

### About project

The goal of this project is to recreate Flappy Bird game using Phaser 3. The project is set up with Webpack for development.

### Prerequisites

- Node.js and npm installed on your machine.
- Optional: `http-server` or another local server for serving the `dist` directory.

### Installation

1. Clone the repository

2. Install npm dependencies:
   ```bash
   npm install
   ```

### Development

To start Webpack in watch mode and automatically rebuild your project on file changes:

```bash
npm run watch
```

This command enables Webpack to watch for changes in your source files and rebuild the project automatically.

### Serving the Project 

You can use the `npm run start` command to start the development server. This command will also enable Webpack to watch for changes in your source files and rebuild the project automatically.

```bash
npm run start
```

> Please make sure that you have a script named "start" in your `package.json` file that starts your server. For example: 
```json
"scripts": {
  "start": "webpack serve",
  "watch": "webpack --watch",
  "build": "webpack"
}
```

### Accessing the Project

Open your browser and navigate to: `http://localhost:8080/`

## Build for Production

To build the project for production:

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
