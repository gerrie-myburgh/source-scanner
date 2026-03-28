export class LexerRules {
    private parseString: string;
    private meta: string;
    private idx = 0;
    inBlockComment = 0;

    private parsed: string = '';
    private java_escape_chars = ['t','b','n','r','f','\'','"','\\'];
    
    /**
     * Gets the next character from the parse string
     * @returns A tuple containing [success, character, index]
     */
    private getChar() {
      if (this.idx == this.parseString.length) {
        return [false, ' ' , this.idx]
      } else {
        const ret = [true, this.parseString.charAt(this.idx), this.idx];
        this.idx += 1;
        return ret;
      }
    }
    
    /**
     * Checks if the next characters in the parse string match the given string
     * @param str - The string to check for
     * @returns True if the next characters match the given string
     */
    private isString(str : string) {
      if (str.length > this.parseString.length - this.idx) {
        return false
      } else {
        return str == this.parseString.substring(this.idx, str.length + this.idx);
      }
    }

    /**
     * Parses a string literal from the source code
     */
    private getString() {
        do {
            var ch = this.getChar();
            if (ch[0] && ch[1] == '\\') {
                if (this.java_escape_chars.contains(ch[1])) { 
                    ch = this.getChar(); 
                } else { 
                    this.idx =- 1; 
                }
            }
        } while(ch[0] && ch[1] != '"');
    }

    /**
     * Parses a line business comment (//bus)
     */
    private lineComment() {
        this.idx += 4
        var runWhile = false;
        do {
            const ch = this.getChar();
            var inCommentLine = ch[0] && ch[1] != '\n' && ch[1] != '\r'
            if (inCommentLine) {
                this.parsed = this.parsed + ch[1];
                runWhile = true;
            } else {
                this.parsed = this.parsed + '\n';
                runWhile = false;
            }
        } while(runWhile)
    }  

    /**
     * Captures characters until the specified string is found
     * @param str - The string to capture up to
     */
    private captureCharsUpTo(str: String) {
        const firstChar = str.charAt(0)
        const restStr = str.substring(1)
        this.idx += 2
        var runWhile = false;

        do {
            var ch = this.getChar();
            if (ch[0] && ch[1] == '/' && this.isString("**")) {
                this.idx -= 1
                this.scan()
            }
            if (ch[0] && ch[1] == firstChar && this.isString(restStr)){
                this.idx += 1
                this.inBlockComment -= 1
                runWhile = false
            } else {
                this.parsed = this.parsed + ch[1];
                runWhile = true
            }
        } while (runWhile)
    }

    /**
     * Scans the parse string for block and line comments
     * @returns True if scanning should continue, false if end of string reached
     */
    private scan() {
        const ch = this.getChar();
        if (ch[0]) {
            if (ch[1] == '/' && this.isString("**")) {
                this.inBlockComment += 1
                this.captureCharsUpTo("*/")
            } else if (ch[1] == '/' && this.isString("/bus")) {
                this.lineComment()
            } else if (ch[1] == '/' && this.isString("/meta")) {
                //metaComment()
            } else if (ch[1] == '"') {
                this.getString()
            }
          return true;
        } else {
          return false;
        }
    }

    /**
     * Parses source code to extract comments
     * @param src - The source code to parse
     * @returns The extracted comments as a string
     */
    parseSource(src : string)  {
        this.parseString = src
        this.idx = 0
        this.parsed = '';
        this.meta = '';
        this.inBlockComment = 0;

        do {} while (this.scan());

        return this.parsed.replace(/\n\s*\*/gi,'\n');
    }
}