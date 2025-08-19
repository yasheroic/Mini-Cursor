# AI Assistant with Tool Execution

A Node.js application that demonstrates an AI assistant capable of executing shell commands and using custom tools through a structured workflow system.

## Features

- **AI-Powered Assistant**: Uses OpenAI's GPT-4o-mini model for intelligent responses
- **Tool Execution**: Can execute shell commands using Node.js child_process
- **Structured Workflow**: Follows START → THINK → ACTION → OBSERVE → OUTPUT pattern
- **Custom Tools**: Includes weather information and command execution capabilities
- **JSON Response Format**: Structured communication with the AI model

## Prerequisites

- Node.js (v16 or higher)
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mini-cursor-project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
OPEN_AI_KEY=your_openai_api_key_here
```

## Usage

Run the application:
```bash
node index.js
```

The application will process the predefined user query and execute the AI workflow.

## How It Works

1. **START**: User provides a query
2. **THINK**: AI analyzes the query and determines the best approach
3. **ACTION**: AI calls appropriate tools (execCommand, getWeatherInfo)
4. **OBSERVE**: Tool execution results are captured
5. **OUTPUT**: Final response is generated and displayed

## Available Tools

- **execCommand(command)**: Executes shell commands and returns output
- **getWeatherInfo(city)**: Provides weather information for a city

## Example Workflows

- Reading file contents
- Creating applications
- Executing shell commands
- Getting weather information

## Project Structure

```
mini-cursor-project/
├── index.js          # Main application file
├── package.json      # Project dependencies
├── .env             # Environment variables (create this)
└── README.md        # This file
```

## Configuration

The application uses environment variables for configuration:
- `OPEN_AI_KEY`: Your OpenAI API key

## Dependencies

- `openai`: OpenAI API client
- `dotenv`: Environment variable management


## Contributing

Feel free to submit issues and enhancement requests!
