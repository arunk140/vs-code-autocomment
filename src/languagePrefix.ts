interface LangExamples {
    [key: string]: {
        code: string;
        comment: string;
    }[];
};
interface StringTokens {
    [key: string]: string;
};

var jsExamples = [
    {
        code: `function generateTableHead(table, data) {
            const thead = table.createTHead();
            const row = thead.insertRow();
            for (const i of data) {
              const th = document.createElement("th");
              const text = document.createTextNode(i);
              th.appendChild(text);
              row.appendChild(th);
            }
        }`,
        comment: 
        `* Generates a table head
* @param {HTMLTableElement} table - The target HTML table
* @param {Array} data - The array of cell header names
* @return {void}`,
    },
    {
        code: `var toggleVisibility = function (selector, toggle) {
            if (!selector) return;
            var elem = document.querySelector(selector);
            if (!elem) return;
            elem.classList.add('active');
            if (toggle) {
                toggle.classList.add('active');
            }
            elem.focus()
            if (document.activeElement.matches(selector)) return;
            elem.setAttribute('tabindex', '-1');
            elem.focus();
        };`,
        comment: 
        `* Toggle visibility of a content tab
* @param  {String} selector Selector for the element
* @param  {Node}   toggle   The element that triggered the tab
* @return {void}`,
    },
    {
        code: `function areaOfKite(a, b, angle)
        {
            angle = angle * PI;
            var area = a * b * Math.sin(angle);
            return area.toFixed(4);
        }`,
        comment: 
        `* Calculates the area of a kite
* @param  {Number} a The length of the base
* @param  {Number} b The length of the height
* @param  {Number} angle The angle of the kite
* @return {Number} The area of the kite`,
    }
];

var pythonExamples = [
    {
        code: `def string_reverse(str1): 
        reverse_str1 = ''
        i = len(str1)
        while i > 0:
            reverse_str1 += str1[i - 1]
            i = i- 1
        return reverse_str1`,
        comment: 
        `Returns the reversed String.

    Parameters:
        str1 (str):The string which is to be reversed.

    Returns:
        reverse(str1):The string which gets reversed.`
    },
    {
        code: `def add_binary(a, b):
        binary_sum = bin(a+b)[2:]
        return binary_sum`,
        comment: 
        `Returns the sum of two decimal numbers in binary digits.

    Parameters:
        a (int): A decimal integer
        b (int): Another decimal integer

    Returns:
        binary_sum (str): Binary string of the sum of a and b`
    },
    {
        code: `def info(self, additional=""):
        print(f'My name is {self.name} {self.surname}. I am {self.age} years old.' + additional)`,
        comment: 
        `Prints the person's name and age. If the argument 'additional' is passed, then it is appended after the main info.

    Parameters:
        additional (str, optional): More info to be displayed (default is None)
    Returns:
        None`
    },
    {
        code: `def get_spreadsheet_cols(file_loc, print_cols=False):
        file_data = pd.read_excel(file_loc)
        col_headers = list(file_data.columns.values)
    
        if print_cols:
            print("\\n".join(col_headers))
    
        return col_headers`,
        comment: 
        `Gets and prints the spreadsheet's header columns

    Parameters:
        file_loc (str): The file location of the spreadsheet
        print_cols (bool, optional): A flag used to print the columns 
            to the console (default is False)

    Returns:
        col_headers (list) : a list of strings used that are the header columns`
    }
];

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