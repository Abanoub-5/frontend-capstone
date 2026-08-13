import { scoreLead } from "./tools/scoreLead.js";

const result = await scoreLead.execute({
  companySize: 150,
  budget: 15000,
  engagement: "high",
});

console.log(result);