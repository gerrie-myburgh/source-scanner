package docscanner

import docscanner.ScanSource.gitBranchName

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
import utils.{Lexer, Utils}

import concurrent.ExecutionContext.Implicits.global
import scala.collection.mutable

object ScanSource:
  private type DOC = String

  private val path = g.require("path")

  private val separator : String = path.sep.asInstanceOf[String]

  private var gitBranchName : String = _ // the working branch defined in the settings
  private var running : Boolean = true
  private var appPath : String = _    // application path
  private var ext : String = _        // the source file name extension
  private var docPath : String = _    // document path abs path
  private var relDocPath : String = _ // document path abs rel from vault root
  private var groupBySize : Int = _   // number of documents to process at a time
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
  private val docAndContentString = mutable.HashMap[String, String]() // all documents created with the content



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
  def apply(app : mod.App, _appPath : String, _ext : String, _docPath : String, _sleepLength : Int, _groupBySize : Int, _gitBranchName : String): SetIntervalHandle =
    //
    // initialization
    //
    path.basename("")

    appPath = _appPath
    gitBranchName = _gitBranchName
    ext = _ext
    docPath = _docPath
    relDocPath = _docPath
    sleepLength = _sleepLength
    groupBySize = _groupBySize
    //
    // make sure the doc path relative from vault exist - if not create this path
    //
    val vaultPath = app.vault.adapter.asInstanceOf[FileSystemAdapter].getBasePath()
    docPath = s"$vaultPath$separator$docPath"
    fsMod.mkdirSync(docPath, l(recursive =  true).asInstanceOf[fsMod.MakeDirectoryOptions])

    timers.setInterval(sleepLength)(this.run())

  private def run() : Unit =
    //
    // if the current branch is the defined branch then go ahead an process else do not process
    //
    if phaseCount == 0 then
      if Utils.branchNameLocation.isEmpty then
        Utils.getBranchNameFileLocation(appPath)
      if  Utils.branchNameLocation.isDefined then
        val branchName = fsMod.readFileSync(Utils.branchNameLocation.get + Utils.separator + "current-branch.txt", l(encoding = "utf8", flag = "r")
          .asInstanceOf[ObjectEncodingOptionsflagEncoding])
          .asInstanceOf[String]
        println(branchName +  " "  + gitBranchName)
        if branchName.isEmpty || !branchName.equalsIgnoreCase(gitBranchName) then return ()

    //
    // do work in phases - get all the source files.
    //
    if phaseCount == 1 then
      appFileListWithExt = Utils.walk(appPath
        .asInstanceOf[String])
        .filter(file => file.endsWith(ext))
        .grouped(10)
        .toList
    //
    // get list of document files
    //
    if phaseCount == 2 then
      docFileListWithExt = Utils.walk(docPath
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
          val docName = createDocNameFromSourceName(srcFile)
          val documentNameAndPath = s"$docPath$separator$docName"
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

              val commentString = Lexer(srcLines)
              docAndContentString += ( s"$relDocPath${Utils.separator}$docName".dropRight(3) -> commentString )

              fsMod.writeFileSync(documentNameAndPath, s"[Source](file:$srcFile)\n\n")
              fsMod.appendFileSync(documentNameAndPath, commentString)
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
      phaseCount = -1
      docAndContentString.clear()

    phaseCount += 1

  /**
   * construct the document name given the source file name
   * @param sourceFile name used to construct the document name
   * @return the document name
   */
  private def createDocNameFromSourceName(sourceFile : String) =
    val docPath = s"${sourceFile.drop(appPath.length + 1).dropRight(ext.length)}.md"
    val docName = docPath.replace('/', '.')
    docName
