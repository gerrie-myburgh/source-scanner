package utils

/**
 * # object Lexer
 * The source lexer scans and records all comments that looks like a block comment , allowing nested comments
 * and line comments marked as //bus up to the first eof or /r or /n. Other characters excluding \" are ignored. String
 * literals are parsed in order to prevent seeing block comments \/\*\* and \/\/ in string literals as comments. ^lexer-00
 *
 */
object Lexer:
  private var parseString: String = _
  private var idx = 0
  private val parsed = StringBuilder()
  private var inBlockComment = 0

  /*
  * get a character from the parse string
  */
  private def getChar: (Boolean, Char, Int) =
    if idx == parseString.length then
      (false, ' ', idx)
    else
      val ret = (true, parseString.charAt(idx), idx)
      idx += 1
      ret

  /*
  * is the next number of characters same as the str
  */
  private def isString(str: String) =
    if str.length > parseString.length - idx then
      false
    else
      str.equals(parseString.substring(idx, str.length + idx))

  /*
  * get the string literal
  */
  private def getString() =
    while
      val ch = getChar
      ch._1 && ch._2 != '"'
    do
      ()

  /*
  * get a line business comment
  */
  private def lineComment() =
    idx += 4
    while
      val ch = getChar
      val inCommentLine = ch._1 && ch._2 != '\n' && ch._2 != '\r'
      if inCommentLine then
        parsed += ch._2
        true
      else
        parsed += '\n'
        false
    do
      ()

  /*
  * capture all the characters up to str
  */
  private def captureCharsUpTo(str: String): Unit =
    val firstChar = str.charAt(0)
    val restStr = str.substring(1)
    idx += 2
    while
      val ch = getChar
      if ch._1 && ch._2 == '/' && isString("**") then
        idx -= 1
        scan
      if ch._1 && ch._2 == firstChar && isString(restStr) then
        idx += 1
        inBlockComment -= 1
        false
      else
        parsed += ch._2
        true
    do
      ()

  /*
  * scan the parse string for block and line comments
  */
  private def scan =
    val ch = getChar
    if ch._1 then
      ch._2 match
        case '/' if isString("**") => {
          inBlockComment += 1
          captureCharsUpTo("*/")
        }
        case '/' if isString("/bus") => {
          lineComment()
        }
        case '"' => {
          getString()
        }
        case _ => ()
      true
    else
      false

  /*
  * parse the input str for comments
  */
  def apply(str: String) =

    parseString = str
    idx = 0
    parsed.clear()
    inBlockComment = 0

    while
      scan
    do
      ()
    parsed.toString().replaceAll("""(\r?\n)[\t ]+\*""", "\n")
