import { ChatGroq } from "@langchain/groq";
import { createEvent, getEvents } from "./tools.js";
import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

dotenv.config();

const tools = [createEvent, getEvents];

const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
}).bindTools(tools);

// Assistant Node
async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await llm.invoke(state.messages)

    return { messages: [response] }
}

// Tool Node
const toolNode = new ToolNode(tools)

// Conditional function to determine the next node
function shouldContinue(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage

    if (lastMessage.tool_calls?.length) {
        return "tools"
    }

    return "__end__"
}

// Addind edges
const graph = new StateGraph(MessagesAnnotation)
    .addNode("assistant", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "assistant")
    .addEdge("tools", "assistant")
    .addConditionalEdges("assistant", shouldContinue, {
        "__end__": END,
        "tools": "tools"
    })

const app = graph.compile({})

async function main() {
    const result = await app.invoke({
        messages: [{ role: "user", content: "Do I have any meetings today?" }]
    })

    console.log("AI: ", result.messages[result.messages.length - 1].content)
}

main()