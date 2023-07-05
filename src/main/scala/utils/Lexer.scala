package utils

object Lexer:
  private var parseString: String = _
  private var idx = 0
  private val parsed = StringBuilder()
  private var inBlockComment = 0

  private def getChar: (Boolean, Char, Int) =
    if idx == parseString.length then
      (false, ' ', idx)
    else
      val ret = (true, parseString.charAt(idx), idx)
      idx += 1
      ret

  private def isString(str: String) =
    if str.length > parseString.length - idx then
      false
    else
      str.equals(parseString.substring(idx, str.length + idx))

  private def getString() =
    while
      val ch = getChar
      ch._1 && ch._2 != '"'
    do
      ()

  private def lineComment() =
    idx += 1
    while
      val ch = getChar
      val inCommentLine = ch._1 && ch._2 != '\n' && ch._2 != '\r'
      if inCommentLine then
        parsed += ch._2
        true
      else
        false
    do
      ()

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

  private def scan =
    val ch = getChar
    if ch._1 then
      ch._2 match
        case '/' if isString("**") => {
          inBlockComment += 1
          captureCharsUpTo("*/")
        }
        case '/' if isString("/") => {
          lineComment()
        }
        case '"' => {
          getString()
        }
        case _ => ()
      true
    else
      false

  def apply(str: String) =

    parseString = str
    idx = 0
    parsed.clear()
    inBlockComment = 0

    while
      scan
    do
      ()
    //
    // remove leading space/tabs followd by \*
    //
    parsed.toString().replaceAll("""(\r?\n)[\t ]+\*""", "\n")
