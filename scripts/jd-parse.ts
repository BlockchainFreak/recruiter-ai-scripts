import fs from "fs";
import { z } from "zod";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "langchain/prompts";
import { encoding_for_model } from "@dqbd/tiktoken";
import { createStructuredOutputChainFromZod } from "langchain/chains/openai_functions";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";


const jdOutputSchema = z.object({
  jobTitle: z.string().describe("The title of the job position."),
  location: z.enum(["remote", "onsite", "hybrid"]).optional().describe("The work location for the job. It can be remote, onsite, or hybrid."),
  type: z.enum(["full-time", "part-time", "contract", "internship", "other"]).optional().describe("The type of employment. It can be full-time, part-time, contract, or internship."),
  experience: z.object({
    skills: z.array(z.object({
      skillName: z.string().describe("The name of the skill required for the job."),
      category: z.enum(["programming language", "framework", "tool", "industry"]).optional().describe("The category of the skill. It can be a programming language, framework, tool, or industry."),
      minExperience: z.number().optional().describe("The minimum experience required for the skill, in years."),
      priority: z.enum(["required", "preferred"]).optional().describe("The priority of the skill. It can be either required or preferred. If not specified, it is assumed to be required."),
    })).describe("An array of skills required for the job."),
  }).describe("The experience requirements for the job.")
});

type Course = z.infer<typeof jdOutputSchema>

const prompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      "You are a Technical Recruiter and you have to understand the job description and translate them into technical requirements."
    ),
    HumanMessagePromptTemplate.fromTemplate("{text}"),
  ],
  inputVariables: ["text"],
});

const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-0613", temperature: 0 });

const chain = createStructuredOutputChainFromZod(jdOutputSchema, {
  prompt,
  llm,
});

const safeWrite = (path: string, data: Object | Array<any>) => {
  const dirs = path.split("/");
  for (let i = 1; i < dirs.length; i++) {
    const dir = dirs.slice(0, i).join("/")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2))
}

const CATEGORY = "gaper"

async function main() {

  const listResumes = fs.readdirSync(`inputs/${CATEGORY}`).map(fn => ({
    filename: fn,
    filepath: `inputs/${CATEGORY}/${fn}`
  }));

  listResumes.forEach(async ({ filename, filepath }) => {
    const text = (await new PDFLoader(filepath, { splitPages: false }).load())[0].pageContent
    const results = await chain.call({ text });
    safeWrite(`outputs/${CATEGORY}/${filename}`.replace(".pdf", ".json"), results)
  });
}

main()