package docscanner

import java.util.Collections.*
import scala.jdk.CollectionConverters.*
import scala.scalajs.js.timers.SetIntervalHandle
import scalajs.js.timers
import scalajs.js
import scalajs.js.Dynamic.global as g
import js.Dynamic.literal as l
import scalajs.js.JSConverters.*
import typings.electron.File
import typings.node.bufferMod.global.Buffer
import typings.node.fsMod
import typings.node.fsMod.PathLike
import typings.node.anon.*
import typings.obsidian.mod
import typings.obsidian.mod.FileSystemAdapter

import concurrent.ExecutionContext.Implicits.global
import scala.collection.mutable

object ScanSource:
  private type DOC = String

  private val path = g.require("path")

  private val separator : String = path.sep.asInstanceOf[String]

  private var running : Boolean = true
  private var appPath : String = _    // application path
  private var ext : String = _        // the source file name extension
  private var work : String = _       // start path segment of the source file name
  private var docPath : String = _    // document path
  //
  //
  private var sleepLength : Int = _   // number of seconds to sleep
  //
  // number of computation phases per iteration
  //
  private var phaseCount = 0          // the number of the current phase
  private val maxPhases  = 5          // max number of phases
  //
  // current files with 'ext' extension with paths
  //
  private var appFileListWithExt : List[List[String]] = _
  private var docFileListWithExt : List[String] = _

  private val srcAndDocLink = mutable.Set[ DOC ]() // docs that have a source

  /**
   * ## apply
   * At every 2 seconds interval get all the business rules from the latest source file and write it to the document file. if the
   * source file changes then delete the doc file and get newest comments from the source file
   *
   * 1. The 2 second interval must be made configurable. - Still to be implemented
   * 2. The following must be configurable
   *    1. Project file location
   *       2. Source file extension e.g. scala or java
   *       3. Relative path from the project file location to the start of the source
   *       4. Relative path of the extracted from the project path to the document location
   *
   * @param app
   * @param _appPath
   * @param _ext
   * @param _work
   * @param _docPath
   * @param _sleepLength
   * @return
   */
  def apply(app : mod.App, _appPath : String, _ext : String, _work : String, _docPath : String, _sleepLength : Int): SetIntervalHandle =
    //
    // initialization
    //
    path.basename("")

    appPath = _appPath
    ext = _ext
    work = _work
    docPath = _docPath
    sleepLength = _sleepLength
    //
    // make sure the doc path relative from vault exist - if not create this path
    //
    val vaultPath = app.vault.adapter.asInstanceOf[FileSystemAdapter].getBasePath()
    docPath = s"$vaultPath$separator$docPath"
    fsMod.mkdirSync(docPath, l(recursive =  true).asInstanceOf[fsMod.MakeDirectoryOptions])

    timers.setInterval(sleepLength)(this.run())

  private def run() : Unit =
    //
    // do work in phases - get all the source files.
    //
    if phaseCount == 1 then
      appFileListWithExt = walk(appPath
        .asInstanceOf[String])
        .filter(file => file.endsWith(ext))
        .grouped(10)
        .toList
    //
    // get list of document files
    //
    if phaseCount == 2 then
      docFileListWithExt = walk(docPath
        .asInstanceOf[String])
        .filter(file => file.endsWith(".md"))
    //
    // if the source if younger then the document file then
    //    load the lines from the source file and scan for comments.
    //    write comments out to document file
    //
    if phaseCount == 3 then
      if appFileListWithExt.nonEmpty then
        appFileListWithExt.head.foreach(srcFile =>
          val documentNameAndPath = s"$docPath$separator${createDocNameFromSourceName(srcFile)}"
          srcAndDocLink += documentNameAndPath
          //
          // if the document file does not exist then create an empty one
          //
          val docStat = try {
            val stat = fsMod.statSync(documentNameAndPath)
            ( false, stat )
          } catch {
            case i : js.JavaScriptException => println("File to be created")
            fsMod.writeFileSync(documentNameAndPath, "")
            fsMod.statSync(documentNameAndPath)
            ( true, null )
          }

          try {
            val srcStat = fsMod.statSync(srcFile)

            val srcModTime = srcStat.get.mtimeMs

            if docStat._1 || docStat._2.get.mtimeMs < srcModTime then
              //
              // get comment lines from the srcFile then open doc file for writing and write the lines to it
              //
              val srcLines = fsMod.readFileSync(srcFile, l(encoding = "utf8", flag = "r")
                .asInstanceOf[ObjectEncodingOptionsflagEncoding])
                .asInstanceOf[String]
                .split("\r?\n")

              fsMod.writeFile(documentNameAndPath, s"[Source](file:$srcFile)\n", err => ())
              fsMod.appendFile(documentNameAndPath, getBRulesComment(srcLines.toList).mkString("\n"), err => ())
          } catch {
            case ex : js.JavaScriptException => println("source removed")
          }
        )
        appFileListWithExt = appFileListWithExt.drop(1)
        phaseCount = 2


    if phaseCount == 4 then
      //
      // every document that does not have a source file must be removed
      //
      docFileListWithExt.foreach((fileName: String) =>
        if !srcAndDocLink.contains(fileName) then
          fsMod.unlinkSync(fileName)
      )
      srcAndDocLink.clear()
      phaseCount = 0

    phaseCount += 1

  /**
   *  get all files below dir recursively
   * @param dir the start folder
   * @return list of files contained in dir
   */
  private def walk(dir: String) : List[String] =

    val files= mutable.ListBuffer[String]()

    def walkRecurse(dir: String) : Unit =
      val dirFiles = fsMod.readdirSync(dir).toList
      dirFiles.foreach(file => {
        val p  = path.join(dir, file).asInstanceOf[PathLike]
        val stat = fsMod.lstatSync(p)
        if stat.get.isDirectory() then
          walkRecurse(s"$dir$separator$file")
        else
          files += s"$dir$separator$file"
      })

    walkRecurse(dir)
    files.toList

  /**
   * construct the document name given the source file name
   * @param sourceFile name used to construct the document name
   * @return the document name
   */
  private def createDocNameFromSourceName(sourceFile : String) =
    val filePath = sourceFile.split(separator).reverse.toList
    var stop = false
    val nameOfDoc = mutable.ListBuffer[String]()
    //
    // doc name is the fully qualified name from the work segment to the end of the file path
    //
    filePath.foreach(seg =>
      if seg.equalsIgnoreCase(work) then
        stop = true
      if !stop then
        nameOfDoc += seg
    )
    //
    // construct the name of the document
    //
    s"${nameOfDoc.reverse.mkString(".").dropRight(ext.length)}.md"

    /**
     * ## getBRulesComment
     * Pick up all block comments and business line comments return then to the caller.
     *
     * @param code the code to scan
     * @return the list of document lines
     */
  private def getBRulesComment(code : List[String]) : List[String] =
    var inComment = false

    val pattern1 = "^.*/\\*\\*.*$".r // start of block comment
    val pattern2 = "^.*\\*/.*$".r    // end of block comment
    val pattern3 = "^.*//bus.*$".r   // start of line comment WARNING FIX tis and next lines

    val inStringComment1 = """"[^"]*/\*\*[^"]*"""".r
    val inStringComment2 = """"[^"]*//bus[^"]*"""".r

    code.filter(line => {
      //
      // filter out the non comment lines
      //
      if (pattern1.matches(line) && inStringComment1.findAllIn(line).isEmpty) inComment = true
      val comment = inComment || (pattern3.matches(line) && inStringComment2.findAllIn(line).isEmpty)
      if (pattern2.matches(line)) inComment = false
      comment
    })
      .map(line => {
        //
        // depending on the type of comment get the text in the comment
        //
        if (pattern1.matches(line)) {

          val start = line.indexOf("/**")
          line.substring(start + 3) //+ "\n"

        } else if (pattern2.matches(line)) {

          ""

        } else if (pattern3.matches(line)) {

          val start = line.indexOf("//bus")
          line.substring(start + 5) //+ "\n"

        } else {

          val start = line.indexOf("*")
          line.substring(start + 1) //+ "\n"

        }
      })
