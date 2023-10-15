# Plate Vision

Plate Vision is a real-time license plate recognition system built with Next.js and Flask. It uses Python's AI libraries on the backend to process video files and identify license plates.

## Features

- Real-time license plate recognition from video files.
- Supports video file uploads in 'mp4', 'avi', 'mov' formats.
- Provides a user-friendly interface to start and stop the recognition process.
- Uses Flask as the API backend to handle video processing and license plate recognition.
- Uses Next.js for the frontend to provide a responsive and interactive user interface.

## Getting Started

### Prerequisites

- Node.js
- Python
- Flask

## Installation

First, install the dependencies with either of the below:

`npm install`

`yarn`

`pnpm install`


## Running the Application

To run the development server:

`npm run dev`

`yarn dev`

`pnpm dev`


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The Flask server will be running on [http://127.0.0.1:5328](http://127.0.0.1:5328).

## Scripts

- `uploadVideo`: This script handles the uploading of video files. It checks the file type and saves the file to the server.
- `downloadVideo`: This script handles the downloading of processed video files from the server.
- `startScript`: This script starts the license plate recognition process.
- `stopScript`: This script stops the license plate recognition process.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
