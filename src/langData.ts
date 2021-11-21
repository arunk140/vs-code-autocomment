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

var javaExamples = [
    {
        code: `public void setName(String newName) {   
            name = newName;
        }`,
        comment: `* Changes the name of this Student.
* This may involve a lengthy legal process.
* @param newName This Student's new name.`
    },
    {
        code: `public static void reverse(List<?> list) {
            int size = list.size();
            if (size < REVERSE_THRESHOLD || list instanceof RandomAccess) {
                for (int i=0, mid=size>>1, j=size-1; i<mid; i++, j--)
                    swap(list, i, j);
            } else {
                ListIterator fwd = list.listIterator();
                ListIterator rev = list.listIterator(size);
                for (int i=0, mid=list.size()>>1; i<mid; i++) {
                    Object tmp = fwd.next();
                    fwd.set(rev.previous());
                    rev.set(tmp);
                }
            }
        }`,
        comment: `* Reverses the order of the elements in the specified list.
*
* This method runs in linear time.
*
* @param  list the list whose elements are to be reversed.
* @throws UnsupportedOperationException if the specified list or
*         its list-iterator does not support the set operation.`
    },
    {
        code: `public static <T> void fill(List<? super T> list, T obj) {
            int size = list.size();
        
            if (size < FILL_THRESHOLD || list instanceof RandomAccess) {
                for (int i=0; i<size; i++)
                    list.set(i, obj);
            } else {
                ListIterator<? super T> itr = list.listIterator();
                for (int i=0; i<size; i++) {
                    itr.next();
                    itr.set(obj);
                }
            }
        }`,
        comment: `* Replaces all of the elements of the specified list with the specified
* element.
*
* This method runs in linear time.
*
* @param  list the list to be filled with the specified element.
* @param  obj The element with which to fill the specified list.
* @throws UnsupportedOperationException if the specified list or its
*         list-iterator does not support the <tt>set</tt> operation.`
    },
    {
        code: `public static double toMetric(int feet, int inches) {
            int total = feet * IN_PER_FOOT + inches;
            return total * CM_PER_INCH;
        }`,
        comment: `* Converts a length in feet and inches to centimeters.
*
* @param feet how many feet
* @param inches how many inches
* @return length in centimeters`
    }
];

var phpExamples = [
    {
        code: `function compute_tax($amount, $tax_rate) {
            $tax_amount = $0;
            $tax_amount = $amount * ($tax_rate / 100);
            return $tax_amount;
        }`,
        comment: `* Computer Value Added Tax
*
* @access public
* @param float $amount The amount to compute tax on
* @param float $tax_rate Tax Rate in percentage
* @return float $tax_amount The amount of tax to be added to the amount`
    }
];

export { jsExamples, pythonExamples, javaExamples, phpExamples };