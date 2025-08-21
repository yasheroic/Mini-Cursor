import "dotenv/config";
import { OpenAI } from "openai";
import {exec} from "node:child_process"
 
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY
});

function getWeather(city) {
  return `cityname: ${city} weather: 20 degrees Celsius`
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      return resolve(`stdout: ${stdout}\nstderr: ${stderr}`);
    });
  });
}

const TOOLS_MAP = {
  getWeatherInfo: getWeather,
  execCommand: execCommand,
}

const SYSTEM_PROMPT = `
You are an helfull AI Assistant who is designed to resolve user query.
You work on START, THINK, ACTION, OBSERVE and OUTPUT Mode.
In the start phase, user gives a query to you.
Then, you THINK how to resolve that query atleast 3-4 times and make sure that If there is a need to call a tool, you call an ACTION event with tool and inpu If there is an action call, wait for the OBSERVE that is output of the tool.
Based on the OBSERVE from prev step, you either output or repeat the loop.

Rules:
- Always wait for next step.
- Always output a single step and wait for the next step.
- Output must be strictly JSON
- Only call tool action from Available tools only
- Strictly follow the output format in JSON format
 

Available Tools:
1. execCommand(command: string): Executes any shell command and returns the output. Can be used to read files, list directories, run commands, create files, write code, build applications, etc. This is your primary tool for any file operations or development tasks.
2. getWeatherInfo(city: string): Gets weather information for a specific city

Example:
START: what is the weather in Tokyo?
THINK: The user is asking for the weather in Tokyo.
THINK: From the available tools i can call getWeatherInfo tool with city as Tokyo.
ACTION: getWeatherInfo(city: Tokyo)
OBSERVE: The weather in Tokyo is 20 degrees Celsius.
OUTPUT: Hey, the weather in Tokyo is 20 degrees Celsius.

START: what is in my package.json file?
THINK: The user is asking for the contents of their package.json file.
THINK: I can use execCommand to read the file using cat command.
ACTION: execCommand(cat package.json)
OBSERVE: The package.json file contains: {"name": "my-project", "version": "1.0.0", ...}
OUTPUT: Here's what's in your package.json file: {"name": "my-project", "version": "1.0.0", ...}

 

Output Example:
{ "role": "user", "content": "What is weather of Patiala?" } 
{ "step": "think", "content": "The user is asking for the weather in Patiala" }
{ "step": "think", "content": "From the available tools i can call getWeatherInfo tool with city as Patiala" }
{ "step": "action", "tool": "getWeatherInfo", "input": "city: Patiala" }
{ "step": "observe", "content": "The weather in Patiala is 20 degrees Celsius" }
{ "step": "output", "content": "Hey, the weather in Patiala is 20 degrees Celsius" }

{ "role": "user", "content": "What is in my package.json file?" }
{ "step": "think", "content": "The user is asking for the contents of their package.json file" }
{ "step": "think", "content": "I can use execCommand to read the file using cat command" }
{ "step": "action", "tool": "execCommand", "input": "cat package.json" }
{ "step": "observe", "content": "The package.json file contains: {...}" }
{ "step": "output", "content": "Here's what's in your package.json file: {...}" }

Output Format:
{ "step": "string", "tool": "string", "input": "string", "content": "string" }

`;

async function processUserQuery(userQuery) {
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT
    }
  ];

  messages.push({ 'role': 'user', 'content': userQuery });

  while (true) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: messages,
      });
      
      const assistantMessage = response.choices[0].message.content;
      messages.push({ 'role': 'assistant', 'content': assistantMessage });
      
      const parsedResponse = JSON.parse(assistantMessage);
      
      if (parsedResponse.step === 'think') {
        console.log(`THINK: ${parsedResponse.content}`);
        continue;
      }
      
      if (parsedResponse.step === 'action') {
        const tool = parsedResponse.tool;
        const input = parsedResponse.input;
        
        if (!TOOLS_MAP[tool]) {
          console.log(`ERROR: Tool ${tool} not found`);
          continue;
        }
        
        let toolOutput;
        try {
          if (tool === 'getWeatherInfo') {
            // Extract city from input like "city: Patiala"
            const city = input.replace('city:', '').trim();
            toolOutput = await TOOLS_MAP[tool](city);
          } else if (tool === 'execCommand') {
            toolOutput = await TOOLS_MAP[tool](input);
          } else {
            toolOutput = await TOOLS_MAP[tool](input);
          }
          
          messages.push({ 'role': 'user', 'content': toolOutput });
        } catch (error) {
          console.log(`ERROR executing tool ${tool}: ${error.message}`);
          messages.push({ 'role': 'user', 'content': `Error: ${error.message}` });
        }
        continue;
      }
      
      if (parsedResponse.step === 'observe') {
        console.log(`OBSERVE: ${parsedResponse.content}`);
        continue;
      }
      
      if (parsedResponse.step === 'output') {
        console.log(`OUTPUT: ${parsedResponse.content}`);
        break;
      }
      
    } catch (error) {
      console.log(`ERROR: ${error.message}`);
      break;
    }
  }
}

async function main() {
  try {
    const userQuery = 'create me a simple todo app using html css js';
    await processUserQuery(userQuery);
  } catch (error) {
    console.log(`ERROR: ${error.message}`);
  }
}

main();

//Making change to test ai code review