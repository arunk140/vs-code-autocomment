import { javaExamples, jsExamples, phpExamples, pythonExamples } from "./langData";

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
    'java': "/**",
    'php': "/**"
};
var stopTokens = <StringTokens> {
    'javascript': "*/",
    'typescript': "*/",
    'python': "\"\"\"",
    'java': "*/",
    'php': "*/"
};
var generateStr = <StringTokens> {
    'javascript': `/**
    * Docstring for the above code:`,
    'typescript': `/**
    * Docstring for the above code:`,
    'python': `\"\"\"
    Docstring for the above code:`,
    'java': `/**
    * Docstring for the above code:`,
    'php': `/**
    * Docstring for the above code:`
};
var languages = <LangExamples> {
    'javascript': jsExamples,
    'typescript': jsExamples,
    'python': pythonExamples,
    'java': javaExamples,
    'php': phpExamples
};
export { startTokens, stopTokens, generateStr, languages};