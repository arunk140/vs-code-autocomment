import { javaExamples, jsExamples, pythonExamples } from "./langData";

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
    'java': "/**"
};
var stopTokens = <StringTokens> {
    'javascript': "*/",
    'typescript': "*/",
    'python': "\"\"\"",
    'java': "*/"
};
var generateStr = <StringTokens> {
    'javascript': `/**
    * Docs for the above code:`,
    'typescript': `/**
    * Docs for the above code:`,
    'python': `\"\"\"
    Docs for the above code:`,
    'java': `/**
    * Docs for the above code:`
};
var languages = <LangExamples> {
    'javascript': jsExamples,
    'typescript': jsExamples,
    'python': pythonExamples,
    'java': javaExamples
};
export { startTokens, stopTokens, generateStr, languages};