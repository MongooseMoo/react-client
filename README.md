# Mongoose React Client

The Mongoose React Client is a user-friendly and feature-rich Multi-User Dungeon (MUD) client tailored exclusively for Project Mongoose.
With support for a variety of MUD protocols, including GMCP, MCMP, and MCP, the Mongoose React Client delivers a seamless and immersive gaming experience for end users.

## Key Features

* Exclusive connection to Project Mongoose
* Support for multiple MUD protocols, such as GMCP, MCMP, and MCP
* Enhanced protocol support and features:
* Vivid ANSI color for a visually engaging experience
* MCMP with 3D audio support for immersive gameplay
* Desktop notifications for important messages
* Optional TTS support with configurable voice
* Automatic login support
* Intuitive and lightweight interface
* Save session logs for later review or analysis
* Designed for an unparalleled and enjoyable gaming experience

## Official Build

The official build of the Mongoose React Client can be found at [https://client.mongoose.world.](https://client.mongoose.world)
This instance updates after CI validates a commit on the master branch. Deployment
publishes the same production build that passed the browser checks.

## Installation for Local Development

To install and run the Mongoose React Client on your local machine for development purposes, follow these steps:

1. Clone the repository from GitHub:
```bash
git clone https://github.com/MongooseMOO/react-client.git
```
2. Change to the cloned directory:
```bash
cd react-client
```
3. Use Node.js 22 (see `.node-version`) and install the locked dependencies:
```bash
npm ci
```
4. Start the development server:
```bash
npm start
```
5. Open your browser and navigate to `http://localhost:3000` to start using the Mongoose React Client.

## Usage

To use the Mongoose React Client, visit the official build at [https://client.mongoose.world](https://client.mongoose.world) or run the app on your local machine following the installation steps. Connect to the Project Mongoose server and enjoy an unparalleled gaming experience with advanced features like ANSI color, 3D audio, and desktop notifications. Additionally, you can save session logs for future reference or analysis.

## Contributing

We welcome contributions from the community. If you're interested in contributing to the Mongoose React Client, please feel free to submit pull requests or open issues on the GitHub repository.

### CI checks

Pull requests, merge queues, and pushes to `master` run type checking, the full
Vitest suite, and the production browser check on Linux with Node.js 22. To run
the application checks locally after `npm ci`:

```bash
npm run typecheck
npm test
npx playwright install chromium
npm run test:audio-cache
```

The last command builds the application and checks lazy feature loading, the
real Monaco editor, and service-worker audio caching in Chromium. CI also runs
actionlint 1.7.12 and zizmor 1.30.1 (offline) over the workflows. The existing
`npm run lint` command only checks staged files; it is not a CI-wide lint gate.

Only successful `master` pushes can publish to the existing `gh-pages` branch.
PR checks have read-only repository permissions. Deployment alone has write
permission, downloads the checked build, and skips superseded master revisions.
Dependabot maintains the pinned action revisions weekly.

## Acknowledgments

We would like to extend our gratitude to the developers and contributors of Project Mongoose for their unwavering support and dedication in creating an extraordinary MUD experience.
