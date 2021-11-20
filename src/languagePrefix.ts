import { jsExamples, pythonExamples } from "./langData";

interface LangExamples {
    [key: string]: {
        code: string;
        comment: string;
    }[];
};
interface StringTokens {
    [key: string]: string;
};

var startTokens = <StringTokens> {
    'javascript': "/**",
    'typescript': "/**",
    'python': "\"\"\"",
};
var stopTokens = <StringTokens> {
    'javascript': "*/",
    'typescript': "*/",
    'python': "\"\"\"",
};
var generateStr = <StringTokens> {
    'javascript': `/**
    * Docs for the above code:`,
    'typescript': `/**
    * Docs for the above code:`,
    'python': `\"\"\"
    Docs for the above code:`
};
var languages = <LangExamples> {
    'javascript': jsExamples,
    'typescript': jsExamples,
    'python': pythonExamples
};
export { startTokens, stopTokens, generateStr, languages};